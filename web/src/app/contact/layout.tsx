import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact — Kore",
  description: "Contacte l'équipe Kore — question, suggestion ou signalement. Email : contact@kore-app.net.",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
