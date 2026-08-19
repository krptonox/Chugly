import type { Request, Response } from "express";
import type { Types } from "mongoose";

import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
    createRoom as createRoomService,
    getNearbyRooms as getNearbyRoomsService,
    getMyRooms as getMyRoomsService,
    getRoom as getRoomService,
    joinRoom as joinRoomService,
    leaveRoom as leaveRoomService,
    removeRoomMember as removeRoomMemberService,
} from "../services/room.service.js";
import {
    toMembershipResponse,
    toNearbyRoomSummary,
    toRoomDetail,
    toRoomSummary,
} from "../utils/room-response.js";
import type { IRoom } from "../models/room.model.js";
import type {
    CreateRoomInput,
    IRoomMember,
} from "../types/room.types.js";
import {
    publishRoomClosed,
    publishRoomMemberJoined,
    publishRoomMemberLeft,
    publishRoomMemberRemoved,
} from "../realtime/room-event-publisher.js";

const getAuthenticatedUserId = (req: Request) => {
    if (!req.user) {
        throw new ApiError(401, "Unauthorized request");
    }

    return req.user._id;
};

const findMemberForUser = (
    room: IRoom,
    userId: Types.ObjectId
): IRoomMember | undefined => room.members.find((member) =>
    member.user.equals(userId)
);

const getPostMutationRoom = async (
    roomId: string,
    fallbackRoom: IRoom
): Promise<IRoom> => {
    try {
        return await getRoomService(roomId);
    } catch {
        return fallbackRoom;
    }
};

export const createRoom = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = getAuthenticatedUserId(req);
        const {
            name,
            visibility,
            password,
            latitude,
            longitude,
        } = req.body as CreateRoomInput;

        const room = await createRoomService(userId, {
            name,
            visibility,
            password,
            latitude: Number(latitude),
            longitude: Number(longitude),
        });

        return res.status(201).json(
            new ApiResponse(
                201,
                toRoomDetail(room, userId),
                "Room created successfully"
            )
        );
    }
);

export const getNearbyRooms = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = getAuthenticatedUserId(req);
        const { latitude, longitude } = req.query as {
            latitude: string;
            longitude: string;
        };

        const rooms = await getNearbyRoomsService(
            userId,
            Number(latitude),
            Number(longitude)
        );

        return res.status(200).json(
            new ApiResponse(
                200,
                rooms.map(toNearbyRoomSummary),
                "Nearby rooms retrieved successfully"
            )
        );
    }
);

export const getMyRooms = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = getAuthenticatedUserId(req);
        const rooms = await getMyRoomsService(userId);

        return res.status(200).json(
            new ApiResponse(
                200,
                rooms.map((room) =>
                    toRoomSummary(room, userId)
                ),
                "Your rooms retrieved successfully"
            )
        );
    }
);

export const getRoom = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = getAuthenticatedUserId(req);
        const { roomId } = req.params as { roomId: string };
        const room = await getRoomService(roomId);

        return res.status(200).json(
            new ApiResponse(
                200,
                toRoomDetail(room, userId),
                "Room retrieved successfully"
            )
        );
    }
);

export const joinRoom = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = getAuthenticatedUserId(req);
        const { roomId } = req.params as { roomId: string };
        const { password } = req.body as {
            password?: string;
        };

        const result = await joinRoomService(
            userId,
            roomId,
            password
        );

        if (!result.alreadyMember) {
            publishRoomMemberJoined(
                result.room,
                result.membership
            );
        }

        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    room: toRoomDetail(result.room, userId),
                    membership: toMembershipResponse(
                        result.membership
                    ),
                    alreadyMember: result.alreadyMember,
                },
                result.alreadyMember
                    ? "Already a member of this room"
                    : "Joined room successfully"
            )
        );
    }
);

export const leaveRoom = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = getAuthenticatedUserId(req);
        const { roomId } = req.params as { roomId: string };
        const roomBeforeLeave = await getRoomService(roomId);
        const leavingMember = findMemberForUser(
            roomBeforeLeave,
            userId
        );
        const result = await leaveRoomService(userId, roomId);

        if (result.deleted) {
            publishRoomClosed(result.roomId);
        } else if (leavingMember) {
            const roomAfterLeave = await getPostMutationRoom(
                result.roomId,
                roomBeforeLeave
            );

            publishRoomMemberLeft(
                roomAfterLeave,
                leavingMember,
                userId.toString()
            );
        }

        return res.status(200).json(
            new ApiResponse(
                200,
                result,
                result.deleted
                    ? "Room closed successfully"
                    : "You left the room"
            )
        );
    }
);

export const removeRoomMember = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = getAuthenticatedUserId(req);
        const {
            roomId,
            membershipId,
        } = req.params as {
            roomId: string;
            membershipId: string;
        };
        const roomBeforeRemoval = await getRoomService(roomId);
        const removedMember = roomBeforeRemoval.members.find(
            (member) => member._id.equals(membershipId)
        );

        const room = await removeRoomMemberService(
            userId,
            roomId,
            membershipId
        );

        if (removedMember) {
            publishRoomMemberRemoved(
                room,
                removedMember
            );
        }

        return res.status(200).json(
            new ApiResponse(
                200,
                toRoomDetail(room, userId),
                "Member removed successfully"
            )
        );
    }
);
