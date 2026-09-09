import { Router } from "express";

import {
	createRoomMessage,
	getRoomMessages,
} from "../controllers/RoomMessage.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router
	.route("/:roomId/messages")
	.get(verifyJWT, getRoomMessages)
	.post(verifyJWT, createRoomMessage);

export default router;