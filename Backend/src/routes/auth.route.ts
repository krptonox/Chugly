import { Router } from "express";

import { registerUser } from "../controllers/auth.controller.js";
import { userRegisterValidator } from '../validators/index.ts';
import { verifyEmail } from '../controllers/auth.controller.ts';
import { validate } from "../middleware/validator.middleware.ts";
import { login } from "../controllers/auth.controller.ts";
import { userLoginValidator } from '../validators/index.ts';
import { verifyJWT } from "../middleware/auth.middleware.ts";
import { logoutUser } from "../controllers/auth.controller.ts";

const router = Router();

// Unsecured routes
router.route("/register").post(userRegisterValidator(),validate,registerUser);

router.route('/verify-email/:verificationToken').post(verifyEmail);

router.route('/login').post(userLoginValidator(), validate, login);







//secured route for logout
router.route('/logout').post(verifyJWT, logoutUser);

export default router;