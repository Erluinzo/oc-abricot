"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect, unstable_rethrow } from "next/navigation";
import { apiFetch, getErrorMessage } from "./api";

export type AuthState = { error: string; email: string };

async function sendAuthForm(path: string, formData: FormData) {
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));
  let data;
  try {
    data = await apiFetch(path, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  } catch (err) {
    console.log(err);
    return { error: "Erreur de connexion au serveur", email };
  }
  if (!data.success) {
    return { error: getErrorMessage(data), email };
  }
  //httpOnly: javascript in the page can't read the token (safe from xss)
  (await cookies()).set("token", data.data.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    //7 days, like the backend token
    maxAge: 60 * 60 * 24 * 7,
  });
  redirect("/dashboard");
}

export async function login(state: AuthState, formData: FormData) {
  return sendAuthForm("/auth/login", formData);
}

export async function register(state: AuthState, formData: FormData) {
  return sendAuthForm("/auth/register", formData);
}

export async function logout() {
  (await cookies()).delete("token");
  redirect("/login");
}

export type AccountState = {
  error: string;
  message: string;
  firstName: string;
  lastName: string;
  email: string;
};

export async function updateAccount(state: AccountState, formData: FormData) {
  const firstName = String(formData.get("firstName")).trim();
  const lastName = String(formData.get("lastName")).trim();
  const email = String(formData.get("email")).trim();
  const newPassword = String(formData.get("newPassword"));
  const currentPassword = String(formData.get("currentPassword"));
  const values = { firstName, lastName, email };
  //the backend keeps one "name": "Alice" + "Martin" -> "Alice Martin"
  const name = `${firstName} ${lastName}`.trim();
  //an empty name is refused by the backend: only send it to clear an existing name
  const hadName = state.firstName || state.lastName;
  try {
    //password first: if the current password is wrong, nothing is saved
    if (newPassword) {
      const res = await apiFetch("/auth/password", {
        method: "PUT",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.success) {
        return { ...values, error: getErrorMessage(res), message: "" };
      }
    }
    const data = await apiFetch("/auth/profile", {
      method: "PUT",
      body: JSON.stringify({ name: name || (hadName ? "" : undefined), email }),
    });
    if (!data.success) {
      const message = newPassword ? "Le mot de passe a été modifié" : "";
      return { ...values, error: getErrorMessage(data), message };
    }
  } catch (err) {
    //an expired token makes apiFetch redirect to /logout: let next.js do it
    unstable_rethrow(err);
    console.log(err);
    return { ...values, error: "Erreur de connexion au serveur", message: "" };
  }
  //the menu shows the initials: refresh every page with the new name
  revalidatePath("/", "layout");
  return {
    ...values,
    error: "",
    message: "Vos informations ont été modifiées",
  };
}
