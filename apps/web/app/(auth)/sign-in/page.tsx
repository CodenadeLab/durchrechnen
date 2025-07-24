import { SignInClient } from "@/components/page-clients/sign-in-client";

// Statische Metadaten
export const metadata = {
  title: "Anmelden | Durchrechnen",
  description: "Melde dich mit deinem Firmen-Account bei Durchrechnen an",
};

// Hauptkomponente (Standard Export)
export default function SignInPage() {
  return <SignInClient />;
}
