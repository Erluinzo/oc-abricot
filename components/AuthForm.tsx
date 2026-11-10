"use client";

import { useActionState } from "react";
import type { AuthState } from "@/lib/auth";
import styles from "./AuthForm.module.css";
import form from "./Form.module.css";

type Props = {
  action: (state: AuthState, formData: FormData) => Promise<AuthState>;
  button: string;
  //"current-password" to log in, "new-password" to sign up
  passwordType: string;
  //register only: the backend rules, shown before the user types
  passwordHint?: string;
};

//login and register forms: same fields, only the action and the button change
export default function AuthForm({
  action,
  button,
  passwordType,
  passwordHint,
}: Props) {
  const [state, formAction, pending] = useActionState(action, {
    error: "",
    email: "",
  });

  return (
    <form action={formAction} className={styles.form}>
      <div className={styles.fields}>
        <div className={form.field}>
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
        </div>
        <div className={form.field}>
          <label htmlFor="password">Mot de passe</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={passwordType}
            required
            aria-describedby={
              [passwordHint && "password-hint", state.error && "form-error"]
                .filter(Boolean)
                .join(" ") || undefined
            }
          />
          {passwordHint && (
            <p id="password-hint" className={form.hint}>
              {passwordHint}
            </p>
          )}
        </div>
      </div>
      {state.error && (
        <p
          id="form-error"
          role="alert"
          className={`${form.error} ${styles.error}`}
        >
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className={form.button}>
        {button}
      </button>
    </form>
  );
}
