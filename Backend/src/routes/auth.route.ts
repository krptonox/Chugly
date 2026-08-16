import { Router } from "express";

import { registerUser } from "../controllers/auth.controller.js";
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


const router = Router();

// Unsecured routes
router.route("/register").post(userRegisterValidator(),validate,registerUser);

router.route('/verify-email/:verificationToken').post(verifyEmail);

router.route('/login').post(userLoginValidator(), validate, login);







//secured route for logout
router.route('/logout').post(verifyJWT, logoutUser);

export default router;