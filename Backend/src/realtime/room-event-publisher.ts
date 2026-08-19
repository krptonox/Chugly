import { randomUUID } from "node:crypto";
import type { Server } from "socket.io";

import type { IRoom } from "../models/room.model.js";
import type { IRoomMember } from "../types/room.types.js";

const ROOM_CHANNEL_PREFIX = "room:";
const USER_CHANNEL_PREFIX = "user:";

export const ROOM_REALTIME_EVENTS = {
    memberJoined: "room.member_joined",
    memberLeft: "room.member_left",
    memberRemoved: "room.member_removed",
    removedFromRoom: "room.removed_from_room",
    closed: "room.closed",
} as const;

type AnonymousMemberPayload = {
    membershipId: string;
    displayName: string;
    role?: IRoomMember["role"];
    joinedAt?: string;
};

type RoomMembershipEventBase = {
    eventId: string;
    roomId: string;
    occurredAt: string;
    memberCount: number;
    maxMembers: number;
};

export type RoomMemberJoinedEvent =
    RoomMembershipEventBase & {
        member: Required<AnonymousMemberPayload>;
    };

export type RoomMemberLeftEvent =
    RoomMembershipEventBase & {
        member: Pick<
            Required<AnonymousMemberPayload>,
            "membershipId" | "displayName"
        >;
    };

export type RoomMemberRemovedEvent =
    RoomMembershipEventBase & {
        member: Pick<
            Required<AnonymousMemberPayload>,
            "membershipId" | "displayName"
        >;
    };

export type RoomRemovedFromRoomEvent = {
    eventId: string;
    roomId: string;
    membershipId: string;
    occurredAt: string;
    reason: "admin_removed";
};

export type RoomClosedEvent = {
    eventId: string;
    roomId: string;
    occurredAt: string;
    reason: "creator_closed";
};

let realtimeServer: Server | undefined;

const getRoomChannel = (roomId: string): string =>
    `${ROOM_CHANNEL_PREFIX}${roomId}`;

const getUserChannel = (userId: string): string =>
    `${USER_CHANNEL_PREFIX}${userId}`;

const getEventMetadata = (roomId: string) => ({
    eventId: randomUUID(),
    roomId,
    occurredAt: new Date().toISOString(),
});

const toAnonymousMemberPayload = (
    member: IRoomMember
): Required<AnonymousMemberPayload> => ({
    membershipId: member._id.toString(),
    displayName: member.displayName,
    role: member.role,
    joinedAt: member.joinedAt.toISOString(),
});

const logPublishingFailure = (eventName: string): void => {
    console.error(
        `[realtime] Failed to publish ${eventName}`
    );
};

const logCleanupFailure = (roomId: string): void => {
    console.error(
        `[realtime] Failed to clean up room subscription ${roomId}`
    );
};

const safelyRemoveSocketsFromRoom = (
    roomId: string,
    userId?: string
): void => {
    if (!realtimeServer) {
        return;
    }

    try {
        const roomChannel = getRoomChannel(roomId);
        const cleanup = userId
            ? realtimeServer
                .in(getUserChannel(userId))
                .socketsLeave(roomChannel)
            : realtimeServer
                .in(roomChannel)
                .socketsLeave(roomChannel);

        void Promise.resolve(cleanup).catch(() => {
            logCleanupFailure(roomId);
        });
    } catch {
        logCleanupFailure(roomId);
    }
};

const safelyPublish = (
    eventName: string,
    publish: (server: Server) => void
): void => {
    if (!realtimeServer) {
        return;
    }

    try {
        publish(realtimeServer);
    } catch {
        logPublishingFailure(eventName);
    }
};

export const configureRoomEventPublisher = (
    server: Server | undefined
): void => {
    realtimeServer = server;
};

export const publishRoomMemberJoined = (
    room: IRoom,
    member: IRoomMember
): void => {
    safelyPublish(
        ROOM_REALTIME_EVENTS.memberJoined,
        (server) => {
            const roomId = room._id.toString();
            const payload: RoomMemberJoinedEvent = {
                ...getEventMetadata(roomId),
                memberCount: room.memberCount,
                maxMembers: room.maxMembers,
                member: toAnonymousMemberPayload(member),
            };

            server
                .to(getRoomChannel(roomId))
                .emit(
                    ROOM_REALTIME_EVENTS.memberJoined,
                    payload
                );
        }
    );
};

export const publishRoomMemberLeft = (
    room: IRoom,
    member: IRoomMember,
    leavingUserId: string
): void => {
    const roomId = room._id.toString();
    const userChannel = getUserChannel(leavingUserId);

    safelyPublish(
        ROOM_REALTIME_EVENTS.memberLeft,
        (server) => {
            const payload: RoomMemberLeftEvent = {
                ...getEventMetadata(roomId),
                memberCount: room.memberCount,
                maxMembers: room.maxMembers,
                member: {
                    membershipId: member._id.toString(),
                    displayName: member.displayName,
                },
            };

            server
                .to(getRoomChannel(roomId))
                .except(userChannel)
                .emit(
                    ROOM_REALTIME_EVENTS.memberLeft,
                    payload
                );
        }
    );

    safelyRemoveSocketsFromRoom(roomId, leavingUserId);
};

export const publishRoomClosed = (roomId: string): void => {
    safelyPublish(
        ROOM_REALTIME_EVENTS.closed,
        (server) => {
            const payload: RoomClosedEvent = {
                ...getEventMetadata(roomId),
                reason: "creator_closed",
            };

            server
                .to(getRoomChannel(roomId))
                .emit(ROOM_REALTIME_EVENTS.closed, payload);
        }
    );

    safelyRemoveSocketsFromRoom(roomId);
};

export const publishRoomMemberRemoved = (
    room: IRoom,
    removedMember: IRoomMember
): void => {
    const roomId = room._id.toString();
    const removedUserId = removedMember.user.toString();
    const userChannel = getUserChannel(removedUserId);

    safelyPublish(
        ROOM_REALTIME_EVENTS.memberRemoved,
        (server) => {
            const payload: RoomMemberRemovedEvent = {
                ...getEventMetadata(roomId),
                memberCount: room.memberCount,
                maxMembers: room.maxMembers,
                member: {
                    membershipId: removedMember._id.toString(),
                    displayName: removedMember.displayName,
                },
            };

            server
                .to(getRoomChannel(roomId))
                .except(userChannel)
                .emit(
                    ROOM_REALTIME_EVENTS.memberRemoved,
                    payload
                );
        }
    );

    safelyPublish(
        ROOM_REALTIME_EVENTS.removedFromRoom,
        (server) => {
            const removedPayload: RoomRemovedFromRoomEvent = {
                ...getEventMetadata(roomId),
                membershipId: removedMember._id.toString(),
                reason: "admin_removed",
            };

            server
                .to(userChannel)
                .emit(
                    ROOM_REALTIME_EVENTS.removedFromRoom,
                    removedPayload
                );
        }
    );

    safelyRemoveSocketsFromRoom(
        roomId,
        removedUserId
    );
};
