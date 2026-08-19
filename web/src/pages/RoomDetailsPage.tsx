import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Alert } from "../components/Alert";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Dialog } from "../components/Dialog";
import { EmptyState } from "../components/EmptyState";
import { Icon } from "../components/Icon";
import { MemberRowSkeleton } from "../components/MemberRowSkeleton";
import { RoomActionPanel } from "../components/RoomActionPanel";
import { RoomMemberList } from "../components/RoomMemberList";
import { SessionExpiredState } from "../components/SessionExpiredState";
import { useToast } from "../components/ToastProvider";
import { useAuth } from "../features/auth/useAuth";
import { roomApi } from "../features/rooms/room.api";
import { getRoomErrorMessage, isUnauthorizedRoomError } from "../features/rooms/room-errors";
import { formatMemberCount } from "../features/rooms/room-formatters";
import type { RoomDetail, RoomMember } from "../features/rooms/room.types";

export function RoomDetailsPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { showToast } = useToast();
  const [room, setRoom] = useState<RoomDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [joinPassword, setJoinPassword] = useState("");
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [removingId, setRemovingId] = useState("");
  const [removeTarget, setRemoveTarget] = useState<RoomMember | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);

  const loadRoom = useCallback(async () => {
    if (!roomId) {
      setError("Room not found.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await roomApi.getRoom(roomId);
      setRoom(response.data.data);
    } catch (requestError) {
      if (isUnauthorizedRoomError(requestError)) {
        setSessionExpired(true);
      } else {
        setError(getRoomErrorMessage(requestError, "We could not load this room."));
      }
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    void loadRoom();
  }, [loadRoom]);

  const handleJoin = async () => {
    if (!roomId || !room || room.isFull) {
      return;
    }

    setActionError("");
    setActionMessage("");

    if (room.visibility === "private" && !joinPassword.trim()) {
      setActionError("Enter the private room password to join.");
      return;
    }

    setJoining(true);

    try {
      const response = await roomApi.joinRoom(roomId, room.visibility === "private" ? joinPassword : undefined);
      const result = response.data.data;
      setRoom(result.room);
      setJoinPassword("");
      const message = result.alreadyMember ? "You are already a member of this room." : "You joined the room.";
      setActionMessage(message);
      showToast(message);
    } catch (requestError) {
      if (isUnauthorizedRoomError(requestError)) {
        setSessionExpired(true);
      } else {
        setActionError(getRoomErrorMessage(requestError, "We could not join this room."));
      }
    } finally {
      setJoining(false);
    }
  };

  const handleLeave = async () => {
    if (!roomId || !room || !room.isMember) {
      return;
    }

    if (room.isAdmin && room.memberCount > 1) {
      setActionError("The room creator cannot leave while other members remain.");
      return;
    }

    setLeaving(true);
    setActionError("");
    setActionMessage("");

    try {
      const response = await roomApi.leaveRoom(roomId);
      if (response.data.data.deleted) {
        showToast("Room closed.");
        navigate("/rooms", { replace: true });
      } else {
        const message = "You left the room.";
        setActionMessage(message);
        showToast(message);
        await loadRoom();
      }
    } catch (requestError) {
      if (isUnauthorizedRoomError(requestError)) {
        setSessionExpired(true);
      } else {
        setActionError(getRoomErrorMessage(requestError, "We could not leave this room."));
      }
    } finally {
      setLeaving(false);
    }
  };

  const handleRemove = async () => {
    if (!roomId || !room?.isAdmin || !removeTarget) {
      return;
    }

    setRemovingId(removeTarget.membershipId);
    setActionError("");
    setActionMessage("");

    try {
      const response = await roomApi.removeRoomMember(roomId, removeTarget.membershipId);
      setRoom(response.data.data);
      setRemoveTarget(null);
      setActionMessage("Member removed from the room.");
      showToast("Member removed from the room.");
    } catch (requestError) {
      if (isUnauthorizedRoomError(requestError)) {
        setSessionExpired(true);
      } else {
        setActionError(getRoomErrorMessage(requestError, "We could not remove that member."));
      }
    } finally {
      setRemovingId("");
    }
  };

  const signInAgain = async () => {
    await logout();
    navigate("/login", { replace: true, state: { from: `/rooms/${roomId || ""}` } });
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-5" aria-busy="true" aria-label="Loading room details">
        <div className="h-8 w-32 animate-pulse rounded-lg bg-ink/[0.08]" />
        <div className="space-y-5 rounded-[2rem] bg-ink p-7 shadow-soft sm:p-10">
          <div className="h-4 w-24 animate-pulse rounded bg-white/10" />
          <div className="h-12 w-3/4 animate-pulse rounded bg-white/10" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-white/10" />
        </div>
        <MemberRowSkeleton />
        <MemberRowSkeleton />
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="mx-auto max-w-3xl space-y-5">
        {sessionExpired ? <SessionExpiredState onSignIn={signInAgain} /> : <Alert message={error || "Room not found."} />}
        <Link to="/rooms" className="inline-flex min-h-11 items-center rounded-xl bg-ink px-4 py-2.5 text-sm font-bold text-white hover:bg-moss">Back to rooms</Link>
      </div>
    );
  }

  const occupancy = room.maxMembers > 0 ? (room.memberCount / room.maxMembers) * 100 : 0;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Link to="/rooms" className="inline-flex items-center gap-2 text-sm font-bold text-moss transition hover:text-ink">
          <Icon name="arrow-right" size={16} className="rotate-180" />
          Back to rooms
        </Link>
        <Badge tone="moss">
          {room.visibility === "private" && <Icon name="lock" size={12} />}
          {room.visibility}
        </Badge>
      </div>

      {sessionExpired && <SessionExpiredState onSignIn={signInAgain} />}

      <section className="relative overflow-hidden rounded-[2rem] bg-ink px-6 py-8 text-white shadow-soft sm:px-10 sm:py-10">
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-sage">Room details</p>
            {room.isFull && <Badge tone="dark" className="bg-coral/20 text-coral">Full</Badge>}
            {room.isMember && <Badge tone="dark" className="bg-sage/15 text-sage">You’re in</Badge>}
            {room.isAdmin && <Badge tone="dark" className="bg-white/15 text-white">Admin</Badge>}
          </div>
          <h1 className="mt-4 break-words text-4xl font-black tracking-[-0.05em] sm:text-5xl">{room.name}</h1>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/65">
            <span>{formatMemberCount(room.memberCount, room.maxMembers)}</span>
            <span>{room.isMember ? "Anonymous members are visible" : "Join to see who is here"}</span>
          </div>
          <div className="mt-6 max-w-sm">
            <div className="mb-2 flex justify-between text-xs font-semibold text-white/55">
              <span>Room capacity</span>
              <span>{Math.round(occupancy)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/15" role="progressbar" aria-label="Room capacity" aria-valuenow={Math.round(occupancy)} aria-valuemin={0} aria-valuemax={100}>
              <div className={`h-full rounded-full ${room.isFull ? "bg-coral" : "bg-sage"}`} style={{ width: `${Math.min(100, occupancy)}%` }} />
            </div>
          </div>
        </div>
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full border-[34px] border-sage/10" aria-hidden="true" />
      </section>

      {actionError && <Alert message={actionError} />}
      {actionMessage && <Alert tone="success" message={actionMessage} />}

      <RoomActionPanel
        room={room}
        joinPassword={joinPassword}
        onPasswordChange={setJoinPassword}
        onJoin={() => void handleJoin()}
        joining={joining}
      />

      {room.isMember && (
        <section className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-coral-ink">Anonymous members</p>
              <h2 className="mt-2 text-2xl font-black text-ink">Who is here</h2>
            </div>
            <span className="text-sm font-semibold text-ink/50">{room.members.length} shown</span>
          </div>
          {room.members.length > 0 ? (
            <RoomMemberList
              members={room.members}
              canRemove={room.isAdmin}
              removingId={removingId}
              onRemove={(membershipId) => {
                const member = room.members.find((item) => item.membershipId === membershipId);
                if (member) setRemoveTarget(member);
              }}
            />
          ) : (
            <EmptyState eyebrow="No members shown" title="The member list is empty." description="Refresh the room to check its current membership." action={<Button variant="secondary" onClick={() => void loadRoom()}>Refresh room</Button>} />
          )}
        </section>
      )}

      {room.isMember && (
        <section className="flex flex-col gap-5 rounded-3xl border border-coral/15 bg-white p-5 shadow-card sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="font-bold text-ink">{room.isAdmin && room.memberCount === 1 ? "Close this room" : "Leave this room"}</p>
            <p className="mt-1 max-w-xl text-sm leading-6 text-ink/55">
              {room.isAdmin && room.memberCount > 1
                ? "Remove the remaining members before closing the room."
                : room.isAdmin
                  ? "As the only member, leaving will close this room."
                  : "You can rejoin later if the room is still nearby."}
            </p>
          </div>
          <Button type="button" variant="danger" loading={leaving} disabled={room.isAdmin && room.memberCount > 1} onClick={() => void handleLeave()}>
            {room.isAdmin && room.memberCount === 1 ? "Close room" : "Leave room"}
          </Button>
        </section>
      )}

      <Dialog
        open={Boolean(removeTarget)}
        title="Remove this member?"
        description={removeTarget ? `${removeTarget.displayName} will be removed from ${room.name}. They can join again if the room is still nearby.` : undefined}
        onClose={() => setRemoveTarget(null)}
      >
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => setRemoveTarget(null)}>Cancel</Button>
          <Button variant="danger" loading={Boolean(removingId)} onClick={() => void handleRemove()}>Remove member</Button>
        </div>
      </Dialog>
    </div>
  );
}
