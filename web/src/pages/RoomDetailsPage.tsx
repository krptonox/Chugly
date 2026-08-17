import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Alert } from "../components/Alert";
import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";
import { PasswordInput } from "../components/PasswordInput";
import { RoomMemberList } from "../components/RoomMemberList";
import { useAuth } from "../features/auth/useAuth";
import { roomApi } from "../features/rooms/room.api";
import {
  getRoomErrorMessage,
  isUnauthorizedRoomError,
} from "../features/rooms/room-errors";
import type { RoomDetail } from "../features/rooms/room.types";

export function RoomDetailsPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [room, setRoom] = useState<RoomDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [joinPassword, setJoinPassword] = useState("");
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [removingId, setRemovingId] = useState("");
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
        setError(
          getRoomErrorMessage(requestError, "We could not load this room.")
        );
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
      const response = await roomApi.joinRoom(
        roomId,
        room.visibility === "private" ? joinPassword : undefined
      );
      const result = response.data.data;
      setRoom(result.room);
      setJoinPassword("");
      setActionMessage(
        result.alreadyMember
          ? "You are already a member of this room."
          : "You joined the room."
      );
    } catch (requestError) {
      if (isUnauthorizedRoomError(requestError)) {
        setSessionExpired(true);
      } else {
        setActionError(
          getRoomErrorMessage(
            requestError,
            "We could not join this room."
          )
        );
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
      setActionError(
        "The room creator cannot leave while other members remain."
      );
      return;
    }

    setLeaving(true);
    setActionError("");
    setActionMessage("");

    try {
      const response = await roomApi.leaveRoom(roomId);

      if (response.data.data.deleted) {
        navigate("/rooms", { replace: true });
      } else {
        setActionMessage("You left the room.");
        await loadRoom();
      }
    } catch (requestError) {
      if (isUnauthorizedRoomError(requestError)) {
        setSessionExpired(true);
      } else {
        setActionError(
          getRoomErrorMessage(
            requestError,
            "We could not leave this room."
          )
        );
      }
    } finally {
      setLeaving(false);
    }
  };

  const handleRemove = async (membershipId: string) => {
    if (!roomId || !room?.isAdmin) {
      return;
    }

    if (!window.confirm("Remove this anonymous member from the room?")) {
      return;
    }

    setRemovingId(membershipId);
    setActionError("");
    setActionMessage("");

    try {
      const response = await roomApi.removeRoomMember(
        roomId,
        membershipId
      );
      setRoom(response.data.data);
      setActionMessage("Member removed from the room.");
    } catch (requestError) {
      if (isUnauthorizedRoomError(requestError)) {
        setSessionExpired(true);
      } else {
        setActionError(
          getRoomErrorMessage(
            requestError,
            "We could not remove that member."
          )
        );
      }
    } finally {
      setRemovingId("");
    }
  };

  const signInAgain = async () => {
    await logout();
    navigate("/login", {
      replace: true,
      state: { from: `/rooms/${roomId || ""}` },
    });
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl">
        <Alert tone="info" message="Loading room details..." />
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="mx-auto max-w-3xl space-y-5">
        {sessionExpired ? (
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
        ) : (
          <Alert message={error || "Room not found."} />
        )}
        <Link
          to="/rooms"
          className="inline-flex rounded-xl bg-ink px-4 py-2.5 text-sm font-bold text-white transition hover:bg-moss"
        >
          Back to rooms
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/rooms"
          className="text-sm font-bold text-moss transition hover:text-ink"
        >
          ← Back to rooms
        </Link>
        <span className="rounded-full bg-sage px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-moss">
          {room.visibility}
        </span>
      </div>

      {sessionExpired && (
        <div className="space-y-3">
          <Alert message="Your session has expired. Sign in again to continue." />
          <button
            type="button"
            className="rounded-xl bg-ink px-4 py-2.5 text-sm font-bold text-white transition hover:bg-moss"
            onClick={signInAgain}
          >
            Sign in again
          </button>
        </div>
      )}

      <section className="rounded-[2rem] bg-ink px-6 py-8 text-white shadow-soft sm:px-10 sm:py-10">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-sage">
            Room details
          </p>
          {room.isFull && (
            <span className="rounded-full bg-coral/20 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-coral">
              Full
            </span>
          )}
        </div>
        <h1 className="mt-4 text-4xl font-black tracking-[-0.05em] sm:text-5xl">
          {room.name}
        </h1>
        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/60">
          <span>
            {room.memberCount}/{room.maxMembers} members
          </span>
          <span>
            {room.isMember ? "You are a member" : "You are not a member"}
          </span>
          {room.isAdmin && <span>Room admin</span>}
        </div>
      </section>

      {actionError && <Alert message={actionError} />}
      {actionMessage && (
        <Alert tone="success" message={actionMessage} />
      )}

      {!room.isMember && !room.isAdmin && (
        <section className="space-y-4 rounded-3xl border border-ink/10 bg-white p-6 shadow-sm sm:p-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-coral">
              Join this room
            </p>
            <h2 className="mt-2 text-2xl font-black text-ink">
              {room.isFull ? "This room is full" : "Ready to join?"}
            </h2>
          </div>

          {room.isFull ? (
            <Alert
              tone="info"
              message="This room has reached its 100-member capacity."
            />
          ) : (
            <>
              {room.visibility === "private" && (
                <PasswordInput
                  id="join-room-password"
                  autoComplete="current-password"
                  placeholder="Room password"
                  value={joinPassword}
                  onChange={(event) => setJoinPassword(event.target.value)}
                />
              )}
              <Button
                type="button"
                loading={joining}
                onClick={() => void handleJoin()}
              >
                Join room
              </Button>
            </>
          )}
        </section>
      )}

      {room.isMember && (
        <section className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-coral">
                Anonymous members
              </p>
              <h2 className="mt-2 text-2xl font-black text-ink">
                Who is here
              </h2>
            </div>
            <span className="text-sm font-semibold text-ink/50">
              {room.members.length} shown
            </span>
          </div>

          {room.members.length > 0 ? (
            <RoomMemberList
              members={room.members}
              canRemove={room.isAdmin}
              removingId={removingId}
              onRemove={(membershipId) => void handleRemove(membershipId)}
            />
          ) : (
            <EmptyState
              eyebrow="No members shown"
              title="The member list is empty."
              description="Refresh the room to check its current membership."
            />
          )}
        </section>
      )}

      {room.isMember && (
        <section className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-ink/10 bg-white p-5 shadow-sm">
          <div>
            <p className="font-bold text-ink">
              {room.isAdmin && room.memberCount === 1
                ? "Close this room"
                : "Leave this room"}
            </p>
            <p className="mt-1 text-sm text-ink/50">
              {room.isAdmin && room.memberCount > 1
                ? "Remove the remaining members before closing the room."
                : room.isAdmin
                  ? "As the only member, leaving will close this room."
                  : "You can rejoin later if the room is still nearby."}
            </p>
          </div>
          <Button
            type="button"
            variant="danger"
            loading={leaving}
            disabled={room.isAdmin && room.memberCount > 1}
            onClick={() => void handleLeave()}
          >
            {room.isAdmin && room.memberCount === 1
              ? "Close room"
              : "Leave room"}
          </Button>
        </section>
      )}
    </div>
  );
}
