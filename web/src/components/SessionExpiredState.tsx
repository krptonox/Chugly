import { Alert } from "./Alert";
import { Button } from "./Button";

export function SessionExpiredState({
  onSignIn,
}: {
  onSignIn: () => void | Promise<void>;
}) {
  return (
    <div className="space-y-3">
      <Alert message="Your session has expired. Sign in again to continue." />
      <Button onClick={() => void onSignIn()}>Sign in again</Button>
    </div>
  );
}
