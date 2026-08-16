import { Request, Response } from "express";

import { User } from "../models/user.model.ts";
import { ApiResponse } from "../utils/api-response.ts";
import { ApiError } from "../utils/api-error.ts";
import { asyncHandler } from "../utils/async-handler.ts";

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
            "-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry -forgotPasswordToken -forgotPasswordTokenExpiry"
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