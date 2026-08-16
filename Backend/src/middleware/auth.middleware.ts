import { Request, Response, NextFunction } from "express";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import jwt, { JwtPayload } from "jsonwebtoken";

interface AccessTokenPayload extends JwtPayload {
    _id: string;
}

export const verifyJWT = asyncHandler(
    async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const token =
            req.cookies?.accessToken ||
            req.header("Authorization")?.replace(
                "Bearer ",
                ""
            );

        if (!token) {
            throw new ApiError(
                401,
                "Unauthorized request"
            );
        }

        const accessTokenSecret =
            process.env.ACCESS_TOKEN_SECRET;

        if (!accessTokenSecret) {
            throw new ApiError(
                500,
                "Access token secret is not configured"
            );
        }

        try {
            const decodedToken = jwt.verify(
                token,
                accessTokenSecret
            ) as AccessTokenPayload;

            const user = await User.findById(
                decodedToken._id
            ).select(
                "-password -createdAt -updatedAt -refreshToken -__v"
            );

            if (!user) {
                throw new ApiError(
                    401,
                    "Unauthorized request: invalid token"
                );
            }

            req.user = user;

            next();
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }

            throw new ApiError(
                401,
                "Invalid access token"
            );
        }
    }
);