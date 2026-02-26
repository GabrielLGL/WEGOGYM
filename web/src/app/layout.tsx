import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  weight: ["300", "500", "700", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://kore-app.com"),
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
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='5 5 90 90'><defs><linearGradient id='g' x1='0' y1='100%25' x2='100%25' y2='0'><stop offset='0%25' stop-color='%236c5ce7'/><stop offset='100%25' stop-color='%2300cec9'/></linearGradient></defs><g stroke='url(%23g)' stroke-width='14' stroke-linecap='round' fill='none'><line x1='30' y1='15' x2='30' y2='85'/><line x1='30' y1='50' x2='75' y2='15'/><line x1='30' y1='50' x2='75' y2='85'/></g><g fill='%231a1a2e' stroke='url(%23g)' stroke-width='5'><circle cx='30' cy='15' r='5'/><circle cx='30' cy='85' r='5'/><circle cx='30' cy='50' r='8'/><circle cx='75' cy='15' r='5'/><circle cx='75' cy='85' r='5'/></g></svg>",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Kore — Ton coach muscu dans ta poche",
    description:
      "Suis tes programmes, enregistre tes performances et progresse seance apres seance.",
    type: "website",
    locale: "fr_FR",
    siteName: "Kore",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Kore — Ton coach muscu dans ta poche",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kore — Ton coach muscu dans ta poche",
    description:
      "App de musculation 100% offline. Suis tes programmes et progresse seance apres seance.",
    images: ["/og.png"],
  },
  other: {
    "theme-color": "#6c5ce7",
  },
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
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${outfit.className} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Kore",
              applicationCategory: "HealthApplication",
              operatingSystem: "Android",
              description:
                "Application de musculation offline-first. Suis tes programmes, enregistre tes performances et progresse seance apres seance.",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "EUR",
                availability: "https://schema.org/PreOrder",
              },
            }),
          }}
        />
        {children}
      </body>
    </html>
  );
}
