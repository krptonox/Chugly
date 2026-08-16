import mongoose, {
    Schema,
    Document,
    Model,
} from "mongoose";

import { hash, verifyPassword } from "ironpass";

import jwt, { SignOptions } from "jsonwebtoken";



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

    // Methods
    generateAccessToken(): string;
    generateRefreshToken(): string;

    isPasswordCorrect(
        password: string
    ): Promise<boolean>;

    generateTemporaryToken(): ITemporaryToken;
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

// --------------------------------------------------
// Hash Password Before Saving
// --------------------------------------------------

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return;
    }

    this.password = await hash(this.password);
    next;
});


// --------------------------------------------------
// generate access token
// --------------------------------------------------


userSchema.methods.generateAccessToken = function (): string {
    const secret = process.env.ACCESS_TOKEN_SECRET;

    if (!secret) {
        throw new Error(
            "ACCESS_TOKEN_SECRET is not defined"
        );
    }

    const expiry = process.env.ACCESS_TOKEN_EXPIRY;

    if (!expiry) {
        throw new Error(
            "ACCESS_TOKEN_EXPIRY is not defined"
        );
    }

    const options: SignOptions = {
        expiresIn: expiry as SignOptions["expiresIn"],
    };

    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
        },
        secret,
        options
    );
};


// --------------------------------------------------
// generate refresh token
// --------------------------------------------------

userSchema.methods.generateRefreshToken = function (): string {
    const secret = process.env.REFRESH_TOKEN_SECRET;

    if (!secret) {
        throw new Error(
            "REFRESH_TOKEN_SECRET is not defined"
        );
    }

    const expiry = process.env.REFRESH_TOKEN_EXPIRY;

    if (!expiry) {
        throw new Error(
            "REFRESH_TOKEN_EXPIRY is not defined"
        );
    }

    const options: SignOptions = {
        expiresIn: expiry as SignOptions["expiresIn"],
    };

    return jwt.sign(
        {
            _id: this._id,
        },
        secret,
        options
    );
};


export const User =  mongoose.model<IUser>("User", userSchema);