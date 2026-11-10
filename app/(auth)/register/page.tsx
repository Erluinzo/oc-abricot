import type { Metadata } from "next";
import Link from "next/link";
import AuthForm from "@/components/AuthForm";
import { register } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Inscription",
};

export default function RegisterPage() {
  return (
    <main>
      <h1>Inscription</h1>
      <AuthForm
        passwordType="new-password"
        action={register}
        button="S’inscrire"
      />
      <p>
        Déjà inscrit ? <Link href="/login">Se connecter</Link>
      </p>
    </main>
  );
}
