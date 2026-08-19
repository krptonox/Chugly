import { Button } from "./Button";
import { PasswordInput } from "./PasswordInput";
import { Alert } from "./Alert";
import type { RoomDetail } from "../features/rooms/room.types";

export function RoomActionPanel({
  room,
  joinPassword,
  onPasswordChange,
  onJoin,
  joining,
}: {
  room: RoomDetail;
  joinPassword: string;
  onPasswordChange: (value: string) => void;
  onJoin: () => void;
  joining: boolean;
}) {
  if (room.isMember || room.isAdmin) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-ink/10 bg-white p-6 shadow-card sm:p-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-coral-ink">Join this room</p>
        <h2 className="mt-2 text-2xl font-black text-ink">
          {room.isFull ? "This room is full" : "Ready to join?"}
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-ink/60">
          {room.visibility === "private"
            ? "This room is nearby, but you’ll need its password to join."
            : "Join the room to see its anonymous members and take part."}
        </p>
      </div>

      {room.isFull ? (
        <div className="mt-5">
          <Alert tone="info" message="This room has reached its 100-member capacity." />
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {room.visibility === "private" && (
            <PasswordInput
              id="join-room-password"
              autoComplete="current-password"
              placeholder="Room password"
              value={joinPassword}
              onChange={(event) => onPasswordChange(event.target.value)}
              aria-label="Private room password"
            />
          )}
          <Button type="button" loading={joining} onClick={onJoin}>
            Join room
          </Button>
        </div>
      )}
    </section>
  );
}
