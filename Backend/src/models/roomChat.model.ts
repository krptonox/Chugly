import mongoose, { Schema} from "mongoose";

export interface IRoomMessage extends mongoose.Document {
    roomId: mongoose.Types.ObjectId;
    senderId: mongoose.Types.ObjectId;
    displayName: string;
    content: string;
    status: "sent" | "deleted";
    createdAt: Date;
    updatedAt: Date;
}

const roomMessageSchema  = new Schema<IRoomMessage>({

    roomId:{
        type: Schema.Types.ObjectId,
        ref: "Room",
        required: true,
        index: true,
    },

    senderId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    displayName: {
        type: String,
        required: true,
        trim: true,
    },

    content: {
        type: String,
        required: true,
        trim: true,
        maxLength: 500,
    },

    status: {
        type: String,
        enum: ["sent", "deleted"],
        default: "sent",
    },
},{
    timestamps: true,
});

export const RoomMessage = mongoose.model("RoomMessage", roomMessageSchema);