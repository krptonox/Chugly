import { Badge } from "./Badge";
import { Icon } from "./Icon";
import type { RoomMember } from "../features/rooms/room.types";
import { formatJoinedAt, getMemberAvatarTone, getMemberInitial } from "../features/rooms/room-formatters";

export function RoomMemberList({
  members,
  canRemove,
  removingId,
  onRemove,
}: {
  members: RoomMember[];
  canRemove: boolean;
  removingId: string;
  onRemove: (membershipId: string) => void;
}) {
  return (
    <div className="divide-y divide-ink/10 overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-card">
      {members.map((member) => {
        const isAdmin = member.role === "admin";

        return (
          <div key={member.membershipId} className="flex items-center justify-between gap-4 px-4 py-4 transition hover:bg-cream/60 sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-black ${getMemberAvatarTone(member.displayName)}`} aria-hidden="true">
                {getMemberInitial(member.displayName)}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-bold text-ink">{member.displayName}</p>
                  {isAdmin && <Badge tone="moss">Admin</Badge>}
                </div>
                <p className="mt-1 text-xs text-ink/45">{formatJoinedAt(member.joinedAt)}</p>
              </div>
            </div>

            {canRemove && !isAdmin && (
              <button
                type="button"
                className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-coral-ink transition hover:bg-coral/10 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => onRemove(member.membershipId)}
                disabled={removingId === member.membershipId}
                aria-label={`Remove ${member.displayName}`}
              >
                <Icon name="plus" size={14} className="rotate-45" />
                {removingId === member.membershipId ? "Removing…" : "Remove"}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
