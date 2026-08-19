import { Link } from "react-router-dom";
import { Badge } from "./Badge";
import { Icon } from "./Icon";
import { ProgressBar } from "./ProgressBar";
import type { RoomSummary } from "../features/rooms/room.types";
import { formatDistance, formatMemberCount } from "../features/rooms/room-formatters";

export function RoomCard({ room }: { room: RoomSummary }) {
  const occupancy = room.maxMembers > 0 ? (room.memberCount / room.maxMembers) * 100 : 0;

  return (
    <article className="group flex flex-col gap-5 rounded-3xl border border-ink/10 bg-white p-5 shadow-card transition duration-200 hover:-translate-y-1 hover:shadow-lift focus-within:border-moss/40 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-lg font-black text-ink">{room.name}</h3>
          <Badge tone="moss">
            {room.visibility === "private" && <Icon name="lock" size={12} />}
            {room.visibility}
          </Badge>
          {room.isFull && <Badge tone="coral">Full</Badge>}
        </div>

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-ink/55">
          <span className="inline-flex items-center gap-1.5">
            <Icon name="map-pin" size={15} />
            {formatDistance(room.distanceMeters)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Icon name="users" size={15} />
            {formatMemberCount(room.memberCount, room.maxMembers)}
          </span>
        </div>

        <div className="mt-4 max-w-xs">
          <ProgressBar
            value={occupancy}
            tone={room.isFull ? "coral" : "moss"}
            label={room.isFull ? "At capacity" : `${Math.round(occupancy)}% full`}
          />
        </div>

        <p className="mt-3 text-sm font-semibold text-moss">
          {room.isMember ? "You’re in" : "Available to join"}
          {room.isAdmin && " · Admin"}
        </p>
      </div>

      <Link
        to={`/rooms/${encodeURIComponent(room._id)}`}
        className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-moss focus:outline-none focus:ring-2 focus:ring-moss/30"
      >
        View room
        <Icon name="arrow-right" size={16} />
      </Link>
    </article>
  );
}
