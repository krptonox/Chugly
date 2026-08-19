import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Alert } from "../components/Alert";
import { Button } from "../components/Button";
import { FormField } from "../components/FormField";
import { Icon } from "../components/Icon";
import { Input } from "../components/Input";
import { LocationStatus } from "../components/LocationStatus";
import { PageHeader } from "../components/PageHeader";
import { PasswordInput } from "../components/PasswordInput";
import { RadioCardGroup } from "../components/RadioCardGroup";
import { SessionExpiredState } from "../components/SessionExpiredState";
import { useAuth } from "../features/auth/useAuth";
import { roomApi } from "../features/rooms/room.api";
import { getRoomErrorMessage, getRoomFieldErrors, isUnauthorizedRoomError } from "../features/rooms/room-errors";
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

    const validationErrors = validateCreateRoom(name, visibility, password, Boolean(location.coordinates));
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0 || !location.coordinates) {
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
        setFormError(getRoomErrorMessage(error, "We could not create the room."));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const signInAgain = async () => {
    await logout();
    navigate("/login", { replace: true, state: { from: "/rooms/create" } });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-7">
      <PageHeader
        eyebrow="New room"
        title="Create a Chugly room"
        description="Make a nearby place for a plan, a group, or whatever you want to keep moving."
        actions={<Link to="/rooms" className="text-sm font-bold text-moss hover:text-ink">Back to rooms</Link>}
      />

      {sessionExpired && <SessionExpiredState onSignIn={signInAgain} />}

      <form className="space-y-7 rounded-3xl border border-ink/10 bg-white p-6 shadow-card sm:p-8" onSubmit={handleSubmit} noValidate>
        {formError && <Alert message={formError} />}

        <FormField label="Room name" htmlFor="room-name" error={errors.name} required hint={`${name.length}/80`}>
          <Input
            id="room-name"
            placeholder="Sunday morning run"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={80}
            required
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "room-name-error" : undefined}
          />
        </FormField>

        <FormField label="Who can join?" error={errors.visibility} required>
          <RadioCardGroup
            label="Room visibility"
            value={visibility}
            onChange={setVisibility}
            options={[
              {
                value: "public" as const,
                title: "Public room",
                description: "Anyone nearby can see and join this room.",
                icon: <Icon name="users" size={18} />,
              },
              {
                value: "private" as const,
                title: "Private room",
                description: "Nearby people can find it, but a password is required.",
                icon: <Icon name="lock" size={18} />,
              },
            ]}
          />
        </FormField>

        {visibility === "private" && (
          <div className="animate-fade-up">
            <FormField label="Room password" htmlFor="room-password" error={errors.password} required hint="8–128 characters">
              <PasswordInput
                id="room-password"
                autoComplete="new-password"
                placeholder="Make it memorable"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? "room-password-error" : undefined}
              />
            </FormField>
          </div>
        )}

        <FormField label="Room location" error={errors.location} required>
          <LocationStatus status={location.status} errorMessage={location.errorMessage} onRetry={location.requestLocation} />
        </FormField>

        <div className="rounded-2xl border border-ink/10 bg-cream/80 p-4 text-sm leading-6 text-ink/60">
          Chugly uses your current location to place this room and show it to people within 1000 meters. Exact coordinates are never shown, and the server controls room capacity at 100 members.
        </div>

        <Button type="submit" loading={submitting} className="sticky bottom-4 w-full shadow-lift">
          Create room
        </Button>
      </form>
    </div>
  );
}
