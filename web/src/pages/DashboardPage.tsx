import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";
import { LocationStatus } from "../components/LocationStatus";
import { RoomCard } from "../components/RoomCard";
import { RoomCardSkeleton } from "../components/RoomCardSkeleton";
import { SectionHeader } from "../components/SectionHeader";
import { SessionExpiredState } from "../components/SessionExpiredState";
import { Alert } from "../components/Alert";
import { useAuth } from "../features/auth/useAuth";
import { useRooms } from "../features/rooms/useRooms";

export function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const {
    location,
    nearbyRooms,
    myRooms,
    nearbyLoading,
    myRoomsLoading,
    nearbyError,
    myRoomsError,
    sessionExpired,
    setSessionExpired,
    loadMyRooms,
  } = useRooms();
  const firstName = user?.fullname?.split(" ")[0] || user?.username || "there";

  const signInAgain = async () => {
    await logout();
    navigate("/login", { replace: true, state: { from: "/dashboard" } });
  };

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-[2rem] bg-ink px-6 py-8 text-white shadow-soft sm:px-10 sm:py-10">
        <div className="relative z-10 max-w-2xl">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-sage">
            Your Chugly space
          </p>
          <h1 className="mt-5 text-4xl font-black tracking-[-0.05em] sm:text-6xl">
            Good to see you, {firstName}.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/65 sm:text-base">
            Find a nearby room, pick up where you left off, or make a place for your people.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/rooms"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-sage px-4 py-2.5 text-sm font-bold text-moss transition hover:-translate-y-0.5 hover:bg-white focus:outline-none focus:ring-2 focus:ring-sage/50"
            >
              Find nearby rooms
            </Link>
            <Link
              to="/rooms/create"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/20 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-sage/50"
            >
              Create a room
            </Link>
          </div>
        </div>
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full border-[36px] border-sage/10" aria-hidden="true" />
        <div className="absolute -bottom-24 right-20 h-48 w-48 rounded-full border-[24px] border-coral/15" aria-hidden="true" />
      </section>

      {sessionExpired && <SessionExpiredState onSignIn={signInAgain} />}

      <section className="space-y-4">
        <SectionHeader
          eyebrow="Persistent membership"
          title="Your rooms"
          description="The rooms you can return to after a reload or a new login."
          action={
            <Link to="/rooms" className="text-sm font-bold text-moss hover:text-ink">
              See all
            </Link>
          }
        />
        {myRoomsLoading && (
          <div className="grid gap-4 lg:grid-cols-2" aria-busy="true">
            <RoomCardSkeleton />
            <RoomCardSkeleton />
          </div>
        )}
        {myRoomsError && (
          <div className="space-y-3">
            <Alert message={myRoomsError} />
            <Button variant="secondary" onClick={() => void loadMyRooms()}>Try again</Button>
          </div>
        )}
        {!myRoomsLoading && !myRoomsError && myRooms.length === 0 && (
          <EmptyState
            eyebrow="Nothing joined"
            title="You’re not in any rooms yet."
            description="Join a nearby room or create one for your group."
            action={<Link to="/rooms" className="rounded-xl bg-ink px-4 py-2.5 text-sm font-bold text-white hover:bg-moss">Find a room</Link>}
          />
        )}
        {myRooms.length > 0 && (
          <div className="grid gap-4 lg:grid-cols-2">
            {myRooms.slice(0, 4).map((room) => <RoomCard key={room._id} room={room} />)}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <SectionHeader
          eyebrow="Within 1000 meters"
          title="Nearby rooms"
          description="Public and private rooms close to your current location."
          action={
            <Link to="/rooms" className="text-sm font-bold text-moss hover:text-ink">
              Explore nearby
            </Link>
          }
        />
        <LocationStatus status={location.status} errorMessage={location.errorMessage} onRetry={location.requestLocation} compact />
        {nearbyLoading && (
          <div className="grid gap-4 lg:grid-cols-2" aria-busy="true">
            <RoomCardSkeleton />
            <RoomCardSkeleton />
          </div>
        )}
        {nearbyError && <Alert message={nearbyError} />}
        {!nearbyLoading && !nearbyError && location.status === "success" && nearbyRooms.length === 0 && (
          <EmptyState
            eyebrow="No rooms yet"
            title="There are no rooms nearby."
            description="Try creating the first Chugly room in your area."
            action={<Link to="/rooms/create" className="rounded-xl bg-ink px-4 py-2.5 text-sm font-bold text-white hover:bg-moss">Create a room</Link>}
          />
        )}
        {nearbyRooms.length > 0 && (
          <div className="grid gap-4 lg:grid-cols-2">
            {nearbyRooms.slice(0, 4).map((room) => <RoomCard key={room._id} room={room} />)}
          </div>
        )}
      </section>
    </div>
  );
}
