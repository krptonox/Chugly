import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Alert } from "../components/Alert";
import { AuthCard } from "../components/AuthCard";
import { Button } from "../components/Button";
import { FormField } from "../components/FormField";
import { Input } from "../components/Input";
import { PasswordInput } from "../components/PasswordInput";
import { getApiErrorMessage, getApiFieldErrors, type FieldErrors } from "../lib/api-errors";
import { validateLogin } from "../features/auth/auth.validation";
import { useAuth } from "../features/auth/useAuth";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [registered, setRegistered] = useState(Boolean((location.state as { registered?: boolean } | null)?.registered));
  const reset = Boolean((location.state as { reset?: boolean } | null)?.reset);
  const from = (location.state as { from?: string } | null)?.from || "/dashboard";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    setRegistered(false);
    const validationErrors = validateLogin(email, password);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    setSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      navigate(from, { replace: true });
    } catch (error) {
      setErrors(getApiFieldErrors(error));
      setFormError(getApiErrorMessage(error, "We could not log you in."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard
      eyebrow="Welcome back"
      title="Log in to Chugly"
      description="Pick up right where you left off."
      footer={<>New to Chugly? <Link to="/register" className="font-bold text-moss hover:text-ink">Create an account</Link></>}
    >
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        {registered && <Alert tone="success" message="Account created. Check your inbox to verify your email." />}
        {reset && <Alert tone="success" message="Password reset successfully. You can log in now." />}
        {formError && <Alert message={formError} />}
        <FormField label="Email" htmlFor="login-email" error={errors.email} required>
          <Input id="login-email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required aria-invalid={Boolean(errors.email)} />
        </FormField>
        <FormField label="Password" htmlFor="login-password" error={errors.password} required hint={<Link to="/forgot-password" className="text-moss hover:text-ink">Forgot it?</Link>}>
          <PasswordInput id="login-password" autoComplete="current-password" placeholder="Your password" value={password} onChange={(event) => setPassword(event.target.value)} aria-invalid={Boolean(errors.password)} />
        </FormField>
        <Button type="submit" loading={submitting} className="mt-2 w-full">Log in</Button>
      </form>
    </AuthCard>
  );
}
