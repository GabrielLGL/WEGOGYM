import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  weight: ["300", "500", "700", "900"],
});

// Guard: never use a Vercel preview URL as metadataBase (NEXT_PUBLIC_SITE_URL
// can be set to the deployment URL in the Vercel dashboard by mistake).
const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
const SITE_URL =
  rawSiteUrl && !rawSiteUrl.includes(".vercel.app")
    ? rawSiteUrl
    : "https://kore-app.net";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Kore — Application de musculation gratuite | Tracker offline Android",
  description:
    "Kore — Application de musculation gratuite et 100% offline pour Android. Crée tes programmes, suis tes performances et progresse séance après séance. Tracker de musculation rapide et intuitif.",
  keywords: [
    "application musculation gratuite",
    "tracker musculation android",
    "suivi entraînement offline",
    "programme musculation personnalisé",
    "carnet entraînement musculation",
    "appli muscu sans internet",
    "gym tracker gratuit",
    "workout tracker android",
    "suivi performances musculation",
    "application fitness offline",
    "créer programme musculation",
    "historique séances musculation",
    "Kore",
  ],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
  manifest: "/manifest.webmanifest",
  alternates: {
    canonical: "/",
    languages: {
      fr: "https://kore-app.net",
      "x-default": "https://kore-app.net",
    },
  },
  openGraph: {
    title: "Kore — Application de musculation gratuite | Tracker offline Android",
    description:
      "Kore — Application de musculation gratuite et 100% offline pour Android. Crée tes programmes, suis tes performances et progresse séance après séance.",
    type: "website",
    locale: "fr_FR",
    siteName: "Kore",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Kore — Application de musculation gratuite",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kore — Application de musculation gratuite | Tracker offline Android",
    description:
      "Kore — Application de musculation gratuite et 100% offline pour Android. Crée tes programmes, suis tes performances et progresse séance après séance.",
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#6c5ce7" },
    { media: "(prefers-color-scheme: dark)", color: "#00cec9" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning className={outfit.variable}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('kore-theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.setAttribute('data-theme', 'dark');
                  } else {
                    document.documentElement.setAttribute('data-theme', 'light');
                  }
                  // Supprime la transition body pendant le premier paint (évite FOUC)
                  document.documentElement.classList.add('no-transition');
                  requestAnimationFrame(function() {
                    requestAnimationFrame(function() {
                      document.documentElement.classList.remove('no-transition');
                    });
                  });
                  // Active les animations ScrollReveal (contenu visible sans JS par défaut)
                  document.documentElement.classList.add('js-loaded');
                } catch(e) {}
              })();
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Kore",
              url: "https://kore-app.net",
              description:
                "Application de musculation gratuite et offline pour Android",
              inLanguage: "fr-FR",
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Kore",
              url: "https://kore-app.net",
              image: "https://kore-app.net/og.png",
              inLanguage: "fr-FR",
              author: { "@type": "Organization", name: "Kore" },
              applicationCategory: "HealthApplication",
              operatingSystem: "Android",
              description:
                "Application de musculation offline-first. Suis tes programmes, enregistre tes performances et progresse séance après séance.",
              softwareVersion: "1.0",
              datePublished: "2026-01-01",
              featureList: [
                "Programmes de musculation personnalisés",
                "Suivi de performances et historique",
                "100% offline — aucune connexion requise",
                "Interface rapide et intuitive",
                "Statistiques et progression",
                "Objectifs et suivi de mensurations",
              ],
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "EUR",
                availability: "https://schema.org/PreOrder",
              },
            }),
          }}
        />
      </head>
      <body className={`${outfit.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
