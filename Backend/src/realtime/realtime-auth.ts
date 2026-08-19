import { parse as parseCookies } from "cookie";
import type { Socket } from "socket.io";

import {
    authenticateAccessToken,
} from "../middleware/auth.middleware.js";

const ACCESS_TOKEN_COOKIE = "accessToken";

export class RealtimeAuthenticationError extends Error {
    readonly code = "AUTH_REQUIRED";

    constructor() {
        super("Realtime authentication failed");
        this.name = "RealtimeAuthenticationError";
    }
}

/**
 * Authenticates a Socket.IO handshake with the existing HttpOnly access cookie.
 * The raw token is never attached to the socket or written to logs.
 */
export const authenticateRealtimeSocket = async (
    socket: Socket
): Promise<void> => {
    const cookieHeader = socket.handshake.headers.cookie;

    if (typeof cookieHeader !== "string") {
        throw new RealtimeAuthenticationError();
    }

    let cookies: Record<string, string>;

    try {
        cookies = parseCookies(cookieHeader);
    } catch {
        throw new RealtimeAuthenticationError();
    }

    const accessToken = cookies[ACCESS_TOKEN_COOKIE];

    if (!accessToken) {
        throw new RealtimeAuthenticationError();
    }

    const user = await authenticateAccessToken(accessToken);

    socket.data.user = user;
    socket.data.userId = user._id.toString();
};
