
import {
    body,
    param,
    query,
    ValidationChain,
} from "express-validator";

const userRegisterValidator = () => {
    return [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Please provide a valid email address"),

        body("username")
            .trim()
            .notEmpty()
            .withMessage("Username is required")
            .isLowercase()
            .withMessage("Username must be in lowercase")
            .isLength({ min: 3 })
            .withMessage(
                "Username must be at least 3 characters long"
            ),

        body("password")
            .trim()
            .notEmpty()
            .withMessage("Password is required")
            .isLength({ min: 8 })
            .withMessage(
                "Password must be at least 8 characters long"
            ),

        body("fullname")
            .optional()
            .trim(),
    ];
};


const userLoginValidator = (): ValidationChain[] => {
    return [
        body("email")
            .optional()
            .isEmail()
            .withMessage("Please provide a valid email"),

        body("password")
            .notEmpty()
            .withMessage("Password is required"),
    ];
};



const userForgotPasswordValidator = (): ValidationChain[] => {
    return [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage(
                "Please provide a valid email address"
            ),
    ];
};

const userResetForgotPasswordValidator = (): ValidationChain[] => {
    return [
        body("newPassword")
            .notEmpty()
            .withMessage("New password is required"),
    ];
};

const createRoomValidator = (): ValidationChain[] => {
    return [
        body("name")
            .trim()
            .notEmpty()
            .withMessage("Room name is required")
            .isLength({ max: 80 })
            .withMessage("Room name cannot exceed 80 characters"),

        body("visibility")
            .isIn(["public", "private"])
            .withMessage("Visibility must be public or private"),

        body("password")
            .custom((value, { req }) => {
                if (req.body.visibility === "private") {
                    if (typeof value !== "string" || !value.trim()) {
                        throw new Error(
                            "Private rooms require a password"
                        );
                    }

                    if (value.length < 8 || value.length > 128) {
                        throw new Error(
                            "Room password must be between 8 and 128 characters"
                        );
                    }
                }

                if (
                    req.body.visibility === "public" &&
                    value !== undefined &&
                    value !== null &&
                    String(value).trim() !== ""
                ) {
                    throw new Error(
                        "Public rooms cannot have a password"
                    );
                }

                return true;
            }),

        body("latitude")
            .isFloat({ min: -90, max: 90 })
            .withMessage("Latitude must be between -90 and 90")
            .toFloat(),

        body("longitude")
            .isFloat({ min: -180, max: 180 })
            .withMessage("Longitude must be between -180 and 180")
            .toFloat(),
    ];
};

const nearbyRoomsValidator = (): ValidationChain[] => {
    return [
        query("latitude")
            .isFloat({ min: -90, max: 90 })
            .withMessage("Latitude must be between -90 and 90")
            .toFloat(),

        query("longitude")
            .isFloat({ min: -180, max: 180 })
            .withMessage("Longitude must be between -180 and 180")
            .toFloat(),
    ];
};

const roomIdValidator = (): ValidationChain[] => {
    return [
        param("roomId")
            .isMongoId()
            .withMessage("Room ID must be a valid MongoDB ID"),
    ];
};

const joinRoomValidator = (): ValidationChain[] => {
    return [
        body("password")
            .optional()
            .isString()
            .withMessage("Room password must be a string")
            .isLength({ max: 128 })
            .withMessage("Room password cannot exceed 128 characters"),
    ];
};

const membershipIdValidator = (): ValidationChain[] => {
    return [
        param("membershipId")
            .isMongoId()
            .withMessage(
                "Membership ID must be a valid MongoDB ID"
            ),
    ];
};

export {
    userRegisterValidator,
    userLoginValidator,
    userForgotPasswordValidator,
    userResetForgotPasswordValidator,
    createRoomValidator,
    nearbyRoomsValidator,
    roomIdValidator,
    joinRoomValidator,
    membershipIdValidator,
};