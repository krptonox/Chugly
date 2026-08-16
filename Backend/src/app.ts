import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRouter from "./routes/auth.route.ts";

const app = express();

// --------------------------------------------------
// Middleware
// --------------------------------------------------

app.use(cookieParser());

app.use(
    cors({
        origin:
            process.env.CORS_ORIGIN?.split(",") ||
            "http://localhost:5173",

        credentials: true,

        methods: [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS",
        ],

        allowedHeaders: [
            "Content-Type",
            "Authorization",
        ],
    })
);

app.use(
    express.json({
        limit: "10mb",
    })
);

app.use(
    express.urlencoded({
        limit: "10mb",
        extended: true,
    })
);

app.use(express.static("public"));

// --------------------------------------------------
// Routes
// --------------------------------------------------

app.use(
    "/api/v1/auth",
    authRouter
);

// --------------------------------------------------
// Health Check
// --------------------------------------------------

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Chugly Backend is running!",
    });
});

export default app;