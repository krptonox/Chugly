import type { RoomMember } from "../features/rooms/room.types";

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
    <div className="divide-y divide-ink/10 rounded-2xl border border-ink/10 bg-white">
      {members.map((member) => {
        const isAdmin = member.role === "admin";

        return (
          <div
            key={member.membershipId}
            className="flex items-center justify-between gap-4 px-4 py-4 first:rounded-t-2xl last:rounded-b-2xl"
          >
            <div className="min-w-0">
              <p className="truncate font-bold text-ink">
                {member.displayName}
              </p>
              <p className="mt-1 text-xs text-ink/45">
                {isAdmin ? "Room admin" : "Member"}
              </p>
            </div>

            {canRemove && !isAdmin && (
              <button
                type="button"
                className="shrink-0 rounded-lg px-3 py-2 text-xs font-bold text-coral transition hover:bg-coral/10 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => onRemove(member.membershipId)}
                disabled={removingId === member.membershipId}
              >
                {removingId === member.membershipId
                  ? "Removing..."
                  : "Remove"}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
