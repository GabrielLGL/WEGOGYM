import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kore — Ton coach muscu dans ta poche",
  description:
    "Suis tes programmes, enregistre tes performances et progresse seance apres seance. Application de musculation 100% offline, rapide et intuitive.",
  keywords: [
    "musculation",
    "fitness",
    "programme musculation",
    "suivi entrainement",
    "gym tracker",
    "Kore",
  ],
  openGraph: {
    title: "Kore — Ton coach muscu dans ta poche",
    description:
      "Suis tes programmes, enregistre tes performances et progresse seance apres seance.",
    type: "website",
    locale: "fr_FR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">{children}</body>
    </html>
  );
}
