import crypto from "crypto";
import { hash, verifyPassword } from "ironpass";
import { Types } from "mongoose";

import {
    ROOM_DISPLAY_NAME_MAX_ATTEMPTS,
    ROOM_DISCOVERY_RADIUS_METERS,
    ROOM_MAX_MEMBERS,
} from "../constants/room.constants.js";
import { Room, type IRoom } from "../models/room.model.js";
import { ApiError } from "../utils/api-error.js";
import type {
    CreateRoomInput,
    IRoomMember,
    NearbyRoomAggregate,
    RoomVisibility,
} from "../types/room.types.js";

export interface JoinRoomResult {
    room: IRoom;
    membership: IRoomMember;
    alreadyMember: boolean;
}

const toObjectId = (value: string | Types.ObjectId): Types.ObjectId => {
    if (value instanceof Types.ObjectId) {
        return value;
    }

    if (!Types.ObjectId.isValid(value)) {
        throw new ApiError(400, "Invalid MongoDB ID");
    }

    return new Types.ObjectId(value);
};

const createDisplayName = (): string => {
    return `Chugly_${crypto.randomInt(1000, 10000)}`;
};

const findMember = (
    room: IRoom,
    userId: Types.ObjectId
): IRoomMember | undefined => {
    return room.members.find((member) =>
        member.user.equals(userId)
    );
};

const validateVisibilityAndPassword = (
    visibility: RoomVisibility,
    password?: string
): void => {
    if (visibility === "private" && !password?.trim()) {
        throw new ApiError(
            422,
            "Private rooms require a password"
        );
    }

    if (visibility === "public" && password?.trim()) {
        throw new ApiError(
            422,
            "Public rooms cannot have a password"
        );
    }
};

export const createRoom = async (
    userId: Types.ObjectId,
    input: CreateRoomInput
): Promise<IRoom> => {
    validateVisibilityAndPassword(
        input.visibility,
        input.password
    );

    const passwordHash =
        input.visibility === "private"
            ? await hash(input.password as string)
            : undefined;

    const creatorMembership: IRoomMember = {
        _id: new Types.ObjectId(),
        user: userId,
        displayName: createDisplayName(),
        role: "admin",
        joinedAt: new Date(),
    };

    return Room.create({
        name: input.name.trim(),
        visibility: input.visibility,
        passwordHash,
        createdBy: userId,
        location: {
            type: "Point",
            coordinates: [input.longitude, input.latitude],
        },
        members: [creatorMembership],
        memberCount: 1,
        maxMembers: ROOM_MAX_MEMBERS,
    });
};

export const getNearbyRooms = async (
    userId: Types.ObjectId,
    latitude: number,
    longitude: number
): Promise<NearbyRoomAggregate[]> => {
    return Room.aggregate<NearbyRoomAggregate>([
        {
            $geoNear: {
                near: {
                    type: "Point",
                    coordinates: [longitude, latitude],
                },
                key: "location",
                distanceField: "distanceMeters",
                spherical: true,
                maxDistance: ROOM_DISCOVERY_RADIUS_METERS,
            },
        },
        {
            $addFields: {
                isMember: {
                    $in: [userId, "$members.user"],
                },
                isAdmin: {
                    $eq: ["$createdBy", userId],
                },
            },
        },
        {
            $project: {
                passwordHash: 0,
                location: 0,
                members: 0,
                __v: 0,
            },
        },
    ]).exec();
};

export const getMyRooms = async (
    userId: Types.ObjectId
): Promise<IRoom[]> => {
    return Room.find({ "members.user": userId })
        .sort({ updatedAt: -1 })
        .exec();
};

export const getRoom = async (
    roomId: string | Types.ObjectId
): Promise<IRoom> => {
    const room = await Room.findById(toObjectId(roomId)).exec();

    if (!room) {
        throw new ApiError(404, "Room not found");
    }

    return room;
};

