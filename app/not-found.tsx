import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page introuvable",
};

//shown by next.js for any unknown url (no figma screen, same style as the app)
export default function NotFound() {
  return (
    <main className="message-page">
      <Image src="/logo.svg" alt="Abricot" width={147} height={19} />
      <h1>404</h1>
      <p>Cette page n’existe pas.</p>
      <Link href="/dashboard" className="message-button">
        Retour au tableau de bord
      </Link>
    </main>
  );
}
