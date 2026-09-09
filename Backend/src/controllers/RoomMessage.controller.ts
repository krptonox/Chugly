import { Request, Response } from "express";
import { Types } from "mongoose";

import { RoomMessage } from "../models/roomChat.model.js";
import { Room } from "../models/room.model.js";
import { publishRoomMessage } from "../realtime/room-event-publisher.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";

const createRoomMessage = async (
    req: Request,
    res: Response
) => {
    try {
        console.log("CREATE ROOM MESSAGE CONTROLLER REACHED");
        
        const user = req.user;

        if (!user) {
            throw new ApiError(401, "Unauthorized");
        }

        const roomIdParam = req.params.roomId;

        if (!roomIdParam || Array.isArray(roomIdParam)) {
            throw new ApiError(400, "Invalid room id");
        }

        const roomId = roomIdParam;
        const { content } = req.body;

        // 1. Check message content
        if (typeof content !== "string" || !content.trim()) {
            throw new ApiError(400, "Message cannot be empty");
        }

        if (content.trim().length > 500) {
            throw new ApiError(400, "Message cannot exceed 500 characters");
        }

        if (!Types.ObjectId.isValid(roomId)) {
            throw new ApiError(400, "Invalid room id");
        }

        // 2. Find the room
        const room = await Room.findById(roomId);

        if (!room) {
            throw new ApiError(404, "Room not found");
        }
         

        // 3. Check whether user is a member
        const isMember = room.members.some(
           (member) =>
            member.user.toString() === user._id.toString()
        );

        console.log("IS MEMBER:", isMember);

        if (!isMember) {
            throw new ApiError(
                403,
                "You are not a member of this room"
            );
        }

        // 4. Create message
        const message = await RoomMessage.create({
            roomId,
            senderId: user._id,
            displayName: user.username,
            content: content.trim(),
        });

        // 5. Make sure message was created
        if (!message) {
            throw new ApiError(
                500,
                "Failed to create message"
            );
        }

        publishRoomMessage(message);

        // 6. Send response
        return res.status(201).json(
            new ApiResponse(
                201,
                message,
                "Message created successfully"
            )
        );
    } catch (error: unknown) {
        if (error instanceof ApiError) {
            throw error;
        }

        const message =
            error instanceof Error
                ? error.message
                : "Internal Server Error";

        throw new ApiError(500, message);
    }
};

const getRoomMessages = async (
    req: Request,
    res: Response
) => {
    const user = req.user;
    const roomIdParam = req.params.roomId;

    if (!user) {
        throw new ApiError(401, "Unauthorized");
    }

    if (!roomIdParam || Array.isArray(roomIdParam)) {
        throw new ApiError(400, "Invalid room id");
    }

    if (!Types.ObjectId.isValid(roomIdParam)) {
        throw new ApiError(400, "Invalid room id");
    }

    const room = await Room.findById(roomIdParam).exec();

    if (!room) {
        throw new ApiError(404, "Room not found");
    }

    const isMember = room.members.some(
        (member) => member.user.toString() === user._id.toString()
    );

    if (!isMember) {
        throw new ApiError(403, "You are not a member of this room");
    }

    const messages = await RoomMessage.find({
        roomId: room._id,
        status: "sent",
    })
        .sort({ createdAt: -1 })
        .limit(100)
        .lean()
        .exec();

    return res.status(200).json(
        new ApiResponse(200, messages.reverse(), "Messages fetched successfully")
    );
};

export { createRoomMessage, getRoomMessages };