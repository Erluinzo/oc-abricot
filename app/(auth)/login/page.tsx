import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import AuthForm from "@/components/AuthForm";
import { login } from "@/lib/auth";
import styles from "../auth.module.css";

export const metadata: Metadata = {
  title: "Connexion",
};

export default function LoginPage() {
  return (
    <div className={styles.page}>
      {/* decorative photo: empty alt so screen readers skip it */}
      <Image
        src="/login.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className={styles.photo}
      />
      <main className={styles.panel}>
        <Image
          src="/logo.svg"
          alt="Abricot"
          width={253}
          height={32}
          className={styles.logo}
        />
        <div className={styles.content}>
          <h1 className={styles.title}>Connexion</h1>
          <div className={styles.form}>
            <AuthForm
              passwordType="current-password"
              action={login}
              button="Se connecter"
            />
            {/* no backend route for this yet, so it is not a link */}
            <p className={styles.link}>Mot de passe oublié?</p>
          </div>
        </div>
        <p className={styles.switch}>
          Pas encore de compte&nbsp;?
          <Link href="/register" className={styles.link}>
            Créer un compte
          </Link>
        </p>
      </main>
    </div>
  );
}
