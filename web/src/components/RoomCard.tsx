import { Link } from "react-router-dom";
import type { RoomSummary } from "../features/rooms/room.types";

export function RoomCard({ room }: { room: RoomSummary }) {
  return (
    <article className="flex flex-col gap-5 rounded-3xl border border-ink/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-lg font-black text-ink">
            {room.name}
          </h3>
          <span className="rounded-full bg-sage px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-moss">
            {room.visibility}
          </span>
          {room.isFull && (
            <span className="rounded-full bg-coral/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-[#a84630]">
              Full
            </span>
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink/55">
          {room.distanceMeters !== undefined && (
            <span>{Math.round(room.distanceMeters)} m away</span>
          )}
          <span>
            {room.memberCount}/{room.maxMembers} members
          </span>
        </div>
        <div className="mt-3 text-sm font-semibold text-moss">
          {room.isMember ? "You are a member" : "Not a member"}
          {room.isAdmin && " · Admin"}
        </div>
      </div>

      <Link
        to={`/rooms/${encodeURIComponent(room._id)}`}
        className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-moss"
      >
        View room
      </Link>
    </article>
  );
}
