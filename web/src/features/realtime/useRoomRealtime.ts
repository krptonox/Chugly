import { useEffect, useState } from "react";
import { useRealtime } from "./RealtimeProvider";
import type {
  RealtimeStatus,
  RoomSubscriptionAck,
  RoomSubscriptionStatus,
} from "./realtime.types";

const getSubscriptionError = (
  response: RoomSubscriptionAck
): string =>
  response.ok
    ? ""
    : response.message || "Unable to subscribe to live room updates.";

export function useRoomRealtime(roomId?: string): {
  realtimeStatus: RealtimeStatus;
  subscriptionStatus: RoomSubscriptionStatus;
  subscriptionError: string;
} {
  const {
    status: realtimeStatus,
    subscribeToRoom,
    unsubscribeFromRoom,
  } = useRealtime();
  const [subscriptionStatus, setSubscriptionStatus] =
    useState<RoomSubscriptionStatus>("idle");
  const [subscriptionError, setSubscriptionError] = useState("");

  useEffect(() => {
    let active = true;

    if (!roomId || realtimeStatus !== "connected") {
      setSubscriptionStatus("idle");
      setSubscriptionError("");
      return () => {
        active = false;
      };
    }

    setSubscriptionStatus("subscribing");
    setSubscriptionError("");

    void subscribeToRoom(roomId)
      .then((response) => {
        if (!active) {
          return;
        }

        if (response.ok) {
          setSubscriptionStatus("subscribed");
          return;
        }

        setSubscriptionStatus("error");
        setSubscriptionError(getSubscriptionError(response));
      })
      .catch((error: unknown) => {
        if (!active) {
          return;
        }

        setSubscriptionStatus("error");
        setSubscriptionError(
          error instanceof Error
            ? error.message
            : "Live room updates are unavailable."
        );
      });

    return () => {
      active = false;
      void unsubscribeFromRoom(roomId).catch(() => undefined);
    };
  }, [
    realtimeStatus,
    roomId,
    subscribeToRoom,
    unsubscribeFromRoom,
  ]);

  return {
    realtimeStatus,
    subscriptionStatus,
    subscriptionError,
  };
}
