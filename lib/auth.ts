"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
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
