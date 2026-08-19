import type { Socket } from "socket.io";

import {
    getRoom,
} from "../services/room.service.js";
import { ApiError } from "../utils/api-error.js";

const ROOM_CHANNEL_PREFIX = "room:";
const USER_CHANNEL_PREFIX = "user:";
const ROOM_ID_PATTERN = /^[a-f\d]{24}$/i;

type RoomSubscriptionErrorCode =
    | "AUTH_REQUIRED"
    | "INVALID_ROOM_ID"
    | "ROOM_NOT_FOUND"
    | "ROOM_ACCESS_DENIED"
    | "REALTIME_ERROR";

export type RoomSubscriptionAck =
    | {
        ok: true;
        roomId: string;
    }
    | {
        ok: false;
        code: RoomSubscriptionErrorCode;
        message: string;
    };

const getRoomChannel = (roomId: string): string =>
    `${ROOM_CHANNEL_PREFIX}${roomId}`;

const getUserChannel = (userId: string): string =>
    `${USER_CHANNEL_PREFIX}${userId}`;

const getRoomId = (payload: unknown): string | undefined => {
    if (
        typeof payload !== "object" ||
        payload === null ||
        !("roomId" in payload)
    ) {
        return undefined;
    }

    const roomId = payload.roomId;

    if (
        typeof roomId !== "string" ||
        !ROOM_ID_PATTERN.test(roomId)
    ) {
        return undefined;
    }

    return roomId.toLowerCase();
};

const invalidRoomId = (): RoomSubscriptionAck => ({
    ok: false,
    code: "INVALID_ROOM_ID",
    message: "Invalid room ID.",
});

const authenticationRequired = (): RoomSubscriptionAck => ({
    ok: false,
    code: "AUTH_REQUIRED",
    message: "Realtime authentication is required.",
});

const getSubscriptionError = (
    error: unknown
): RoomSubscriptionAck => {
    if (error instanceof ApiError) {
        if (error.statusCode === 404) {
            return {
                ok: false,
                code: "ROOM_NOT_FOUND",
                message: "Room not found.",
            };
        }

        if (error.statusCode === 400) {
            return invalidRoomId();
        }
    }

    return {
        ok: false,
        code: "REALTIME_ERROR",
        message: "Unable to subscribe to this room.",
    };
};

const subscriptionQueues = new WeakMap<
    Socket,
    Promise<void>
>();

const enqueueSubscriptionOperation = (
    socket: Socket,
    operation: () => Promise<void>
): void => {
    const previous =
        subscriptionQueues.get(socket) ?? Promise.resolve();
    const current = previous
        .catch(() => undefined)
        .then(operation);

    subscriptionQueues.set(socket, current);

    void current.finally(() => {
        if (subscriptionQueues.get(socket) === current) {
            subscriptionQueues.delete(socket);
        }
    }).catch(() => undefined);
};

const getAuthenticatedUserId = (
    socket: Socket
): string | undefined => {
    const userId = socket.data.userId;

    return typeof userId === "string"
        ? userId
        : undefined;
};

const registerSubscribeHandler = (socket: Socket): void => {
    socket.on(
        "room:subscribe",
        (
            payload: unknown,
            acknowledge?: (response: RoomSubscriptionAck) => void
        ) => {
            enqueueSubscriptionOperation(socket, async () => {
                const respond =
                    typeof acknowledge === "function"
                        ? acknowledge
                        : () => undefined;
                const roomId = getRoomId(payload);

                if (!roomId) {
                    respond(invalidRoomId());
                    return;
                }

                const userId = getAuthenticatedUserId(socket);

                if (!userId || socket.data.subscriptionClosed) {
                    respond(authenticationRequired());
                    return;
                }

                try {
                    const room = await getRoom(roomId);
                    const isMember = room.members.some(
                        (member) =>
                            member.user.toString() === userId
                    );

                    if (!isMember) {
                        respond({
                            ok: false,
                            code: "ROOM_ACCESS_DENIED",
                            message:
                                "You are not a member of this room.",
                        });
                        return;
                    }

                    const subscribedRoomId =
                        socket.data.subscribedRoomId;

                    if (subscribedRoomId === roomId) {
                        respond({ ok: true, roomId });
                        return;
                    }

                    if (subscribedRoomId) {
                        socket.leave(
                            getRoomChannel(subscribedRoomId)
                        );
                    }

                    await socket.join(getRoomChannel(roomId));
                    socket.data.subscribedRoomId = roomId;

                    respond({ ok: true, roomId });
                } catch (error) {
                    respond(getSubscriptionError(error));
                }
            });
        }
    );
};

const registerUnsubscribeHandler = (socket: Socket): void => {
    socket.on(
        "room:unsubscribe",
        (
            payload: unknown,
            acknowledge?: (response: RoomSubscriptionAck) => void
        ) => {
            enqueueSubscriptionOperation(socket, async () => {
                const respond =
                    typeof acknowledge === "function"
                        ? acknowledge
                        : () => undefined;
                const roomId = getRoomId(payload);

                if (!roomId) {
                    respond(invalidRoomId());
                    return;
                }

                if (
                    socket.data.subscribedRoomId === roomId
                ) {
                    socket.leave(getRoomChannel(roomId));
                    socket.data.subscribedRoomId = undefined;
                }

                respond({ ok: true, roomId });
            });
        }
    );
};

/**
 * Registers transport-only room subscription handlers for an authenticated
 * socket. These handlers never create, remove, or otherwise mutate a Room.
 */
export const registerRoomSubscriptionHandlers = (
    socket: Socket
): void => {
    socket.data.subscriptionClosed = false;

    const userId = getAuthenticatedUserId(socket);

    if (userId) {
        void socket.join(getUserChannel(userId));
    }

    registerSubscribeHandler(socket);
    registerUnsubscribeHandler(socket);

    socket.on("disconnecting", () => {
        const subscribedRoomId =
            socket.data.subscribedRoomId;

        socket.data.subscriptionClosed = true;

        if (subscribedRoomId) {
            socket.leave(getRoomChannel(subscribedRoomId));
            socket.data.subscribedRoomId = undefined;
        }
    });

    socket.on("disconnect", () => {
        subscriptionQueues.delete(socket);
    });
};
