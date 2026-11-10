import type { Metadata } from "next";
import { logout } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Mon compte",
};

export default function ProfilePage() {
  return (
    <main>
      <h1>Mon compte</h1>
      <form action={logout}>
        <button type="submit">Se déconnecter</button>
      </form>
    </main>
  );
}
