import type { Metadata } from "next";
import Link from "next/link";
import AuthForm from "@/components/AuthForm";
import { login } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Connexion",
};

export default function LoginPage() {
  return (
    <main>
      <h1>Connexion</h1>
      <AuthForm
        passwordType="current-password"
        action={login}
        button="Se connecter"
      />
      <p>
        Pas encore de compte ? <Link href="/register">Créer un compte</Link>
      </p>
    </main>
  );
}
