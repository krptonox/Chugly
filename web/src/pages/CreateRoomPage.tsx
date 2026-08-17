import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Alert } from "../components/Alert";
import { Button } from "../components/Button";
import { FormField } from "../components/FormField";
import { Input } from "../components/Input";
import { PasswordInput } from "../components/PasswordInput";
import { useAuth } from "../features/auth/useAuth";
import { roomApi } from "../features/rooms/room.api";
import {
  getRoomErrorMessage,
  getRoomFieldErrors,
  isUnauthorizedRoomError,
} from "../features/rooms/room-errors";
import { validateCreateRoom } from "../features/rooms/room.validation";
import { useGeolocation } from "../features/rooms/useGeolocation";
import type { RoomVisibility } from "../features/rooms/room.types";
import type { FieldErrors } from "../lib/api-errors";

export function CreateRoomPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const location = useGeolocation();
  const [name, setName] = useState("");
  const [visibility, setVisibility] = useState<RoomVisibility>("public");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    location.requestLocation();
  }, [location.requestLocation]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    setSessionExpired(false);

    const validationErrors = validateCreateRoom(
      name,
      visibility,
      password,
      Boolean(location.coordinates)
    );
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    if (!location.coordinates) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await roomApi.createRoom({
        name: name.trim(),
        visibility,
        ...(visibility === "private" ? { password } : {}),
        latitude: location.coordinates.latitude,
        longitude: location.coordinates.longitude,
      });

      navigate(`/rooms/${encodeURIComponent(response.data.data._id)}`);
    } catch (error) {
      if (isUnauthorizedRoomError(error)) {
        setSessionExpired(true);
      } else {
        setErrors(getRoomFieldErrors(error));
        setFormError(
          getRoomErrorMessage(error, "We could not create the room.")
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const signInAgain = async () => {
    await logout();
    navigate("/login", {
      replace: true,
      state: { from: "/rooms/create" },
    });
  };

  const locationMessage =
    location.status === "loading"
      ? "Finding your current location..."
      : location.status === "success"
        ? "Current location ready."
        : location.errorMessage || "Location is required to create a room.";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-coral">
            New room
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-ink sm:text-4xl">
            Create a Chugly room
          </h1>
        </div>
        <Link
          to="/rooms"
          className="text-sm font-bold text-moss transition hover:text-ink"
        >
          Back to rooms
        </Link>
      </div>

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

      <form
        className="space-y-5 rounded-3xl border border-ink/10 bg-white p-6 shadow-sm sm:p-8"
        onSubmit={handleSubmit}
        noValidate
      >
        {formError && <Alert message={formError} />}

        <FormField label="Room name" htmlFor="room-name" error={errors.name}>
          <Input
            id="room-name"
            placeholder="Sunday morning run"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={80}
          />
        </FormField>

        <FormField
          label="Visibility"
          htmlFor="room-visibility"
          error={errors.visibility}
        >
          <select
            id="room-visibility"
            className="min-h-11 w-full rounded-xl border border-ink/15 bg-cream px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-moss focus:ring-2 focus:ring-moss/15"
            value={visibility}
            onChange={(event) =>
              setVisibility(event.target.value as RoomVisibility)
            }
          >
            <option value="public">Public — anyone nearby can join</option>
            <option value="private">Private — password required</option>
          </select>
        </FormField>

        {visibility === "private" && (
          <FormField
            label="Room password"
            htmlFor="room-password"
            error={errors.password}
          >
            <PasswordInput
              id="room-password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </FormField>
        )}

        <FormField label="Current location" error={errors.location}>
          <div className="rounded-xl border border-ink/10 bg-cream px-3.5 py-3 text-sm text-ink/60">
            {locationMessage}
          </div>
          {(location.status === "permission-denied" ||
            location.status === "unavailable" ||
            location.status === "timeout" ||
            location.status === "unsupported") && (
            <button
              type="button"
              className="mt-2 text-sm font-bold text-moss transition hover:text-ink"
              onClick={location.requestLocation}
            >
              Try location again
            </button>
          )}
        </FormField>

        <p className="text-xs leading-5 text-ink/45">
          Chugly uses your current location to place this room and find it for nearby users. Capacity and discovery radius are controlled by the server.
        </p>

        <Button
          type="submit"
          loading={submitting}
          className="w-full"
        >
          Create room
        </Button>
      </form>
    </div>
  );
}
