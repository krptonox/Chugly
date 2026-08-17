import mongoose, {
    Document,
    Schema,
    Types,
} from "mongoose";

import {
    ROOM_MAX_MEMBERS,
} from "../constants/room.constants.js";
import type {
    IRoomMember,
    RoomLocation,
    RoomMemberRole,
    RoomVisibility,
} from "../types/room.types.js";

export interface IRoom extends Document {
    name: string;
    visibility: RoomVisibility;
    passwordHash?: string | null;
    createdBy: Types.ObjectId;
    location: RoomLocation;
    members: IRoomMember[];
    memberCount: number;
    maxMembers: number;
}

const roomMemberSchema = new Schema<IRoomMember>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        displayName: {
            type: String,
            required: true,
            trim: true,
            maxlength: 32,
        },

        role: {
            type: String,
            enum: ["admin", "member"] satisfies RoomMemberRole[],
            required: true,
        },

        joinedAt: {
            type: Date,
            required: true,
            default: Date.now,
        },
    },
    {
        _id: true,
        versionKey: false,
    }
);

const roomSchema = new Schema<IRoom>(
    {
        name: {
            type: String,
            required: [true, "Room name is required"],
            trim: true,
            minlength: 1,
            maxlength: 80,
        },

        visibility: {
            type: String,
            enum: ["public", "private"] satisfies RoomVisibility[],
            required: true,
        },

        passwordHash: {
            type: String,
            select: false,
        },

        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            immutable: true,
        },

        location: {
            type: {
                type: String,
                enum: ["Point"],
                required: true,
                default: "Point",
            },
            coordinates: {
                type: [Number],
                required: true,
                validate: {
                    validator: (coordinates: number[]) =>
                        coordinates.length === 2 &&
                        coordinates.every((coordinate) =>
                            Number.isFinite(coordinate)
                        ),
                    message:
                        "Location must contain longitude and latitude coordinates",
                },
            },
        },

        members: {
            type: [roomMemberSchema],
            required: true,
            default: [],
            validate: {
                validator: (members: IRoomMember[]) =>
                    members.length <= ROOM_MAX_MEMBERS,
                message: `A room cannot have more than ${ROOM_MAX_MEMBERS} members`,
            },
        },

        memberCount: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
            max: ROOM_MAX_MEMBERS,
        },

        maxMembers: {
            type: Number,
            required: true,
            default: ROOM_MAX_MEMBERS,
            immutable: true,
            enum: [ROOM_MAX_MEMBERS],
        },
    },
    {
        timestamps: true,
    }
);

roomSchema.index({ location: "2dsphere" });
roomSchema.index({ createdBy: 1 });
roomSchema.index({ "members.user": 1 });

export const Room = mongoose.model<IRoom>("Room", roomSchema);
