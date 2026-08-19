import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Alert } from "../components/Alert";
import { AuthCard } from "../components/AuthCard";
import { Button } from "../components/Button";
import { FormField } from "../components/FormField";
import { Input } from "../components/Input";
import { PasswordInput } from "../components/PasswordInput";
import { getApiErrorMessage, getApiFieldErrors, type FieldErrors } from "../lib/api-errors";
import { validateRegister } from "../features/auth/auth.validation";
import { useAuth } from "../features/auth/useAuth";

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    const validationErrors = validateRegister(email, username, password);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    setSubmitting(true);
    try {
      await register({ email: email.trim(), username: username.trim(), password });
      navigate("/login", { replace: true, state: { registered: true } });
    } catch (error) {
      setErrors(getApiFieldErrors(error));
      setFormError(getApiErrorMessage(error, "We could not create your account."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard
      eyebrow="Start fresh"
      title="Create your account"
      description="One small step toward a less scattered day."
      footer={<>Already have an account? <Link to="/login" className="font-bold text-moss hover:text-ink">Log in</Link></>}
    >
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        {formError && <Alert message={formError} />}
        <FormField label="Email" htmlFor="register-email" error={errors.email} required>
          <Input id="register-email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required aria-invalid={Boolean(errors.email)} />
        </FormField>
        <FormField label="Username" htmlFor="register-username" error={errors.username} required hint="lowercase">
          <Input id="register-username" autoComplete="username" placeholder="yourname" value={username} onChange={(event) => setUsername(event.target.value.toLowerCase())} required aria-invalid={Boolean(errors.username)} />
        </FormField>
        <FormField label="Password" htmlFor="register-password" error={errors.password} required hint="8+ characters">
          <PasswordInput id="register-password" autoComplete="new-password" placeholder="Make it memorable" value={password} onChange={(event) => setPassword(event.target.value)} aria-invalid={Boolean(errors.password)} />
        </FormField>
        <Button type="submit" loading={submitting} className="mt-2 w-full">Create account</Button>
      </form>
    </AuthCard>
  );
}
