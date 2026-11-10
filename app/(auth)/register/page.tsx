import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import AuthForm from "@/components/AuthForm";
import { register } from "@/lib/auth";
import styles from "../auth.module.css";

export const metadata: Metadata = {
  title: "Inscription",
};

export default function RegisterPage() {
  return (
    <div className={styles.page}>
      {/* decorative photo: empty alt so screen readers skip it */}
      <Image
        src="/register.jpg"
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
          <h1 className={styles.title}>Inscription</h1>
          <AuthForm
            passwordType="new-password"
            passwordHint="8 caractères minimum, avec une majuscule, une minuscule, un chiffre et un caractère spécial (@$!%*?&)."
            action={register}
            button="S’inscrire"
          />
        </div>
        <p className={styles.switch}>
          Déjà inscrit&nbsp;?
          <Link href="/login" className={styles.link}>
            Se connecter
          </Link>
        </p>
      </main>
    </div>
  );
}
