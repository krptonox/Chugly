import { Router } from "express";

import { registerUser } from "../controllers/auth.controller.js";
import { userRegisterValidator } from '../validators/index.ts';
import { validate } from "../middleware/validator.middleware.ts";

const router = Router();

// Unsecured routes
router
    .route("/register")
    .post(
        userRegisterValidator(),
        validate,
        registerUser
    );

export default router;