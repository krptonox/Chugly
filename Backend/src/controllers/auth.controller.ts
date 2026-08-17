import { Request, Response } from "express";
import crypto from "crypto";
import { User, type IUser } from "../models/user.model.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { sendMail, emailVerficationMailgenContent, forgotPasswordMailgenContent } from "../utils/mail.js";
import { Types } from "mongoose";

//generate access token and refresh token for the user

import mongoose from "mongoose";
import { authCookieOptions } from "../utils/cookie-options.js";

const getWebAppUrl = (): string => {
    const configuredWebAppUrl = process.env.WEB_APP_URL;

    if (!configuredWebAppUrl && process.env.NODE_ENV === "production") {
        throw new ApiError(
            500,
            "Web application URL is not configured"
        );
    }

    return (
        configuredWebAppUrl || "http://localhost:5173"
    ).replace(/\/+$/, "");
};

const getForgotPasswordRedirectUrl = (): string => {
    return (
        process.env.FORGOT_PASSWORD_REDIRECT_URL ||
        `${getWebAppUrl()}/reset-password`
    ).replace(/\/+$/, "");
};

const sanitizeUser = (user: IUser) => {
    const {
        password: _password,
        refreshToken: _refreshToken,
        emailVerificationToken: _emailVerificationToken,
        emailVerificationTokenExpiry:
            _emailVerificationTokenExpiry,
        forgotPasswordToken: _forgotPasswordToken,
        forgotPasswordTokenExpiry:
            _forgotPasswordTokenExpiry,
        ...safeUser
    } = user.toObject();

    return safeUser;
};

const generateAccessAndRefreshToken = async (
    userId: Types.ObjectId
): Promise<{
    accessToken: string;
    refreshToken: string;
}> => {
    try {
        const user = await User.findById(userId);

        if (!user) {
            throw new ApiError(404, "User not found");
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
            `${getWebAppUrl()}/verify-email/${unHashedToken}`
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
            "-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry -forgotPasswordToken -forgotPasswordTokenExpiry -__v"
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
                sanitizeUser(createdUser),
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




const login = asyncHandler(
    async (req: Request, res: Response) => {

        const { email, password } = req.body;

        if (!email || !password) {
            throw new ApiError(
                400,
                "Email and password are required"
            );
        }

        const user = await User.findOne({ email });

        if (!user) {
            throw new ApiError(
                404,
                "User not found"
            );
        }

        const isPasswordValid =
            await user.isPasswordCorrect(password);

        if (!isPasswordValid) {
            throw new ApiError(
                401,
                "Invalid credentials"
            );
        }

        const {
    accessToken,
    refreshToken,
} = await generateAccessAndRefreshToken(
    user._id
);

        const loggedInUser =
            await User.findById(user._id).select(
                "-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry -forgotPasswordToken -forgotPasswordTokenExpiry"
            );

        return res
            .status(200)
            .cookie(
                "accessToken",
                accessToken,
                authCookieOptions
            )
            .cookie(
                "refreshToken",
                refreshToken,
                authCookieOptions
            )
            .json(
                new ApiResponse(
                    200,
                    loggedInUser,
                    "User logged in successfully"
                )
            );
    }
);







const logoutUser = asyncHandler(async (req, res) => {

    if (!req.user) {
        throw new ApiError(401, "Unauthorized request");
    }

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: null,
            },
        }
    );

    return res
        .status(200)
        .clearCookie("refreshToken", authCookieOptions)
        .clearCookie("accessToken", authCookieOptions)
        .json(
            new ApiResponse(
                200,
                {},
                "User logged out successfully"
            )
        );
});




