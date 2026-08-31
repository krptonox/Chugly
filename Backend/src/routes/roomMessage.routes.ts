import { Router } from "express";

import { createRoomMessage } from "../controllers/RoomMessage.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/:roomId/messages").post(verifyJWT, createRoomMessage);

export default router;