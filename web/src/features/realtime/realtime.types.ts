export type RealtimeStatus =
  | "disabled"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "disconnected"
  | "unavailable";

export type RoomSubscriptionErrorCode =
  | "AUTH_REQUIRED"
  | "INVALID_ROOM_ID"
  | "ROOM_NOT_FOUND"
  | "ROOM_ACCESS_DENIED"
  | "REALTIME_ERROR";

export type RoomSubscriptionPayload = {
  roomId: string;
};

export type RoomSubscriptionAck =
  | {
      ok: true;
      roomId: string;
    }
  | {
      ok: false;
      code: RoomSubscriptionErrorCode;
      message: string;
    };

export type RoomSubscriptionStatus =
  | "idle"
  | "subscribing"
  | "subscribed"
  | "error";

export type RealtimeStatusListener = (
  status: RealtimeStatus
) => void;

export interface ServerToClientEvents {}

export interface ClientToServerEvents {
  "room:subscribe": (
    payload: RoomSubscriptionPayload,
    acknowledge: (response: RoomSubscriptionAck) => void
  ) => void;
  "room:unsubscribe": (
    payload: RoomSubscriptionPayload,
    acknowledge: (response: RoomSubscriptionAck) => void
  ) => void;
}

export type RealtimeClient = {
  connect: () => void;
  disconnect: () => void;
  dispose: () => void;
  onStatus: (
    listener: RealtimeStatusListener
  ) => () => void;
  subscribeToRoom: (
    roomId: string
  ) => Promise<RoomSubscriptionAck>;
  unsubscribeFromRoom: (
    roomId: string
  ) => Promise<RoomSubscriptionAck>;
};

export type RealtimeContextValue = {
  status: RealtimeStatus;
  isConnected: boolean;
  subscribeToRoom: RealtimeClient["subscribeToRoom"];
  unsubscribeFromRoom: RealtimeClient["unsubscribeFromRoom"];
};
