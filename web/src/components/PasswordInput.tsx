import { useState } from "react";
import type { InputHTMLAttributes } from "react";
import { Input } from "./Input";

export function PasswordInput(
  props: InputHTMLAttributes<HTMLInputElement>
) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input {...props} type={visible ? "text" : "password"} className="pr-16" />
      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-ink/45 hover:text-moss"
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? "Hide" : "Show"}
      </button>
    </div>
  );
}
