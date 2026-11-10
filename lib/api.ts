import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

const API_URL = "http://localhost:8000";

//calls the backend from the next.js server, never from the browser:
//the token stays in an httpOnly cookie and the backend cors is not a problem
export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = (await cookies()).get("token")?.value;
  const res = await fetch(API_URL + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  //expired or wrong token: remove the cookie and go back to the login page
  if (data.error === "Authentication failed") {
    let target = "/login";
    try {
      //allowed in a server action (form submit)
      (await cookies()).delete("token");
    } catch {
      //not allowed while a page renders: proxy.ts deletes it on /logout
      target = "/logout";
    }
    redirect(target);
  }
  return data;
}

//the backend sends one message, plus one message per wrong field
export function getErrorMessage(data: {
  message: string;
  data?: { errors?: { message: string }[] };
}) {
  const errors = data.data?.errors;
  return errors ? errors.map((err) => err.message).join(". ") : data.message;
}

export type User = { id: string; email: string; name?: string };

//cache: the layout and the page ask for the user, the backend is called once per page
export const getUser = cache(async () => {
  const data = await apiFetch("/auth/profile");
  return data.data.user as User;
});
