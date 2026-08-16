import mongoose, {
    Schema,
    Document,
    Model,
} from "mongoose";

import jwt from "jsonwebtoken";
import crypto from "crypto";


// --------------------------------------------------
// Interfaces
// --------------------------------------------------

interface IAvatar {
    url: string;
    localPath: string;
}

interface ITemporaryToken {
    unHashedToken: string;
    hashedToken: string;
    TokenExpiry: Date;
}

interface IUser extends Document {
    avatar: IAvatar;

    username: string;
    email: string;
    fullname?: string;

    password: string;

    isEmailVerified: boolean;

    refreshToken?: string | null;

    forgotPasswordToken?: string | null;
    forgotPasswordTokenExpiry?: Date | null;

    emailVerificationToken?: string | null;
    emailVerificationTokenExpiry?: Date | null;

}


// --------------------------------------------------
// Schema
// --------------------------------------------------

const userSchema = new Schema<IUser>(
    {
        avatar: {
            type: {
                url: {
                    type: String,
                },

                localPath: {
                    type: String,
                },
            },

            default: {
                url: "https://placehold.co/200x200",
                localPath: "",
            },
        },

        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },

        fullname: {
            type: String,
            trim: true,
        },

        password: {
            type: String,
            required: [true, "Password is required"],
        },

        isEmailVerified: {
            type: Boolean,
            default: false,
        },

        refreshToken: {
            type: String,
        },

        forgotPasswordToken: {
            type: String,
        },

        forgotPasswordTokenExpiry: {
            type: Date,
        },

        emailVerificationToken: {
            type: String,
        },

        emailVerificationTokenExpiry: {
            type: Date,
        },
    },

    {
        timestamps: true,
    }
);

export const User =  mongoose.model<IUser>("User", userSchema);