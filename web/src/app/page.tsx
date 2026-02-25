"use client";

import { useState } from "react";

const FEATURES = [
  {
    icon: "🏋️",
    title: "Programmes sur mesure",
    description:
      "Cree tes propres programmes et seances. Organise tes exercices par muscle, equipement et objectif.",
  },
  {
    icon: "📊",
    title: "Suivi de performance",
    description:
      "Enregistre chaque serie, chaque rep. Visualise ta progression avec des graphiques detailles.",
  },
  {
    icon: "⚡",
    title: "100% Offline",
    description:
      "Pas besoin de wifi a la salle. Tout fonctionne en local sur ton telephone, instantanement.",
  },
  {
    icon: "📱",
    title: "Interface intuitive",
    description:
      "Pensee pour la salle de sport. Navigation rapide, saisie facile, mode sombre qui repose les yeux.",
  },
  {
    icon: "📈",
    title: "Historique complet",
    description:
      "Retrouve toutes tes seances passees. Analyse tes records et tes tendances sur la duree.",
  },
  {
    icon: "🎯",
    title: "Objectifs clairs",
    description:
      "Definis tes objectifs et suis ta progression. L'app s'adapte a ton niveau.",
  },
];

const PRICING = [
  {
    name: "Gratuit",
    price: "0€",
    period: "",
    features: [
      "3 programmes",
      "Suivi des performances",
      "Historique 30 jours",
      "Mode offline",
    ],
    cta: "Commencer gratuitement",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "4,99€",
    period: "/mois",
    features: [
      "Programmes illimites",
      "Suivi des performances",
      "Historique illimite",
      "Mode offline",
      "Statistiques avancees",
      "Export de donnees",
      "Support prioritaire",
    ],
    cta: "Essai gratuit 7 jours",
    highlighted: true,
  },
  {
    name: "Pro Annuel",
    price: "39,99€",
    period: "/an",
    features: [
      "Tout le plan Pro",
      "2 mois offerts",
      "Acces aux nouveautes en avant-premiere",
    ],
    cta: "Economiser 33%",
    highlighted: false,
  },
];

export default function Home() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });

      if (res.ok) {
        setStatus("success");
        setEmail("");
        setName("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#" className="text-xl font-extrabold tracking-tight">
            KO<span className="text-primary">RE</span>
          </a>
          <div className="hidden sm:flex items-center gap-8 text-sm text-text-secondary">
            <a href="#features" className="hover:text-text transition-colors">
              Fonctionnalites
            </a>
            <a href="#pricing" className="hover:text-text transition-colors">
              Tarifs
            </a>
            <a
              href="#download"
              className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl font-semibold transition-colors"
            >
              Telecharger
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block mb-6 px-4 py-1.5 bg-card rounded-full border border-border text-sm text-text-secondary">
            Disponible sur Android
          </div>

          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
            Ton coach muscu
            <br />
            <span className="text-primary">dans ta poche</span>
          </h1>

          <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
            Suis tes programmes, enregistre tes performances et progresse
            seance apres seance. Simple, rapide, offline.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#download"
              className="bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-2xl font-bold text-lg transition-colors"
            >
              Telecharger gratuitement
            </a>
            <a
              href="#features"
              className="bg-card hover:bg-card-secondary text-text border border-border px-8 py-4 rounded-2xl font-bold text-lg transition-colors"
            >
              Decouvrir
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 max-w-lg mx-auto">
            <div>
              <div className="text-3xl font-extrabold text-primary">100%</div>
              <div className="text-sm text-text-secondary mt-1">Offline</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-success">0€</div>
              <div className="text-sm text-text-secondary mt-1">Pour commencer</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-warning">&lt;1s</div>
              <div className="text-sm text-text-secondary mt-1">Temps de chargement</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
              Tout ce qu&apos;il te faut
            </h2>
            <p className="text-text-secondary text-lg max-w-xl mx-auto">
              Pas de features inutiles. Juste l&apos;essentiel pour progresser a la salle.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="bg-card border border-border rounded-2xl p-6 hover:border-primary/40 transition-colors"
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6 bg-card/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
              Tarifs simples et transparents
            </h2>
            <p className="text-text-secondary text-lg">
              Commence gratuitement. Passe Pro quand tu es pret.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {PRICING.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-6 border ${
                  plan.highlighted
                    ? "bg-primary/10 border-primary"
                    : "bg-card border-border"
                }`}
              >
                {plan.highlighted && (
                  <div className="text-primary text-xs font-bold uppercase tracking-wider mb-3">
                    Le plus populaire
                  </div>
                )}
                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold">{plan.price}</span>
                  <span className="text-text-secondary">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <span className="text-success mt-0.5">&#10003;</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-colors ${
                    plan.highlighted
                      ? "bg-primary hover:bg-primary-hover text-white"
                      : "bg-card-secondary hover:bg-secondary-button text-text border border-border"
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA / Download */}
      <section id="download" className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card border border-border rounded-3xl p-8 sm:p-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
              Pret a progresser ?
            </h2>
            <p className="text-text-secondary text-lg mb-8">
              Inscris-toi pour etre informe du lancement et recevoir un acces
              anticipe.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
              <input
                type="text"
                placeholder="Ton prenom (optionnel)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-card-secondary border border-border rounded-xl px-4 py-3 text-text placeholder:text-placeholder focus:outline-none focus:border-primary transition-colors"
              />
              <input
                type="email"
                placeholder="Ton email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-card-secondary border border-border rounded-xl px-4 py-3 text-text placeholder:text-placeholder focus:outline-none focus:border-primary transition-colors"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 text-white py-3.5 rounded-xl font-bold text-lg transition-colors"
              >
                {status === "loading" ? "Inscription..." : "S'inscrire"}
              </button>

              {status === "success" && (
                <p className="text-success text-sm font-medium">
                  Inscription reussie ! Verifie ta boite mail.
                </p>
              )}
              {status === "error" && (
                <p className="text-danger text-sm font-medium">
                  Une erreur est survenue. Reessaie.
                </p>
              )}
            </form>

            <p className="text-text-secondary text-xs mt-6">
              Pas de spam. Desabonnement en un clic.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="font-extrabold text-lg">
            KO<span className="text-primary">RE</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-text-secondary">
            <a href="#features" className="hover:text-text transition-colors">
              Fonctionnalites
            </a>
            <a href="#pricing" className="hover:text-text transition-colors">
              Tarifs
            </a>
            <a href="mailto:contact@kore-app.com" className="hover:text-text transition-colors">
              Contact
            </a>
          </div>
          <div className="text-xs text-text-secondary">
            &copy; {new Date().getFullYear()} Kore. Tous droits reserves.
          </div>
        </div>
      </footer>
    </div>
  );
}
