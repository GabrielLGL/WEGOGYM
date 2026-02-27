import type { Metadata } from "next";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import BackgroundBlobs from "@/components/BackgroundBlobs";
import KoreLogo from "@/components/KoreLogo";

export const metadata: Metadata = {
  title: "Mentions légales — Kore",
  description: "Mentions légales du site kore-app.net — éditeur, hébergeur, contact.",
};

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Skip link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:bg-[var(--accent)] focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-semibold"
      >
        Aller au contenu principal
      </a>
      <BackgroundBlobs />
      <ThemeToggle />

      <main id="main-content" className="relative z-[2] py-20 px-6">
        <div className="max-w-[800px] mx-auto">

          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[var(--text-muted)] text-sm
              font-medium no-underline hover:text-[var(--accent)] transition-colors group"
          >
            <span className="group-hover:-translate-x-1 transition-transform inline-block" aria-hidden="true">
              ←
            </span>
            Retour à l&apos;accueil
          </Link>

          {/* Card principale */}
          <div className="bg-[var(--bg)] rounded-[30px] shadow-neu-out p-8 sm:p-12 mt-8">

            {/* En-tête */}
            <div className="flex items-center gap-3 mb-6">
              <KoreLogo size={32} gradientId="mentionsGrad" />
              <span className="gradient-text font-black text-xl tracking-widest">KORE</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
              Mentions légales
            </h1>
            <p className="text-[var(--text-muted)] text-sm">
              Conformément aux articles 6-III et 19 de la Loi n° 2004-575 du 21 juin 2004
              pour la Confiance dans l&apos;Économie Numérique (LCEN).
            </p>

            {/* Séparateur */}
            <div className="h-px bg-[var(--glass-border)] my-8" />

            {/* 1. Éditeur */}
            <section className="mb-8">
              <h2 className="text-xl font-bold mb-4 text-[var(--accent)]">1. Éditeur du site</h2>
              <div className="bg-[var(--bg)] rounded-[20px] shadow-neu-in p-6 space-y-2">
                <p className="text-[var(--text-muted)] text-sm leading-relaxed">
                  <strong className="text-[var(--text-main)]">Nom de l&apos;éditeur :</strong>{" "}
                  Kore App (projet personnel, sans entité commerciale enregistrée à ce jour)
                </p>
                <p className="text-[var(--text-muted)] text-sm leading-relaxed">
                  <strong className="text-[var(--text-main)]">Directeur de la publication :</strong>{" "}
                  Le créateur du projet Kore (particulier)
                </p>
                <p className="text-[var(--text-muted)] text-sm leading-relaxed">
                  <strong className="text-[var(--text-main)]">Email de contact :</strong>{" "}
                  <a
                    href="mailto:contact@kore-app.net"
                    className="text-[var(--accent)] hover:underline"
                  >
                    contact@kore-app.net
                  </a>
                </p>
                <p className="text-[var(--text-muted)] text-sm leading-relaxed">
                  <strong className="text-[var(--text-main)]">Statut :</strong>{" "}
                  Particulier — projet en cours de développement, sans SIRET à ce stade.
                  Les mentions seront mises à jour lors de la création d&apos;une structure commerciale.
                </p>
              </div>
            </section>

            {/* 2. Hébergeur */}
            <section className="mb-8">
              <h2 className="text-xl font-bold mb-4 text-[var(--accent)]">2. Hébergeur</h2>
              <div className="bg-[var(--bg)] rounded-[20px] shadow-neu-in p-6 space-y-2">
                <p className="text-[var(--text-muted)] text-sm leading-relaxed">
                  <strong className="text-[var(--text-main)]">Société :</strong> Vercel Inc.
                </p>
                <p className="text-[var(--text-muted)] text-sm leading-relaxed">
                  <strong className="text-[var(--text-main)]">Adresse :</strong>{" "}
                  340 Pine Street, Suite 900, San Francisco, CA 94104, États-Unis
                </p>
                <p className="text-[var(--text-muted)] text-sm leading-relaxed">
                  <strong className="text-[var(--text-main)]">Site web :</strong>{" "}
                  <a
                    href="https://vercel.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--accent)] hover:underline"
                  >
                    vercel.com
                  </a>
                </p>
              </div>
            </section>

            {/* 3. Propriété intellectuelle */}
            <section className="mb-8">
              <h2 className="text-xl font-bold mb-4 text-[var(--accent)]">3. Propriété intellectuelle</h2>
              <p className="text-[var(--text-muted)] text-sm leading-relaxed">
                L&apos;ensemble des contenus présents sur le site{" "}
                <strong className="text-[var(--text-main)]">kore-app.net</strong> (textes, images,
                logo, code) est la propriété exclusive de l&apos;éditeur, sauf mention contraire.
                Toute reproduction, distribution ou utilisation sans autorisation préalable est interdite.
              </p>
            </section>

            {/* 4. Données personnelles */}
            <section className="mb-8">
              <h2 className="text-xl font-bold mb-4 text-[var(--accent)]">4. Données personnelles</h2>
              <p className="text-[var(--text-muted)] text-sm leading-relaxed">
                Le traitement des données personnelles collectées via ce site est décrit dans notre{" "}
                <Link href="/privacy" className="text-[var(--accent)] hover:underline">
                  Politique de confidentialité
                </Link>
                , conforme au Règlement Général sur la Protection des Données (RGPD — UE 2016/679).
              </p>
            </section>

            {/* 5. Cookies */}
            <section className="mb-8">
              <h2 className="text-xl font-bold mb-4 text-[var(--accent)]">5. Cookies</h2>
              <p className="text-[var(--text-muted)] text-sm leading-relaxed">
                Ce site n&apos;utilise pas de cookies de traçage ou d&apos;analytics. La seule
                donnée stockée localement est la préférence de thème (clair/sombre) dans le{" "}
                <code className="text-[var(--accent)] text-xs bg-[var(--bg)] px-1.5 py-0.5 rounded shadow-neu-in">
                  localStorage
                </code>{" "}
                de votre navigateur. Cette donnée ne quitte jamais votre appareil.
              </p>
            </section>

            {/* 6. Responsabilité */}
            <section className="mb-8">
              <h2 className="text-xl font-bold mb-4 text-[var(--accent)]">6. Limitation de responsabilité</h2>
              <p className="text-[var(--text-muted)] text-sm leading-relaxed">
                L&apos;éditeur s&apos;efforce de maintenir les informations de ce site à jour
                et exactes, mais ne peut garantir l&apos;exactitude, la complétude ou
                l&apos;actualité des informations diffusées. L&apos;éditeur décline toute
                responsabilité pour les dommages directs ou indirects résultant de l&apos;utilisation
                du site.
              </p>
            </section>

            {/* 7. Droit applicable */}
            <section className="mb-8">
              <h2 className="text-xl font-bold mb-4 text-[var(--accent)]">7. Droit applicable</h2>
              <p className="text-[var(--text-muted)] text-sm leading-relaxed">
                Les présentes mentions légales sont soumises au droit français. En cas de litige,
                les tribunaux français seront seuls compétents.
              </p>
            </section>

            {/* Footer */}
            <div className="h-px bg-[var(--glass-border)] my-8" />
            <p className="text-[var(--text-muted)] text-xs opacity-60 text-center">
              Dernière mise à jour : 27 février 2026
            </p>

          </div>

          {/* Back link bas */}
          <div className="mt-8 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[var(--text-muted)] text-sm
                font-medium no-underline hover:text-[var(--accent)] transition-colors group"
            >
              <span aria-hidden="true" className="group-hover:-translate-x-1 transition-transform inline-block">
                ←
              </span>
              Retour à l&apos;accueil
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
}
