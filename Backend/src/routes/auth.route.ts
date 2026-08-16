import { Router } from "express";

import { registerUser } from "../controllers/auth.controller.js";


const router = Router();

// Unsecured routes
router
    .route("/register")
    .post(
        registerUser
    );

export default router;