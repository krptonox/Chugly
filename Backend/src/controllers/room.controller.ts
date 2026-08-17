import type { Request, Response } from "express";

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
import type { CreateRoomInput } from "../types/room.types.js";

const getAuthenticatedUserId = (req: Request) => {
    if (!req.user) {
        throw new ApiError(401, "Unauthorized request");
    }

    return req.user._id;
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
        const result = await leaveRoomService(userId, roomId);

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

        const room = await removeRoomMemberService(
            userId,
            roomId,
            membershipId
        );

        return res.status(200).json(
            new ApiResponse(
                200,
                toRoomDetail(room, userId),
                "Member removed successfully"
            )
        );
    }
);
