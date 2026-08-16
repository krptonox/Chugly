import { Request, Response } from "express";
import crypto from "crypto";
import { User } from "../models/user.model.ts";
import { ApiResponse } from "../utils/api-response.ts";
import { ApiError } from "../utils/api-error.ts";
import { asyncHandler } from "../utils/async-handler.ts";
import { sendMail, emailVerficationMailgenContent } from "../utils/mail.js";


//generate access token and refresh token for the user

import mongoose from "mongoose";

const generateAccessAndRefreshToken = async (
    userId: mongoose.Types.ObjectId
): Promise<{
    accessToken: string;
    refreshToken: string;
}> => {
    try {
        const user = await User.findById(userId);

        if (!user) {
            throw new ApiError(
                404,
                "User not found"
            );
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;

        await user.save({
            validateBeforeSave: false,
        });

        return {
            accessToken,
            refreshToken,
        };
    } catch (error: unknown) {
        if (error instanceof ApiError) {
            throw error;
        }

        throw new ApiError(
            500,
            "Error generating tokens",
            [
                error instanceof Error
                    ? error.message
                    : "Unknown error",
            ],
            error instanceof Error
                ? error.stack
                : ""
        );
    }
};

const registerUser = asyncHandler(
    async (req: Request, res: Response) => {
        const {
            email,
            username,
            password,
        } = req.body;

        const existingUser = await User.findOne({
            $or: [
                { username },
                { email },
            ],
        });

        if (existingUser) {
            throw new ApiError(
                409,
                "User already exists"
            );
        }

        const user = await User.create({
            email,
            username,
            password,
            isEmailVerified: false,
        });

        const {
    unHashedToken,
    hashedToken,
    TokenExpiry,
} = user.generateTemporaryToken();

console.log("VERIFICATION TOKEN:", unHashedToken);

user.emailVerificationToken = hashedToken;
user.emailVerificationTokenExpiry = TokenExpiry;

await user.save({
    validateBeforeSave: false,
});

try {
    await sendMail({
        email: user.email,
        subject: "Please verify your email",

        mailgenContent: emailVerficationMailgenContent(
            user.username,
            `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`
        ),
    });
} catch (error: unknown) {
    throw new ApiError(
        500,
        "Error sending verification email",
        [
            error instanceof Error
                ? error.message
                : "Unknown error",
        ],
        error instanceof Error
            ? error.stack
            : ""
    );
}


        const createdUser = await User.findById(
            user._id
        ).select(
            "-emailVerificationToken -emailVerificationTokenExpiry -forgotPasswordToken -forgotPasswordTokenExpiry"
        );

        if (!createdUser) {
            throw new ApiError(
                500,
                "Error creating user"
            );
        }

        return res.status(201).json(
            new ApiResponse(
                201,
                createdUser,
                "User registered successfully"
            )
        );
    }
);




const verifyEmail = asyncHandler(
    async (req, res) => {

        const { verificationToken } = req.params as {
            verificationToken: string;
        };

        if (!verificationToken) {
            throw new ApiError(
                400,
                "Verification token is required"
            );
        }

        const hashedToken = crypto
            .createHash("sha256")
            .update(verificationToken)
            .digest("hex");

        const user = await User.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationTokenExpiry: {
                $gt: new Date(),
            },
        });

        if (!user) {
            throw new ApiError(
                400,
                "Token is Invalid or Expired"
            );
        }

        user.emailVerificationToken = null;
        user.emailVerificationTokenExpiry = null;
        user.isEmailVerified = true;

        await user.save({
            validateBeforeSave: false,
        });

        return res.status(200).json(
            new ApiResponse(
                200,
                {},
                "Email verified successfully"
            )
        );
    }
);


export { registerUser, verifyEmail };