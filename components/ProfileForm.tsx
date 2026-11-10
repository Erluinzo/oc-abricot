"use client";

import { useActionState, useState } from "react";
import { updateAccount, type AccountState } from "@/lib/auth";
import form from "./Form.module.css";
import styles from "./ProfileForm.module.css";

export default function ProfileForm(props: AccountState) {
  //kept in state: react empties the other fields after each save, these must stay after an error
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [state, formAction, pending] = useActionState(
    async (prev: AccountState, formData: FormData) => {
      const result = await updateAccount(prev, formData);
      //something was saved: the password fields can be emptied
      if (result.message) {
        setNewPassword("");
        setCurrentPassword("");
      }
      return result;
    },
    props,
  );
  const describedBy = state.error ? "profile-error" : undefined;

  return (
    <form action={formAction} className={styles.form}>
      <div className={styles.fields}>
        <div className={form.field}>
          <label htmlFor="lastName">Nom</label>
          <input
            id="lastName"
            name="lastName"
            autoComplete="family-name"
            defaultValue={state.lastName}
            aria-describedby={describedBy}
          />
        </div>
        <div className={form.field}>
          <label htmlFor="firstName">Prénom</label>
          <input
            id="firstName"
            name="firstName"
            autoComplete="given-name"
            defaultValue={state.firstName}
            aria-describedby={describedBy}
          />
        </div>
        <div className={form.field}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={state.email}
            required
            aria-describedby={describedBy}
          />
        </div>
        <div className={form.field}>
          <label htmlFor="newPassword">Mot de passe</label>
          {/* the dots are the figma design, the field stays empty */}
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            placeholder="●●●●●●●●●●●"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            aria-describedby={`password-hint ${describedBy ?? ""}`}
          />
          <p id="password-hint" className="sr-only">
            Laissez vide pour garder votre mot de passe.
          </p>
        </div>
        {/* not in figma: the backend needs the current password to change it */}
        {newPassword && (
          <div className={form.field}>
            <label htmlFor="currentPassword">Mot de passe actuel</label>
            <input
              id="currentPassword"
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              aria-describedby={describedBy}
            />
          </div>
        )}
      </div>
      {state.error && (
        <p id="profile-error" role="alert" className={form.error}>
          {state.error}
        </p>
      )}
      {state.message && (
        <p role="status" className={styles.message}>
          {state.message}
        </p>
      )}
      <button type="submit" disabled={pending} className={form.button}>
        Modifier les informations
      </button>
    </form>
  );
}
