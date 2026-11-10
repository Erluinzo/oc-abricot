"use client";

import { useActionState } from "react";
import type { AuthState } from "@/lib/auth";

type Props = {
  action: (state: AuthState, formData: FormData) => Promise<AuthState>;
  button: string;
  //"current-password" to log in, "new-password" to sign up
  passwordType: string;
};

//login and register forms: same fields, only the action and the button change
export default function AuthForm({ action, button, passwordType }: Props) {
  const [state, formAction, pending] = useActionState(action, {
    error: "",
    email: "",
  });

  return (
    <form action={formAction}>
      <label htmlFor="email">Email</label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        defaultValue={state.email}
        required
        aria-describedby={state.error ? "form-error" : undefined}
      />
      <label htmlFor="password">Mot de passe</label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete={passwordType}
        required
        aria-describedby={state.error ? "form-error" : undefined}
      />
      {state.error && (
        <p id="form-error" role="alert">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending}>
        {button}
      </button>
    </form>
  );
}
