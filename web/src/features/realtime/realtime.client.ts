import { io, type Socket } from "socket.io-client";
import type {
  ClientToServerEvents,
  RealtimeClient,
  RealtimeStatus,
  RealtimeStatusListener,
  RoomSubscriptionAck,
  RoomMessageCreatedEvent,
  ServerToClientEvents,
} from "./realtime.types";

const DEFAULT_API_BASE_URL = "http://localhost:3000/api/v1";
const ROOM_OPERATION_TIMEOUT_MS = 5000;

type RealtimeSocket = Socket<
  ServerToClientEvents,
  ClientToServerEvents
>;

const getBrowserOrigin = (): string =>
  typeof window === "undefined"
    ? "http://localhost:5173"
    : window.location.origin;

const getRealtimeOrigin = (): string => {
  const configuredRealtimeUrl = import.meta.env
    .VITE_REALTIME_URL as string | undefined;
  const configuredApiBaseUrl = import.meta.env
    .VITE_API_BASE_URL as string | undefined;
  const fallbackUrl = configuredApiBaseUrl || DEFAULT_API_BASE_URL;
  const url = configuredRealtimeUrl || fallbackUrl;

  try {
    return new URL(url, getBrowserOrigin()).origin;
  } catch {
    return new URL(
      DEFAULT_API_BASE_URL,
      getBrowserOrigin()
    ).origin;
  }
};

export const isRealtimeClientEnabled = (): boolean =>
  (import.meta.env.VITE_REALTIME_ENABLED as string | undefined) !==
  "false";

class RealtimeOperationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RealtimeOperationError";
  }
}

const getOperationError = (): RealtimeOperationError =>
  new RealtimeOperationError(
    "Live updates are not currently available."
  );

const emitRoomOperation = (
  socket: RealtimeSocket,
  event: "room:subscribe" | "room:unsubscribe",
  roomId: string
): Promise<RoomSubscriptionAck> => {
  if (!socket.connected) {
    return Promise.reject(getOperationError());
  }

  return new Promise((resolve, reject) => {
    socket
      .timeout(ROOM_OPERATION_TIMEOUT_MS)
      .emit(event, { roomId }, (error, response) => {
        if (error) {
          reject(
            new RealtimeOperationError(
              "The live room update request timed out."
            )
          );
          return;
        }

        if (!response) {
          reject(getOperationError());
          return;
        }

        resolve(response);
      });
  });
};

export const createRealtimeClient = (): RealtimeClient => {
  const socket = io(getRealtimeOrigin(), {
    autoConnect: false,
    transports: ["websocket"],
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: 5,
  }) as RealtimeSocket;
  const listeners = new Set<RealtimeStatusListener>();
  let currentStatus: RealtimeStatus = "disconnected";
  let connectionRequested = false;
  let hasConnected = false;

  const setStatus = (status: RealtimeStatus): void => {
    currentStatus = status;
    listeners.forEach((listener) => listener(status));
  };

  const handleConnect = (): void => {
    hasConnected = true;
    connectionRequested = true;
    setStatus("connected");
  };

  const handleConnectError = (): void => {
    setStatus(hasConnected ? "reconnecting" : "unavailable");
  };

  const handleDisconnect = (reason: string): void => {
    if (
      !connectionRequested ||
      reason === "io client disconnect" ||
      reason === "io server disconnect"
    ) {
      setStatus("disconnected");
      return;
    }

    setStatus("reconnecting");
  };

  socket.on("connect", handleConnect);
  socket.on("connect_error", handleConnectError);
  socket.on("disconnect", handleDisconnect);
  socket.io.on("reconnect_attempt", () => {
    setStatus("reconnecting");
  });
  socket.io.on("reconnect", handleConnect);
  socket.io.on("reconnect_failed", () => {
    setStatus("unavailable");
  });

  return {
    connect: () => {
      if (socket.connected || connectionRequested) {
        return;
      }

      connectionRequested = true;
      setStatus("connecting");
      socket.connect();
    },
    disconnect: () => {
      connectionRequested = false;

      if (socket.connected || socket.active) {
        socket.disconnect();
      } else {
        setStatus("disconnected");
      }
    },
    dispose: () => {
      connectionRequested = false;
      socket.disconnect();
      socket.removeAllListeners();
      socket.io.removeAllListeners();
      listeners.clear();
    },
    onStatus: (listener) => {
      listeners.add(listener);
      listener(currentStatus);
      return () => {
        listeners.delete(listener);
      };
    },
    subscribeToRoom: (roomId) =>
      emitRoomOperation(socket, "room:subscribe", roomId),
    unsubscribeFromRoom: (roomId) =>
      emitRoomOperation(socket, "room:unsubscribe", roomId),
    onRoomMessage: (listener) => {
      socket.on("room.message_created", listener);
      return () => {
        socket.off("room.message_created", listener);
      };
    },
  };
};
