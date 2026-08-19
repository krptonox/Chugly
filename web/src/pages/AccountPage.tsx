import { Link } from "react-router-dom";
import { Alert } from "../components/Alert";
import { Badge } from "../components/Badge";
import { PageHeader } from "../components/PageHeader";
import { useAuth } from "../features/auth/useAuth";

export function AccountPage() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const initial = user.username.charAt(0).toUpperCase();

  return (
    <div className="mx-auto max-w-3xl space-y-7">
      <PageHeader
        eyebrow="Account"
        title="Your details"
        description="Manage your Chugly identity and account security."
      />

      {!user.isEmailVerified && (
        <Alert tone="info" message="Your email is not verified yet. Verify it to keep your account fully protected." />
      )}

      <section className="rounded-3xl border border-ink/10 bg-white p-6 shadow-card sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-sage text-2xl font-black uppercase text-moss shadow-sm">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="truncate text-2xl font-black tracking-tight text-ink">{user.fullname || user.username}</p>
            <p className="mt-1 text-sm text-ink/50">@{user.username}</p>
          </div>
          <div className="sm:ml-auto">
            <Badge tone={user.isEmailVerified ? "moss" : "coral"}>
              {user.isEmailVerified ? "Verified" : "Verify email"}
            </Badge>
          </div>
        </div>

        <dl className="mt-8 grid gap-5 border-t border-ink/10 pt-6 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-bold uppercase tracking-[0.15em] text-ink/40">Email</dt>
            <dd className="mt-1 break-words text-sm font-semibold text-ink">{user.email}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-[0.15em] text-ink/40">Account status</dt>
            <dd className="mt-1 text-sm font-semibold text-moss">{user.isEmailVerified ? "Email verified" : "Verification needed"}</dd>
          </div>
        </dl>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        {!user.isEmailVerified && (
          <Link to="/account/resend-verification" className="group rounded-2xl border border-ink/10 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:border-moss">
            <p className="font-bold text-ink group-hover:text-moss">Resend verification</p>
            <p className="mt-1 text-sm leading-6 text-ink/50">Send a fresh verification email.</p>
          </Link>
        )}
        <Link to="/account/change-password" className="group rounded-2xl border border-ink/10 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:border-moss">
          <p className="font-bold text-ink group-hover:text-moss">Change password</p>
          <p className="mt-1 text-sm leading-6 text-ink/50">Keep your account secure.</p>
        </Link>
      </section>
    </div>
  );
}
