import { Link, useNavigate } from "react-router-dom";
import { Alert } from "../components/Alert";
import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";
import { LocationStatus } from "../components/LocationStatus";
import { RoomCard } from "../components/RoomCard";
import { RoomCardSkeleton } from "../components/RoomCardSkeleton";
import { SectionHeader } from "../components/SectionHeader";
import { SessionExpiredState } from "../components/SessionExpiredState";
import { useAuth } from "../features/auth/useAuth";
import { useRooms } from "../features/rooms/useRooms";

export function RoomsPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const {
    location,
    nearbyRooms,
    myRooms,
    nearbyLoading,
    myRoomsLoading,
    nearbyError,
    myRoomsError,
    sessionExpired,
    loadMyRooms,
  } = useRooms();

  const signInAgain = async () => {
    await logout();
    navigate("/login", { replace: true, state: { from: "/rooms" } });
  };

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-[2rem] bg-ink px-6 py-8 text-white shadow-soft sm:px-10 sm:py-10">
        <div className="relative z-10 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-sage">Room discovery</p>
          <h1 className="mt-4 text-4xl font-black tracking-[-0.05em] sm:text-5xl">Find your people nearby.</h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/65 sm:text-base">
            Explore public and private rooms within 1000 meters of your current location.
          </p>
        </div>
        <Link
          to="/rooms/create"
          className="relative z-10 mt-7 inline-flex min-h-11 items-center justify-center rounded-xl bg-sage px-4 py-2.5 text-sm font-bold text-moss transition hover:-translate-y-0.5 hover:bg-white focus:outline-none focus:ring-2 focus:ring-sage/50 sm:mt-0 sm:absolute sm:bottom-10 sm:right-10"
        >
          Create a room
        </Link>
        <div className="absolute -right-12 -top-24 h-64 w-64 rounded-full border-[34px] border-sage/10" aria-hidden="true" />
      </section>

      {sessionExpired && <SessionExpiredState onSignIn={signInAgain} />}

      <section className="space-y-4">
        <SectionHeader eyebrow="Within 1000 meters" title="Nearby rooms" description="Ordered by distance from your current location." />
        <LocationStatus status={location.status} errorMessage={location.errorMessage} onRetry={location.requestLocation} />
        {nearbyLoading && (
          <div className="grid gap-4 lg:grid-cols-2" aria-busy="true">
            <RoomCardSkeleton />
            <RoomCardSkeleton />
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
            {nearbyRooms.map((room) => <RoomCard key={room._id} room={room} />)}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <SectionHeader eyebrow="Persistent membership" title="Your rooms" description="Rooms you can return to any time." />
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
            action={<Link to="/rooms/create" className="rounded-xl bg-ink px-4 py-2.5 text-sm font-bold text-white hover:bg-moss">Create a room</Link>}
          />
        )}
        {myRooms.length > 0 && (
          <div className="grid gap-4 lg:grid-cols-2">
            {myRooms.map((room) => <RoomCard key={room._id} room={room} />)}
          </div>
        )}
      </section>
    </div>
  );
}
