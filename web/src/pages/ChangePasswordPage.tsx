import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Alert } from "../components/Alert";
import { AuthCard } from "../components/AuthCard";
import { Button } from "../components/Button";
import { FormField } from "../components/FormField";
import { PasswordInput } from "../components/PasswordInput";
import { authApi } from "../features/auth/auth.api";
import { validateChangePassword } from "../features/auth/auth.validation";
import { getApiErrorMessage, getApiFieldErrors, type FieldErrors } from "../lib/api-errors";

export function ChangePasswordPage() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    setSuccess("");

    const validationErrors = validateChangePassword(oldPassword, newPassword);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await authApi.changeCurrentPassword({
        oldPassword,
        newPassword,
      });
      setOldPassword("");
      setNewPassword("");
      setSuccess(response.data.message);
    } catch (error) {
      setErrors(getApiFieldErrors(error));
      setFormError(getApiErrorMessage(error, "We could not change your password."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      <AuthCard
        eyebrow="Account security"
        title="Change your password"
        description="Use your current password to choose a new one."
        footer={
          <Link to="/account" className="font-bold text-moss hover:text-ink">
            Back to account
          </Link>
        }
      >
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          {formError && <Alert message={formError} />}
          {success && <Alert tone="success" message={success} />}
          <FormField
            label="Current password"
            htmlFor="old-password"
            error={errors.oldPassword}
          >
            <PasswordInput
              id="old-password"
              autoComplete="current-password"
              placeholder="Your current password"
              value={oldPassword}
              onChange={(event) => setOldPassword(event.target.value)}
            />
          </FormField>
          <FormField
            label="New password"
            htmlFor="new-password"
            error={errors.newPassword}
            hint="8+ characters"
          >
            <PasswordInput
              id="new-password"
              autoComplete="new-password"
              placeholder="Your new password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
            />
          </FormField>
          <Button type="submit" loading={submitting} className="mt-2 w-full">
            Change password
          </Button>
        </form>
      </AuthCard>
    </div>
  );
}
