import { Request, Response } from "express";

import { User } from "../models/user.model.ts";
import { ApiResponse } from "../utils/api-response.ts";
import { ApiError } from "../utils/api-error.ts";
import { asyncHandler } from "../utils/async-handler.ts";


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

export { registerUser };