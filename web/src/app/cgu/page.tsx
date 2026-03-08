import type { Metadata } from "next";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import BackgroundBlobs from "@/components/BackgroundBlobs";
import KoreLogo from "@/components/KoreLogo";

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation — Kore",
  description: "Conditions générales d'utilisation de l'application Kore — suivi de musculation.",
};

export default function CGUPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
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

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[var(--text-muted)] text-sm
              font-medium no-underline hover:text-[var(--accent)] transition-colors group"
          >
            <span className="group-hover:-translate-x-1 transition-transform inline-block" aria-hidden="true">
              &larr;
            </span>
            Retour &agrave; l&apos;accueil
          </Link>

          <div className="bg-[var(--bg)] rounded-[30px] shadow-neu-out p-8 sm:p-12 mt-8">

            <div className="flex items-center gap-3 mb-6">
              <KoreLogo size={32} gradientId="cguGrad" />
              <span className="gradient-text font-black text-xl tracking-widest">KORE</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
              Conditions G&eacute;n&eacute;rales d&apos;Utilisation
            </h1>
            <p className="text-[var(--text-muted)] text-sm">
              Version 1.0 &mdash; En vigueur au 9 mars 2026
            </p>

            <div className="h-px bg-[var(--glass-border)] my-8" />

            {/* 1. Objet */}
            <section className="mb-8">
              <h2 className="text-xl font-bold mb-4 text-[var(--accent)]">1. Objet</h2>
              <p className="text-[var(--text-muted)] text-sm leading-relaxed">
                Kore est une application mobile de suivi de musculation et d&apos;entra&icirc;nement
                physique. Elle permet de cr&eacute;er des programmes d&apos;exercice, suivre ses
                s&eacute;ances en temps r&eacute;el, consulter son historique de performances et
                recevoir des suggestions g&eacute;n&eacute;r&eacute;es par intelligence artificielle.
              </p>
            </section>

            {/* 2. Acceptation */}
            <section className="mb-8">
              <h2 className="text-xl font-bold mb-4 text-[var(--accent)]">2. Acceptation</h2>
              <p className="text-[var(--text-muted)] text-sm leading-relaxed">
                L&apos;utilisation de l&apos;application Kore implique l&apos;acceptation pleine et
                enti&egrave;re des pr&eacute;sentes conditions g&eacute;n&eacute;rales d&apos;utilisation.
                Si vous n&apos;acceptez pas ces conditions, vous ne devez pas utiliser l&apos;application.
              </p>
            </section>

            {/* 3. Avertissement santé */}
            <section className="mb-8">
              <h2 className="text-xl font-bold mb-4 text-[var(--accent)]">3. Avertissement sant&eacute;</h2>
              <div className="bg-[var(--bg)] rounded-[20px] shadow-neu-in p-6">
                <p className="text-[var(--text-muted)] text-sm leading-relaxed font-semibold">
                  Kore ne fournit aucun avis m&eacute;dical.
                </p>
                <p className="text-[var(--text-muted)] text-sm leading-relaxed mt-3">
                  Les programmes, suggestions et recommandations g&eacute;n&eacute;r&eacute;s par
                  l&apos;application (y compris par intelligence artificielle) sont fournis &agrave;
                  titre informatif uniquement. Ils ne constituent en aucun cas un diagnostic, un
                  traitement ou un conseil m&eacute;dical.
                </p>
                <p className="text-[var(--text-muted)] text-sm leading-relaxed mt-3">
                  <strong className="text-[var(--text-main)]">Consultez un professionnel de sant&eacute;</strong>{" "}
                  avant de commencer, modifier ou intensifier tout programme d&apos;exercice physique,
                  en particulier si vous avez des ant&eacute;c&eacute;dents m&eacute;dicaux, des
                  blessures r&eacute;centes ou des conditions de sant&eacute; pr&eacute;existantes.
                </p>
              </div>
            </section>

            {/* 4. Limitation de responsabilité */}
            <section className="mb-8">
              <h2 className="text-xl font-bold mb-4 text-[var(--accent)]">4. Limitation de responsabilit&eacute;</h2>
              <p className="text-[var(--text-muted)] text-sm leading-relaxed">
                L&apos;&eacute;diteur de Kore d&eacute;cline toute responsabilit&eacute; en cas de
                blessure, accident, dommage corporel ou mat&eacute;riel survenu lors de
                l&apos;utilisation de l&apos;application ou de la mise en pratique des programmes,
                exercices ou suggestions propos&eacute;s.
              </p>
              <p className="text-[var(--text-muted)] text-sm leading-relaxed mt-3">
                L&apos;utilisateur est seul responsable de sa pratique sportive, du choix des
                charges, de l&apos;ex&eacute;cution des mouvements et de l&apos;adaptation des
                programmes &agrave; ses capacit&eacute;s physiques.
              </p>
            </section>

            {/* 5. Données personnelles */}
            <section className="mb-8">
              <h2 className="text-xl font-bold mb-4 text-[var(--accent)]">5. Donn&eacute;es personnelles</h2>
              <p className="text-[var(--text-muted)] text-sm leading-relaxed">
                Toutes les donn&eacute;es de l&apos;application sont stock&eacute;es{" "}
                <strong className="text-[var(--text-main)]">localement sur votre appareil</strong>.
                Aucune donn&eacute;e personnelle n&apos;est collect&eacute;e, transmise ou
                stock&eacute;e sur un serveur distant par l&apos;&eacute;diteur.
              </p>
              <p className="text-[var(--text-muted)] text-sm leading-relaxed mt-3">
                Si vous utilisez les fonctionnalit&eacute;s d&apos;intelligence artificielle via
                un fournisseur tiers (ex : Gemini), vos donn&eacute;es d&apos;entra&icirc;nement
                peuvent &ecirc;tre transmises &agrave; ce fournisseur conform&eacute;ment &agrave;
                ses propres conditions d&apos;utilisation.
              </p>
            </section>

            {/* 6. Propriété intellectuelle */}
            <section className="mb-8">
              <h2 className="text-xl font-bold mb-4 text-[var(--accent)]">6. Propri&eacute;t&eacute; intellectuelle</h2>
              <p className="text-[var(--text-muted)] text-sm leading-relaxed">
                L&apos;application Kore, son design, son code source et l&apos;ensemble de son
                contenu sont la propri&eacute;t&eacute; exclusive de l&apos;&eacute;diteur. Toute
                reproduction, distribution, modification ou utilisation non autoris&eacute;e est
                interdite.
              </p>
            </section>

            {/* 7. Modification des CGU */}
            <section className="mb-8">
              <h2 className="text-xl font-bold mb-4 text-[var(--accent)]">7. Modification des CGU</h2>
              <p className="text-[var(--text-muted)] text-sm leading-relaxed">
                L&apos;&eacute;diteur se r&eacute;serve le droit de modifier les pr&eacute;sentes
                conditions &agrave; tout moment. En cas de modification, l&apos;utilisateur sera
                inform&eacute; lors du prochain lancement de l&apos;application et devra accepter
                les nouvelles conditions pour continuer &agrave; utiliser Kore.
              </p>
            </section>

            {/* 8. Contact */}
            <section className="mb-8">
              <h2 className="text-xl font-bold mb-4 text-[var(--accent)]">8. Contact</h2>
              <p className="text-[var(--text-muted)] text-sm leading-relaxed">
                Pour toute question relative aux pr&eacute;sentes conditions :{" "}
                <a
                  href="mailto:contact@kore-app.net"
                  className="text-[var(--accent)] hover:underline"
                >
                  contact@kore-app.net
                </a>
              </p>
            </section>

            <div className="h-px bg-[var(--glass-border)] my-8" />
            <p className="text-[var(--text-muted)] text-xs opacity-60 text-center">
              Derni&egrave;re mise &agrave; jour : 9 mars 2026
            </p>

          </div>

          <div className="mt-8 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[var(--text-muted)] text-sm
                font-medium no-underline hover:text-[var(--accent)] transition-colors group"
            >
              <span aria-hidden="true" className="group-hover:-translate-x-1 transition-transform inline-block">
                &larr;
              </span>
              Retour &agrave; l&apos;accueil
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
}
