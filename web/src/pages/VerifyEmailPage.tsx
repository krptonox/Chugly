import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Alert } from "../components/Alert";
import { Logo } from "../components/Logo";
import { authApi } from "../features/auth/auth.api";
import { getApiErrorMessage } from "../lib/api-errors";

export function VerifyEmailPage() {
  const { verificationToken } = useParams<{ verificationToken: string }>();
  const [state, setState] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email…");

  useEffect(() => {
    if (!verificationToken) {
      setState("error");
      setMessage("This verification link is missing its token.");
      return;
    }
    let active = true;
    authApi.verifyEmail(verificationToken).then((response) => {
      if (active) {
        setState("success");
        setMessage(response.data.message);
      }
    }).catch((error) => {
      if (active) {
        setState("error");
        setMessage(getApiErrorMessage(error, "This verification link is invalid or expired."));
      }
    });
    return () => { active = false; };
  }, [verificationToken]);

  return (
    <main className="grid min-h-screen place-items-center bg-transparent px-5 py-8">
      <div className="w-full max-w-md">
        <Logo />
        <div className="mt-8 rounded-[2rem] border border-ink/10 bg-white p-7 text-center shadow-soft sm:p-10" role="status" aria-live="polite">
          <div className={`mx-auto grid h-16 w-16 place-items-center rounded-2xl text-2xl font-black ${state === "success" ? "bg-sage text-moss" : state === "error" ? "bg-coral/10 text-coral-ink" : "bg-cream text-ink/45"}`} aria-hidden="true">
            {state === "loading" ? "…" : state === "success" ? "✓" : "!"}
          </div>
          <h1 className="mt-6 text-3xl font-black tracking-tight text-ink">{state === "success" ? "Email verified" : state === "error" ? "Link not valid" : "Checking your email"}</h1>
          <p className="mt-3 text-sm leading-6 text-ink/60">{message}</p>
          {state !== "loading" && <Link to="/login" className="mt-7 inline-flex min-h-11 items-center justify-center rounded-xl bg-ink px-5 py-3 text-sm font-bold text-white hover:bg-moss">Continue to login</Link>}
          {state === "error" && <div className="mt-5 text-left"><Alert tone="info" message="You can request another verification email after logging in." /></div>}
        </div>
      </div>
    </main>
  );
}
