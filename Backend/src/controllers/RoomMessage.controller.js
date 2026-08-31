import { RoomMessage } from "../models/roomChat.model.js";
import { Room } from "../models/room.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createRoomMessage = async (req, res) => {
    try {
        const { roomId } = req.params;
        const { content } = req.body;

        // 1. Check message content
        if (!content || !content.trim()) {
            throw new ApiError(400, "Message cannot be empty");
        }

        // 2. Find the room
        const room = await Room.findById(roomId);

        if (!room) {
            throw new ApiError(404, "Room not found");
        }

        // 3. Check whether user is a member
        const isMember = room.members.some(
            member => member.toString() === req.user._id.toString()
        );

        if (!isMember) {
            throw new ApiError(
                403,
                "You are not a member of this room"
            );
        }

        // 4. Get authenticated user
        const user = req.user;

        // 5. Create message
        const message = await RoomMessage.create({
            roomId: roomId,
            senderId: user._id,
            displayName: user.username,
            content: content.trim()
        });

        // 6. Make sure message was created
        if (!message) {
            throw new ApiError(
                500,
                "Failed to create message"
            );
        }

        // 7. Send response
        return res
            .status(201)
            .json(
                new ApiResponse(
                    201,
                    message,
                    "Message created successfully"
                )
            );

    } catch (error) {
        throw new ApiError(
            error.statusCode || 500,
            error.message || "Internal Server Error"
        );
    }
};

export { createRoomMessage };