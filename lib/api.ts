import { cookies } from "next/headers";
import { redirect } from "next/navigation";

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
    redirect("/logout");
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
