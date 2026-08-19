import { Link } from "react-router-dom";
import { Alert } from "../components/Alert";
import { AuthCard } from "../components/AuthCard";
import { Button } from "../components/Button";
import { authApi } from "../features/auth/auth.api";
import { getApiErrorMessage } from "../lib/api-errors";
import { useState } from "react";

export function ResendVerificationPage() {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const resend = async () => {
    setSubmitting(true);
    setSuccess("");
    setError("");
    try {
      const response = await authApi.resendEmailVerification();
      setSuccess(response.data.message);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "We could not resend the verification email."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      <AuthCard
        eyebrow="Almost there"
        title="Verify your email"
        description="We will send another verification link to the email on your account."
        footer={<Link to="/account" className="font-bold text-moss hover:text-ink">Back to account</Link>}
      >
        <div className="space-y-4">
          {error && <Alert message={error} />}
          {success && <Alert tone="success" message={success} />}
          <Button onClick={() => void resend()} loading={submitting} className="w-full">Resend verification email</Button>
        </div>
      </AuthCard>
    </div>
  );
}
