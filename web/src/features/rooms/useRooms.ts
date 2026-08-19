import { useCallback, useEffect, useState } from "react";
import { roomApi } from "./room.api";
import { getRoomErrorMessage, isUnauthorizedRoomError } from "./room-errors";
import { useGeolocation } from "./useGeolocation";
import type { RoomSummary } from "./room.types";

export function useRooms() {
  const location = useGeolocation();
  const [nearbyRooms, setNearbyRooms] = useState<RoomSummary[]>([]);
  const [myRooms, setMyRooms] = useState<RoomSummary[]>([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [myRoomsLoading, setMyRoomsLoading] = useState(true);
  const [nearbyError, setNearbyError] = useState("");
  const [myRoomsError, setMyRoomsError] = useState("");
  const [sessionExpired, setSessionExpired] = useState(false);

  const loadMyRooms = useCallback(async () => {
    setMyRoomsLoading(true);
    setMyRoomsError("");

    try {
      const response = await roomApi.getMyRooms();
      setMyRooms(response.data.data);
    } catch (error) {
      if (isUnauthorizedRoomError(error)) {
        setSessionExpired(true);
      } else {
        setMyRoomsError(getRoomErrorMessage(error, "We could not load your rooms."));
      }
    } finally {
      setMyRoomsLoading(false);
    }
  }, []);

  const loadNearbyRooms = useCallback(async () => {
    if (!location.coordinates) {
      return;
    }

    setNearbyLoading(true);
    setNearbyError("");

    try {
      const response = await roomApi.getNearbyRooms(
        location.coordinates.latitude,
        location.coordinates.longitude
      );
      setNearbyRooms(response.data.data);
    } catch (error) {
      if (isUnauthorizedRoomError(error)) {
        setSessionExpired(true);
      } else {
        setNearbyError(getRoomErrorMessage(error, "We could not load nearby rooms."));
      }
    } finally {
      setNearbyLoading(false);
    }
  }, [location.coordinates]);

  useEffect(() => {
    void loadMyRooms();
    location.requestLocation();
  }, [loadMyRooms, location.requestLocation]);

  useEffect(() => {
    void loadNearbyRooms();
  }, [loadNearbyRooms]);

  return {
    location,
    nearbyRooms,
    myRooms,
    nearbyLoading,
    myRoomsLoading,
    nearbyError,
    myRoomsError,
    sessionExpired,
    setSessionExpired,
    loadMyRooms,
    loadNearbyRooms,
  };
}
