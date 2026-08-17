import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Alert } from "../components/Alert";
import { AuthCard } from "../components/AuthCard";
import { Button } from "../components/Button";
import { FormField } from "../components/FormField";
import { Input } from "../components/Input";
import { getApiErrorMessage, getApiFieldErrors, type FieldErrors } from "../lib/api-errors";
import { authApi } from "../features/auth/auth.api";
import { validateEmail } from "../features/auth/auth.validation";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    setSuccess("");

    const validationErrors = validateEmail(email);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await authApi.forgotPassword(email.trim());
      setSuccess(response.data.message);
    } catch (error) {
      setErrors(getApiFieldErrors(error));
      setFormError(getApiErrorMessage(error, "We could not send the reset email."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard
      eyebrow="Account recovery"
      title="Forgot your password?"
      description="Enter your email and we will send a secure reset link."
      footer={
        <Link to="/login" className="font-bold text-moss hover:text-ink">
          Back to login
        </Link>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        {formError && <Alert message={formError} />}
        {success && <Alert tone="success" message={success} />}

        <FormField label="Email" htmlFor="forgot-email" error={errors.email}>
          <Input
            id="forgot-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </FormField>

        <Button type="submit" loading={submitting} className="w-full">
          Send reset link
        </Button>
      </form>
    </AuthCard>
  );
}
