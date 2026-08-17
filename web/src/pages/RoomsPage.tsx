import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Alert } from "../components/Alert";
import { EmptyState } from "../components/EmptyState";
import { RoomCard } from "../components/RoomCard";
import { useAuth } from "../features/auth/useAuth";
import { roomApi } from "../features/rooms/room.api";
import {
  getRoomErrorMessage,
  isUnauthorizedRoomError,
} from "../features/rooms/room-errors";
import { useGeolocation } from "../features/rooms/useGeolocation";
import type { RoomSummary } from "../features/rooms/room.types";

export function RoomsPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
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
        setMyRoomsError(
          getRoomErrorMessage(
            error,
            "We could not load your rooms."
          )
        );
      }
    } finally {
      setMyRoomsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMyRooms();
    location.requestLocation();
  }, [loadMyRooms, location.requestLocation]);

  useEffect(() => {
    const coordinates = location.coordinates;

    if (!coordinates) {
      return;
    }

    const loadNearbyRooms = async () => {
      setNearbyLoading(true);
      setNearbyError("");

      try {
        const response = await roomApi.getNearbyRooms(
          coordinates.latitude,
          coordinates.longitude
        );
        setNearbyRooms(response.data.data);
      } catch (error) {
        if (isUnauthorizedRoomError(error)) {
          setSessionExpired(true);
        } else {
          setNearbyError(
            getRoomErrorMessage(
              error,
              "We could not load nearby rooms."
            )
          );
        }
      } finally {
        setNearbyLoading(false);
      }
    };

    void loadNearbyRooms();
  }, [location.coordinates]);

  const signInAgain = async () => {
    await logout();
    navigate("/login", {
      replace: true,
      state: { from: "/rooms" },
    });
  };

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-6 rounded-[2rem] bg-ink px-6 py-8 text-white shadow-soft sm:px-10 sm:py-10 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-sage">
            Room discovery
          </p>
          <h1 className="mt-4 max-w-2xl text-4xl font-black tracking-[-0.05em] sm:text-5xl">
            Find a Chugly room nearby.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/60 sm:text-base">
            Explore public and private rooms within 1000 meters of your current location.
          </p>
        </div>
        <Link
          to="/rooms/create"
          className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-sage px-4 py-2.5 text-sm font-bold text-moss transition hover:-translate-y-0.5 hover:bg-white"
        >
          Create a room
        </Link>
      </section>

      {sessionExpired && (
        <div className="space-y-3">
          <Alert message="Your session has expired. Sign in again to continue." />
          <button
            type="button"
            className="rounded-xl bg-ink px-4 py-2.5 text-sm font-bold text-white transition hover:bg-moss"
            onClick={() => void signInAgain()}
          >
            Sign in again
          </button>
        </div>
      )}

      <section className="space-y-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-coral">
            Within 1000 meters
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-ink">
            Nearby rooms
          </h2>
        </div>

        {location.status === "loading" && (
          <Alert
            tone="info"
            message="Finding your current location..."
          />
        )}

        {(location.status === "permission-denied" ||
          location.status === "unavailable" ||
          location.status === "timeout" ||
          location.status === "unsupported") && (
          <div className="space-y-3">
            <Alert message={location.errorMessage} />
            <button
              type="button"
              className="rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-sm font-bold text-ink transition hover:border-moss hover:text-moss"
              onClick={location.requestLocation}
            >
              Try location again
            </button>
          </div>
        )}

        {nearbyLoading && (
          <Alert tone="info" message="Loading nearby rooms..." />
        )}

        {nearbyError && <Alert message={nearbyError} />}

        {location.status === "success" &&
          !nearbyLoading &&
          !nearbyError &&
          nearbyRooms.length === 0 && (
            <EmptyState
              eyebrow="No rooms yet"
              title="There are no rooms nearby."
              description="Try creating the first Chugly room in your area."
            />
          )}

        {nearbyRooms.length > 0 && (
          <div className="grid gap-4 lg:grid-cols-2">
            {nearbyRooms.map((room) => (
              <RoomCard key={room._id} room={room} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-coral">
            Persistent membership
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-ink">
            Your rooms
          </h2>
        </div>

        {myRoomsLoading && (
          <Alert tone="info" message="Loading your rooms..." />
        )}
        {myRoomsError && <Alert message={myRoomsError} />}
        {!myRoomsLoading && !myRoomsError && myRooms.length === 0 && (
          <EmptyState
            eyebrow="Nothing joined"
            title="You are not in any rooms yet."
            description="Join a nearby room or create one for your group."
          />
        )}
        {myRooms.length > 0 && (
          <div className="grid gap-4 lg:grid-cols-2">
            {myRooms.map((room) => (
              <RoomCard key={room._id} room={room} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