const resendEmailVerification = asyncHandler(
    async (req, res) => {

        // verifyJWT should have populated req.user
        if (!req.user) {
            throw new ApiError(
                401,
                "Unauthorized request"
            );
        }

        const user = await User.findById(
            req.user._id
        );

        if (!user) {
            throw new ApiError(
                404,
                "User not found"
            );
        }

        if (user.isEmailVerified) {
            throw new ApiError(
                409,
                "Email is already verified"
            );
        }

        const {
            unHashedToken,
            hashedToken,
            TokenExpiry,
        } = user.generateTemporaryToken();

        user.emailVerificationToken = hashedToken;
        user.emailVerificationTokenExpiry = TokenExpiry;

        await user.save({
            validateBeforeSave: false,
        });

        try {
            await sendMail({
                email: user.email,

                subject: "Please verify your email",

                mailgenContent:
                    emailVerficationMailgenContent(
                        user.username,
                        `${getWebAppUrl()}/verify-email/${unHashedToken}`
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
                    : undefined
            );
        }

        return res.status(200).json(
            new ApiResponse(
                200,
                {},
                "Verification email resent successfully"
            )
        );
    }
);

const getCurrentUser = asyncHandler(
    async (req: Request, res: Response) => {

        if (!req.user) {
            throw new ApiError(
                401,
                "Unauthorized request"
            );
        }

        return res.status(200).json(
            new ApiResponse(
                200,
                sanitizeUser(req.user),
                "Current user fetched successfully"
            )
        );
    }
);





const changeCurrentPassword = asyncHandler(
    async (req: Request, res: Response) => {

        const { oldPassword, newPassword } = req.body;

        if (!req.user) {
            throw new ApiError(
                401,
                "Unauthorized request"
            );
        }

        if (!oldPassword || !newPassword) {
            throw new ApiError(
                400,
                "Old password and new password are required"
            );
        }

        const user = await User.findById(
            req.user._id
        );

        if (!user) {
            throw new ApiError(
                404,
                "User not found"
            );
        }

        const isPasswordValid =
            await user.isPasswordCorrect(oldPassword);

        if (!isPasswordValid) {
            throw new ApiError(
                401,
                "Invalid current password"
            );
        }

        user.password = newPassword;

        await user.save({
            validateBeforeSave: false,
        });

        return res.status(200).json(
            new ApiResponse(
                200,
                {},
                "Password changed successfully"
            )
        );
    }
);







import jwt, { JwtPayload } from "jsonwebtoken";

interface RefreshTokenPayload extends JwtPayload {
    _id: string;
}

const refreshAccessToken = asyncHandler(
    async (req, res) => {

        const incomingRefreshToken =
            req.cookies?.refreshToken ||
            req.body?.refreshToken;

        if (!incomingRefreshToken) {
            throw new ApiError(
                400,
                "Refresh token is required"
            );
        }

        const refreshTokenSecret =
            process.env.REFRESH_TOKEN_SECRET;

        if (!refreshTokenSecret) {
            throw new ApiError(
                500,
                "Refresh token secret is not configured"
            );
        }

        try {
            const decodedToken = jwt.verify(
                incomingRefreshToken,
                refreshTokenSecret
            ) as RefreshTokenPayload;

            const user = await User.findById(
                decodedToken._id
            );

            if (!user) {
                throw new ApiError(
                    404,
                    "User not found"
                );
            }

            if (
                incomingRefreshToken !==
                user.refreshToken
            ) {
                throw new ApiError(
                    401,
                    "Refresh token is expired or invalid"
                );
            }

            const {
                accessToken,
                refreshToken,
            } = await generateAccessAndRefreshToken(
                user._id
            );

            return res
                .status(200)
                .cookie(
                    "refreshToken",
                    refreshToken,
                    authCookieOptions
                )
                .cookie(
                    "accessToken",
                    accessToken,
                    authCookieOptions
                )
                .json(
                    new ApiResponse(
                        200,
                        {},
                        "Access token refreshed successfully"
                    )
                );

        } catch (error) {

            if (error instanceof ApiError) {
                throw error;
            }

            throw new ApiError(
                401,
                "Invalid refresh token"
            );
        }
    }
);





const forgotPassword = asyncHandler(
    async (req: Request, res: Response) => {
        const { email } = req.body;

        if (!email) {
            throw new ApiError(
                400,
                "Email is required"
            );
        }

        const user = await User.findOne({ email });

        if (!user) {
            throw new ApiError(
                404,
                "User not found"
            );
        }

        const {
            unHashedToken,
            hashedToken,
            TokenExpiry,
        } = user.generateTemporaryToken();

        user.forgotPasswordToken = hashedToken;
        user.forgotPasswordTokenExpiry = TokenExpiry;

        await user.save({
            validateBeforeSave: false,
        });

        try {
            await sendMail({
                email: user.email,

                subject: "Password Reset Request",

                mailgenContent:
                    forgotPasswordMailgenContent(
                        user.username,
                        `${getForgotPasswordRedirectUrl()}/${unHashedToken}`
                    ),
            });
        } catch (error: unknown) {
            throw new ApiError(
                500,
                "Error sending password reset email",
                [
                    error instanceof Error
                        ? error.message
                        : "Unknown error",
                ],
                error instanceof Error
                    ? error.stack
                    : undefined
            );
        }
        console.log("RESET TOKEN:", unHashedToken);
        return res.status(200).json(
            new ApiResponse(
                200,
                {},
                "Password reset email sent successfully"
            )
        );
    }
);






const resetForgotPassword = asyncHandler(
    async (req, res) => {
        const resetToken = req.params.resetToken as string;
        const { newPassword } = req.body;

        if (!resetToken) {
            throw new ApiError(
                400,
                "Reset token is required"
            );
        }

        if (!newPassword) {
            throw new ApiError(
                400,
                "New password is required"
            );
        }

        const hashedToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        const user = await User.findOne({
            forgotPasswordToken: hashedToken,
            forgotPasswordTokenExpiry: {
                $gt: new Date(),
            },
        });

        if (!user) {
            throw new ApiError(
                400,
                "Token is Invalid or Expired"
            );
        }

        user.forgotPasswordToken = null;
        user.forgotPasswordTokenExpiry = null;
        user.password = newPassword;

        await user.save({
            validateBeforeSave: false,
        });

        return res.status(200).json(
            new ApiResponse(
                200,
                {},
                "Password reset successfully"
            )
        );
    }
);



export { registerUser, verifyEmail, login, logoutUser, resendEmailVerification, getCurrentUser, changeCurrentPassword, refreshAccessToken, forgotPassword, resetForgotPassword };