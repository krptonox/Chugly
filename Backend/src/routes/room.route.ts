import { Router } from "express";

import {
    createRoom,
    getNearbyRooms,
    getMyRooms,
    getRoom,
    joinRoom,
    leaveRoom,
    removeRoomMember,
} from "../controllers/room.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validator.middleware.js";
import {
    createRoomValidator,
    joinRoomValidator,
    membershipIdValidator,
    nearbyRoomsValidator,
    roomIdValidator,
} from "../validators/index.js";

const router = Router();

router.use(verifyJWT);

router
    .route("/")
    .post(createRoomValidator(), validate, createRoom);

router
    .route("/nearby")
    .get(nearbyRoomsValidator(), validate, getNearbyRooms);

router.route("/mine").get(getMyRooms);

router
    .route("/:roomId/join")
    .post(
        roomIdValidator(),
        joinRoomValidator(),
        validate,
        joinRoom
    );

router
    .route("/:roomId/leave")
    .post(roomIdValidator(), validate, leaveRoom);

router
    .route("/:roomId/members/:membershipId")
    .delete(
        roomIdValidator(),
        membershipIdValidator(),
        validate,
        removeRoomMember
    );

router
    .route("/:roomId")
    .get(roomIdValidator(), validate, getRoom);

export default router;
