
import { body, ValidationChain } from "express-validator";

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


export { userRegisterValidator,userLoginValidator };