import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import styles from "./not-found.module.css";

export const metadata: Metadata = {
  title: "Page introuvable",
};

//shown by next.js for any unknown url (no figma screen, same style as the app)
export default function NotFound() {
  return (
    <main className={styles.page}>
      <Image src="/logo.svg" alt="Abricot" width={147} height={19} />
      <h1 className={styles.title}>404</h1>
      <p className={styles.text}>Cette page n’existe pas.</p>
      <Link href="/dashboard" className={styles.button}>
        Retour au tableau de bord
      </Link>
    </main>
  );
}
