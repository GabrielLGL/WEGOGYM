import type { Metadata } from "next";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import BackgroundBlobs from "@/components/BackgroundBlobs";
import KoreLogo from "@/components/KoreLogo";

export const metadata: Metadata = {
  title: "Politique de confidentialité — Kore",
  description:
    "Comment Kore protège tes données personnelles. Conformité RGPD complète.",
};

function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="h-px bg-[var(--glass-border)] my-8" />
      <h2 className="text-xl font-bold mb-4 text-[var(--accent)]">
        {number}. {title}
      </h2>
      {children}
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 list-none p-0 m-0">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2">
          <span className="text-[var(--accent)] mt-0.5 shrink-0" aria-hidden="true">
            →
          </span>
          <span className="text-[var(--text-muted)] text-sm leading-relaxed">
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Skip link — navigation clavier */}
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
              <KoreLogo size={32} gradientId="privacyGrad" />
              <span className="gradient-text font-black text-xl tracking-widest">
                KORE
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
              Politique de confidentialité
            </h1>
            <p className="text-[var(--text-muted)] text-sm">
              Dernière mise à jour : 27 février 2026
            </p>

            {/* Introduction */}
            <p className="text-[var(--text-muted)] text-sm leading-relaxed mt-8">
              Kore prend la protection de tes données personnelles très au sérieux.
              Cette politique explique quelles données nous collectons, pourquoi,
              comment elles sont utilisées, et comment tu peux exercer tes droits
              conformément au Règlement Général sur la Protection des Données (RGPD —
              Règlement UE 2016/679).
            </p>

            {/* 1. Responsable du traitement */}
            <Section number="1" title="Responsable du traitement">
              <p className="text-[var(--text-muted)] text-sm leading-relaxed">
                Le responsable du traitement de tes données est :
              </p>
              <div className="bg-[var(--bg)] rounded-[20px] shadow-neu-in p-6 mt-4">
                <p className="text-[var(--text-muted)] text-sm leading-relaxed">
                  <strong className="text-[var(--text-main)]">Kore App</strong>
                  <br />
                  Email : <a
                    href="mailto:contact@kore-app.net"
                    className="text-[var(--accent)] hover:underline"
                  >
                    contact@kore-app.net
                  </a>
                </p>
              </div>
            </Section>

            {/* 2. Données collectées */}
            <Section number="2" title="Données collectées">
              <p className="text-[var(--text-muted)] text-sm leading-relaxed mb-4">
                Dans le cadre de l&apos;inscription à la liste d&apos;attente beta de Kore,
                nous collectons les données suivantes :
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-[var(--text-muted)] border-collapse">
                  <caption className="sr-only">Données personnelles collectées</caption>
                  <thead>
                    <tr className="border-b border-[var(--glass-border)]">
                      <th className="text-left py-3 pr-6 font-semibold text-[var(--text-main)]">
                        Donnée
                      </th>
                      <th className="text-left py-3 pr-6 font-semibold text-[var(--text-main)]">
                        Obligatoire
                      </th>
                      <th className="text-left py-3 font-semibold text-[var(--text-main)]">
                        Finalité
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[var(--glass-border)]">
                      <td className="py-3 pr-6">Adresse email</td>
                      <td className="py-3 pr-6">Oui</td>
                      <td className="py-3">Notifier du lancement de l&apos;app</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-6">Prénom</td>
                      <td className="py-3 pr-6">Non</td>
                      <td className="py-3">Personnaliser l&apos;email de bienvenue</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Section>

            {/* 3. Base légale */}
            <Section number="3" title="Base légale du traitement">
              <p className="text-[var(--text-muted)] text-sm leading-relaxed">
                Le traitement de tes données repose sur ton{" "}
                <strong className="text-[var(--text-main)]">consentement explicite</strong>{" "}
                (Art. 6.1.a du RGPD), donné au moment de l&apos;inscription au formulaire beta.
                Tu peux retirer ce consentement à tout moment via le lien de désinscription
                présent dans chaque email, ou en nous contactant directement.
              </p>
            </Section>

            {/* 4. Durée de conservation */}
            <Section number="4" title="Durée de conservation">
              <BulletList
                items={[
                  "Tes données sont conservées jusqu'au lancement officiel de l'application Kore.",
                  "En cas de désinscription de ta part, tes données sont supprimées dans un délai de 30 jours.",
                  "Après le lancement, si tu ne souhaites pas créer de compte, tes données seront supprimées.",
                ]}
              />
            </Section>

            {/* 5. Sous-traitants */}
            <Section number="5" title="Sous-traitants et transferts de données">
              <p className="text-[var(--text-muted)] text-sm leading-relaxed mb-4">
                Pour faire fonctionner la liste d&apos;attente, nous faisons appel aux
                sous-traitants suivants. Ces prestataires traitent tes données uniquement
                pour les finalités décrites ci-dessous, conformément à nos instructions.
              </p>
              <div className="space-y-4">
                {[
                  {
                    name: "Supabase Inc.",
                    role: "Stockage de la base de données (liste d'inscrits)",
                    location: "États-Unis — transfert encadré par des clauses contractuelles types (CCT) conformes au RGPD",
                    url: "https://supabase.com/privacy",
                    label: "supabase.com",
                  },
                  {
                    name: "Resend Inc.",
                    role: "Envoi de l'email de bienvenue",
                    location: "États-Unis — transfert encadré par des clauses contractuelles types (CCT)",
                    url: "https://resend.com/legal/privacy-policy",
                    label: "resend.com",
                  },
                  {
                    name: "Vercel Inc.",
                    role: "Hébergement de la landing page",
                    location: "États-Unis — transfert encadré par des clauses contractuelles types (CCT)",
                    url: "https://vercel.com/legal/privacy-policy",
                    label: "vercel.com",
                  },
                  {
                    name: "Google LLC (Google Fonts)",
                    role: "Chargement de la police Outfit via next/font/google — une requête est effectuée vers les serveurs de Google lors du build, ce qui peut entraîner le transfert de l'adresse IP vers des serveurs américains",
                    location: "États-Unis — transfert encadré par les clauses contractuelles types (CCT) de Google",
                    url: "https://policies.google.com/privacy",
                    label: "policies.google.com",
                  },
                ].map((provider) => (
                  <div
                    key={provider.name}
                    className="bg-[var(--bg)] rounded-[20px] shadow-neu-in p-5"
                  >
                    <p className="font-semibold text-[var(--text-main)] text-sm mb-1">
                      {provider.name}
                    </p>
                    <p className="text-[var(--text-muted)] text-xs leading-relaxed mb-1">
                      {provider.role}
                    </p>
                    <p className="text-[var(--text-muted)] text-xs leading-relaxed mb-2">
                      {provider.location}
                    </p>
                    <a
                      href={provider.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Politique de confidentialité de ${provider.label} (nouvel onglet)`}
                      className="text-[var(--accent)] text-xs hover:underline"
                    >
                      Politique de confidentialité → {provider.label}
                    </a>
                  </div>
                ))}
              </div>
            </Section>

            {/* 6. Tes droits */}
            <Section number="6" title="Tes droits (Art. 15–22 RGPD)">
              <p className="text-[var(--text-muted)] text-sm leading-relaxed mb-4">
                Conformément au RGPD, tu disposes des droits suivants sur tes données :
              </p>
              <BulletList
                items={[
                  "Droit d'accès — obtenir une copie de tes données personnelles (Art. 15)",
                  "Droit de rectification — corriger des données inexactes ou incomplètes (Art. 16)",
                  "Droit à l'effacement — demander la suppression de tes données (Art. 17)",
                  "Droit à la portabilité — recevoir tes données dans un format structuré (Art. 20)",
                  "Droit d'opposition — t'opposer au traitement de tes données (Art. 21)",
                  "Droit à la limitation — restreindre le traitement de tes données (Art. 18)",
                  "Retrait du consentement — à tout moment, sans affecter le traitement passé (Art. 7)",
                ]}
              />
              <div className="bg-[var(--bg)] rounded-[20px] shadow-neu-in p-6 mt-6">
                <p className="text-[var(--text-muted)] text-sm leading-relaxed">
                  Pour exercer tes droits, contacte-nous à{" "}
                  <a
                    href="mailto:contact@kore-app.net"
                    className="text-[var(--accent)] hover:underline"
                  >
                    contact@kore-app.net
                  </a>
                  . Nous répondrons dans un délai de 30 jours.
                  <br /><br />
                  Tu as également le droit d&apos;introduire une réclamation auprès de la{" "}
                  <strong className="text-[var(--text-main)]">CNIL</strong>{" "}
                  (Commission Nationale de l&apos;Informatique et des Libertés) :{" "}
                  <a
                    href="https://www.cnil.fr/fr/plaintes"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--accent)] hover:underline"
                  >
                    www.cnil.fr/fr/plaintes
                  </a>
                </p>
              </div>
            </Section>

            {/* 7. App mobile */}
            <Section number="7" title="Application mobile Kore">
              <div className="bg-[var(--bg)] rounded-[20px] shadow-neu-in p-6">
                <p className="text-[var(--text-muted)] text-sm leading-relaxed">
                  L&apos;application mobile Kore fonctionne{" "}
                  <strong className="text-[var(--text-main)]">100% hors ligne</strong>.
                  Toutes tes données d&apos;entraînement (séances, exercices, performances,
                  historique) sont stockées{" "}
                  <strong className="text-[var(--text-main)]">
                    uniquement sur ton téléphone
                  </strong>{" "}
                  dans une base de données locale.
                  <br /><br />
                  Aucune donnée provenant de l&apos;application n&apos;est envoyée sur nos
                  serveurs. Tes entraînements restent privés et sous ton contrôle total.
                </p>
              </div>
            </Section>

            {/* 8. Cookies */}
            <Section number="8" title="Cookies et stockage local">
              <p className="text-[var(--text-muted)] text-sm leading-relaxed">
                La landing page Kore <strong className="text-[var(--text-main)]">
                  n&apos;utilise pas de cookies de traçage ou d&apos;analytics
                </strong>.
                La seule donnée stockée dans ton navigateur est ta préférence de thème
                (clair/sombre), sauvegardée dans le{" "}
                <code className="text-[var(--accent)] text-xs bg-[var(--bg)] px-1.5 py-0.5 rounded shadow-neu-in">
                  localStorage
                </code>{" "}
                de ton navigateur sous la clé{" "}
                <code className="text-[var(--accent)] text-xs bg-[var(--bg)] px-1.5 py-0.5 rounded shadow-neu-in">
                  kore-theme
                </code>.
                Cette donnée ne quitte jamais ton appareil.
              </p>
            </Section>

            {/* 9. Modifications */}
            <Section number="9" title="Modifications de cette politique">
              <p className="text-[var(--text-muted)] text-sm leading-relaxed">
                Nous nous réservons le droit de modifier cette politique de
                confidentialité à tout moment. En cas de modification substantielle
                affectant tes droits, tu seras notifié par email si tu es inscrit à
                la liste d&apos;attente. La date de dernière mise à jour est toujours
                indiquée en haut de cette page.
              </p>
            </Section>

            {/* Footer de page */}
            <div className="h-px bg-[var(--glass-border)] my-8" />
            <p className="text-[var(--text-muted)] text-xs opacity-60 text-center">
              &copy; {new Date().getFullYear()} Kore. Tous droits réservés.
            </p>

          </div>

          {/* Back link bas de page */}
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