export const joinRoom = async (
    userId: Types.ObjectId,
    roomId: string,
    password?: string
): Promise<JoinRoomResult> => {
    const roomObjectId = toObjectId(roomId);
    const room = await Room.findById(roomObjectId)
        .select("+passwordHash")
        .exec();

    if (!room) {
        throw new ApiError(404, "Room not found");
    }

    const existingMember = findMember(room, userId);

    if (existingMember) {
        return {
            room,
            membership: existingMember,
            alreadyMember: true,
        };
    }

    if (room.visibility === "private") {
        if (!password || !room.passwordHash) {
            throw new ApiError(403, "Invalid room password");
        }

        const validPassword = await verifyPassword(
            password,
            room.passwordHash
        );

        if (!validPassword) {
            throw new ApiError(403, "Invalid room password");
        }
    }

    for (
        let attempt = 0;
        attempt < ROOM_DISPLAY_NAME_MAX_ATTEMPTS;
        attempt += 1
    ) {
        const displayName = createDisplayName();
        const membership: IRoomMember = {
            _id: new Types.ObjectId(),
            user: userId,
            displayName,
            role: "member",
            joinedAt: new Date(),
        };

        const updatedRoom = await Room.findOneAndUpdate(
            {
                _id: roomObjectId,
                memberCount: { $lt: ROOM_MAX_MEMBERS },
                "members.user": { $ne: userId },
                "members.displayName": { $ne: displayName },
            },
            {
                $push: {
                    members: membership,
                },
                $inc: {
                    memberCount: 1,
                },
            },
            {
                new: true,
                runValidators: true,
            }
        ).exec();

        if (updatedRoom) {
            const insertedMember = findMember(
                updatedRoom,
                userId
            );

            if (!insertedMember) {
                throw new ApiError(
                    500,
                    "Room membership could not be created"
                );
            }

            return {
                room: updatedRoom,
                membership: insertedMember,
                alreadyMember: false,
            };
        }

        const currentRoom = await Room.findById(
            roomObjectId
        ).exec();

        if (!currentRoom) {
            throw new ApiError(404, "Room not found");
        }

        const currentMember = findMember(currentRoom, userId);

        if (currentMember) {
            return {
                room: currentRoom,
                membership: currentMember,
                alreadyMember: true,
            };
        }

        if (currentRoom.memberCount >= ROOM_MAX_MEMBERS) {
            throw new ApiError(409, "Room is full");
        }
    }

    throw new ApiError(
        409,
        "Could not generate a unique room display name"
    );
};

export const leaveRoom = async (
    userId: Types.ObjectId,
    roomId: string
): Promise<{ roomId: string; deleted: boolean }> => {
    const roomObjectId = toObjectId(roomId);
    const room = await getRoom(roomObjectId);
    const member = findMember(room, userId);

    if (!member) {
        throw new ApiError(409, "You are not a member of this room");
    }

    if (room.createdBy.equals(userId)) {
        if (room.members.length > 1) {
            throw new ApiError(
                409,
                "The room creator cannot leave while other members remain"
            );
        }

        const deletedRoom = await Room.findOneAndDelete({
            _id: roomObjectId,
            createdBy: userId,
            memberCount: 1,
            "members.user": userId,
        }).exec();

        if (!deletedRoom) {
            throw new ApiError(
                409,
                "The room changed before it could be closed"
            );
        }

        return {
            roomId: roomObjectId.toString(),
            deleted: true,
        };
    }

    const updatedRoom = await Room.findOneAndUpdate(
        {
            _id: roomObjectId,
            "members.user": userId,
            memberCount: { $gt: 0 },
        },
        {
            $pull: {
                members: { user: userId },
            },
            $inc: {
                memberCount: -1,
            },
        },
        {
            new: true,
        }
    ).exec();

    if (!updatedRoom) {
        throw new ApiError(409, "You are no longer a member of this room");
    }

    return {
        roomId: roomObjectId.toString(),
        deleted: false,
    };
};

export const removeRoomMember = async (
    adminUserId: Types.ObjectId,
    roomId: string,
    membershipId: string
): Promise<IRoom> => {
    const roomObjectId = toObjectId(roomId);
    const membershipObjectId = toObjectId(membershipId);
    const room = await getRoom(roomObjectId);

    if (!room.createdBy.equals(adminUserId)) {
        throw new ApiError(
            403,
            "Only the room creator can remove members"
        );
    }

    const targetMember = room.members.find((member) =>
        member._id.equals(membershipObjectId)
    );

    if (!targetMember) {
        throw new ApiError(404, "Room membership not found");
    }

    if (targetMember.user.equals(room.createdBy)) {
        throw new ApiError(400, "The room creator cannot be removed");
    }

    const updatedRoom = await Room.findOneAndUpdate(
        {
            _id: roomObjectId,
            createdBy: adminUserId,
            "members._id": membershipObjectId,
        },
        {
            $pull: {
                members: { _id: membershipObjectId },
            },
            $inc: {
                memberCount: -1,
            },
        },
        {
            new: true,
        }
    ).exec();

    if (!updatedRoom) {
        throw new ApiError(
            409,
            "The room membership changed before removal"
        );
    }

    return updatedRoom;
};
