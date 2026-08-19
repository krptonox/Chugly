import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Alert } from "../components/Alert";
import { AuthCard } from "../components/AuthCard";
import { Button } from "../components/Button";
import { FormField } from "../components/FormField";
import { PasswordInput } from "../components/PasswordInput";
import { authApi } from "../features/auth/auth.api";
import { validateNewPassword } from "../features/auth/auth.validation";
import { getApiErrorMessage, getApiFieldErrors, type FieldErrors } from "../lib/api-errors";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const { resetToken } = useParams<{ resetToken: string }>();
  const [newPassword, setNewPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    if (!resetToken) {
      setFormError("This reset link is missing its token.");
      return;
    }
    const validationErrors = validateNewPassword(newPassword);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    setSubmitting(true);
    try {
      await authApi.resetPassword(resetToken, { newPassword });
      navigate("/login", { replace: true, state: { reset: true } });
    } catch (error) {
      setErrors(getApiFieldErrors(error));
      setFormError(getApiErrorMessage(error, "We could not reset your password."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-transparent px-5 py-8">
      <div className="w-full max-w-md">
        <AuthCard eyebrow="New password" title="Reset your password" description="Choose a fresh password for your Chugly account." footer={<Link to="/login" className="font-bold text-moss hover:text-ink">Back to login</Link>}>
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            {formError && <Alert message={formError} />}
            <FormField label="New password" htmlFor="reset-password" error={errors.newPassword} required hint="8+ characters">
              <PasswordInput id="reset-password" autoComplete="new-password" placeholder="Your new password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} aria-invalid={Boolean(errors.newPassword)} />
            </FormField>
            <Button type="submit" loading={submitting} className="w-full">Reset password</Button>
          </form>
        </AuthCard>
      </div>
    </main>
  );
}
