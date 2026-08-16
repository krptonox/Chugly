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

const router = Router();

// Unsecured routes
router.route("/register").post(userRegisterValidator(),validate,registerUser);

router.route('/verify-email/:verificationToken').post(verifyEmail);


router.route('/login').post(userLoginValidator(), validate, login);

router.route('/refresh-access-token').post(refreshAccessToken)







//secured route for logout
router.route('/logout').post(verifyJWT, logoutUser);

router.route('/resend-email-verification').post(verifyJWT, resendEmailVerification);

router.route('/current-user').post(verifyJWT, getCurrentUser);

router.route('/change-current-password').post(verifyJWT, changeCurrentPassword);

export default router;