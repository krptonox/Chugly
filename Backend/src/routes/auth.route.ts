import { Router } from "express";

import { refreshAccessToken, registerUser, resendEmailVerification } from "../controllers/auth.controller.js";
import {
    userRegisterValidator,
    userLoginValidator,
} from "../validators/index.js";

import {
    verifyEmail,
    login,
    logoutUser,
} from "../controllers/auth.controller.js";

import { validate } from "../middleware/validator.middleware.js";

import { verifyJWT } from "../middleware/auth.middleware.js";

import { getCurrentUser } from "../controllers/auth.controller.js";

import { changeCurrentPassword } from "../controllers/auth.controller.js";

import { forgotPassword, resetForgotPassword } from "../controllers/auth.controller.js";

import { userForgotPasswordValidator, userResetForgotPasswordValidator } from "../validators/index.js";

const router = Router();

// Unsecured routes
router.route("/register").post(userRegisterValidator(),validate,registerUser);

router.route('/verify-email/:verificationToken').post(verifyEmail);


router.route('/login').post(userLoginValidator(), validate, login);

router.route('/refresh-access-token').post(refreshAccessToken)

router.route('/forgot-password').post(userForgotPasswordValidator(), validate, forgotPassword);

router.route('/reset-forgot-password/:resetToken').post(userResetForgotPasswordValidator(), validate, resetForgotPassword);








//secured route for logout
router.route('/logout').post(verifyJWT, logoutUser);

router.route('/resend-email-verification').post(verifyJWT, resendEmailVerification);

router.route('/current-user').post(verifyJWT, getCurrentUser);

router.route('/change-current-password').post(verifyJWT, changeCurrentPassword);

export default router;