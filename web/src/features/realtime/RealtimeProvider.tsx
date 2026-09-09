import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "../auth/useAuth";
import {
  createRealtimeClient,
  isRealtimeClientEnabled,
} from "./realtime.client";
import type {
  RealtimeClient,
  RealtimeContextValue,
  RealtimeStatus,
  RoomSubscriptionAck,
} from "./realtime.types";

export const RealtimeContext = createContext<
  RealtimeContextValue | undefined
>(undefined);

const getInitialStatus = (): RealtimeStatus =>
  isRealtimeClientEnabled() ? "disconnected" : "disabled";

const unavailableOperation = (): Promise<RoomSubscriptionAck> =>
  Promise.reject(
    new Error("Live updates are not currently available.")
  );

export function RealtimeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { status: authStatus } = useAuth();
  const clientRef = useRef<RealtimeClient | null>(null);
  const [status, setStatus] = useState<RealtimeStatus>(
    getInitialStatus
  );

  useEffect(() => {
    const previousClient = clientRef.current;
    previousClient?.dispose();
    clientRef.current = null;

    if (authStatus !== "authenticated") {
      setStatus(getInitialStatus());
      return undefined;
    }

    if (!isRealtimeClientEnabled()) {
      setStatus("disabled");
      return undefined;
    }

    const client = createRealtimeClient();
    clientRef.current = client;
    const removeStatusListener = client.onStatus(setStatus);

    client.connect();

    return () => {
      removeStatusListener();

      if (clientRef.current === client) {
        clientRef.current = null;
      }

      client.dispose();
    };
  }, [authStatus]);

  const subscribeToRoom = useCallback(
    (roomId: string) =>
      clientRef.current?.subscribeToRoom(roomId) ??
      unavailableOperation(),
    []
  );

  const unsubscribeFromRoom = useCallback(
    (roomId: string) =>
      clientRef.current?.unsubscribeFromRoom(roomId) ??
      unavailableOperation(),
    []
  );

  const onRoomMessage = useCallback(
    (listener: Parameters<RealtimeClient["onRoomMessage"]>[0]) =>
      clientRef.current?.onRoomMessage(listener) ?? (() => undefined),
    []
  );

  const value = useMemo<RealtimeContextValue>(
    () => ({
      status,
      isConnected: status === "connected",
      subscribeToRoom,
      unsubscribeFromRoom,
      onRoomMessage,
    }),
    [status, subscribeToRoom, unsubscribeFromRoom, onRoomMessage]
  );

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime(): RealtimeContextValue {
  const context = useContext(RealtimeContext);

  if (!context) {
    throw new Error("useRealtime must be used inside RealtimeProvider");
  }

  return context;
}
