import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";

import {
    authenticateRealtimeSocket,
} from "./realtime-auth.js";
import {
    registerRoomSubscriptionHandlers,
} from "./realtime-subscriptions.js";
import {
    configureRoomEventPublisher,
} from "./room-event-publisher.js";

const DEFAULT_WEB_ORIGIN = "http://localhost:5173";

const getAllowedOrigins = (): string[] => {
    const configuredOrigins = process.env.CORS_ORIGIN
        ?.split(",")
        .map((origin) => origin.trim())
        .filter(Boolean);

    return configuredOrigins?.length
        ? configuredOrigins
        : [DEFAULT_WEB_ORIGIN];
};

/**
 * Creates the optional Socket.IO transport layer.
 *
 * Authentication, room authorization, and event handlers are added in later
 * realtime phases. The feature remains disabled unless explicitly enabled so
 * the existing REST server is always safe to run independently.
 */
export const createRealtimeServer = (
    httpServer: HttpServer
): Server | undefined => {

    console.log("1. createRealtimeServer called");

    console.log(
        "2. REALTIME_ENABLED:",
        process.env.REALTIME_ENABLED
    );

    if (process.env.REALTIME_ENABLED !== "true") {
        console.log("3. Realtime disabled");

        configureRoomEventPublisher(undefined);
        return undefined;
    }

    console.log("4. Realtime is enabled");

    const allowedOrigins = getAllowedOrigins();

    console.log("5. Allowed origins:", allowedOrigins);

    const io = new Server(httpServer, {
        transports: ["websocket"],
        cors: {
            origin: allowedOrigins,
            credentials: true,
        },
        allowRequest: (request, callback) => {
            const origin = request.headers.origin;

            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
                return;
            }

            callback("Realtime origin is not allowed", false);
        },
    });

    console.log("6. Socket.IO server created");

    io.use(async (socket, next) => {
        try {
            await authenticateRealtimeSocket(socket);
            next();
        } catch {
            const authenticationError = new Error(
                "Realtime authentication failed"
            ) as Error & {
                data?: { code: string };
            };

            authenticationError.data = {
                code: "AUTH_REQUIRED",
            };

            next(authenticationError);
        }
    });

    configureRoomEventPublisher(io);

    io.on("connection", (socket) => {
        console.log("7. SOCKET CONNECTED:", socket.id);

        registerRoomSubscriptionHandlers(socket);
    });

    console.log("8. Socket.IO realtime transport enabled");

    return io;
};