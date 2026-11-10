import type { Metadata } from "next";
import ProfileForm from "@/components/ProfileForm";
import { getUser } from "@/lib/api";
import { logout } from "@/lib/auth";
import form from "@/components/Form.module.css";
import styles from "./profile.module.css";

export const metadata: Metadata = {
  title: "Mon compte",
};

export default async function ProfilePage() {
  const user = await getUser();
  //"Alice Martin": first word = first name, the rest = last name
  const [firstName = "", ...rest] = (user.name ?? "").split(" ");

  return (
    <main className={styles.card}>
      <div className={styles.top}>
        <div className={styles.title}>
          <h1>Mon compte</h1>
          {user.name && <p>{user.name}</p>}
        </div>
        <form action={logout}>
          <button type="submit" className={form.outline}>
            Se déconnecter
          </button>
        </form>
      </div>
      <ProfileForm
        firstName={firstName}
        lastName={rest.join(" ")}
        email={user.email}
        error=""
        message=""
      />
    </main>
  );
}
