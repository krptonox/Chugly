import { Request, Response, NextFunction } from "express";
import { User, type IUser } from "../models/user.model.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import jwt, { JwtPayload } from "jsonwebtoken";

interface AccessTokenPayload extends JwtPayload {
    _id: string;
}

const isAccessTokenPayload = (
    value: string | JwtPayload
): value is AccessTokenPayload => (
    typeof value === "object" &&
    value !== null &&
    typeof value._id === "string"
);

/**
 * Verifies an access token and resolves the same sanitized user document used
 * by the REST authentication middleware.
 */
export const authenticateAccessToken = async (
    token: string
): Promise<IUser> => {
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
        );

        if (!isAccessTokenPayload(decodedToken)) {
            throw new ApiError(
                401,
                "Invalid access token"
            );
        }

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

        return user;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        throw new ApiError(
            401,
            "Invalid access token"
        );
    }
};

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

        req.user = await authenticateAccessToken(token);

        next();
    }
);