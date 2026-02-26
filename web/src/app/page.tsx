"use client";

import { useState, useEffect } from "react";
import KoreLogo from "@/components/KoreLogo";
import BackgroundBlobs from "@/components/BackgroundBlobs";
import ThemeToggle from "@/components/ThemeToggle";
import ScrollReveal from "@/components/ScrollReveal";

const FEATURES = [
  {
    icon: "\uD83C\uDFCB\uFE0F",
    title: "Programmes sur mesure",
    description:
      "Cree tes propres programmes et seances. Organise tes exercices par muscle, equipement et objectif.",
  },
  {
    icon: "\uD83D\uDCCA",
    title: "Suivi de performance",
    description:
      "Enregistre chaque serie, chaque rep. Visualise ta progression avec des graphiques detailles.",
  },
  {
    icon: "\u26A1",
    title: "100% Offline",
    description:
      "Pas besoin de wifi a la salle. Tout fonctionne en local sur ton telephone, instantanement.",
  },
  {
    icon: "\uD83D\uDCF1",
    title: "Interface intuitive",
    description:
      "Pensee pour la salle de sport. Navigation rapide, saisie facile, mode sombre qui repose les yeux.",
  },
  {
    icon: "\uD83D\uDCC8",
    title: "Historique complet",
    description:
      "Retrouve toutes tes seances passees. Analyse tes records et tes tendances sur la duree.",
  },
  {
    icon: "\uD83C\uDFAF",
    title: "Objectifs clairs",
    description:
      "Definis tes objectifs et suis ta progression. L\u2019app s\u2019adapte a ton niveau.",
  },
];

const PRICING = [
  {
    name: "Gratuit",
    price: "0\u20AC",
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
    price: "2,50\u20AC",
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
    price: "19.99\u20AC",
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
  const [navVisible, setNavVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setNavVisible(window.scrollY > 500);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
    <div className="min-h-screen relative">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:bg-[var(--accent)] focus:text-white focus:px-4 focus:py-2 focus:rounded-lg">
        Aller au contenu principal
      </a>
      <BackgroundBlobs />
      <ThemeToggle />
      <ScrollReveal />

      {/* ===== STICKY NAV ===== */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 py-3 transition-all duration-300 ${
          navVisible
            ? "translate-y-0 bg-[var(--bg)] shadow-[0_2px_20px_rgba(0,0,0,0.08)]"
            : "-translate-y-full"
        }`}
      >
        <div className="max-w-[1100px] mx-auto px-6 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2 no-underline">
            <KoreLogo size={30} gradientId="navGrad" />
            <span className="gradient-text font-black text-base tracking-widest">KORE</span>
          </a>
          <div className="flex items-center gap-6">
            <a href="#features" className="hidden sm:inline text-[var(--text-muted)] text-sm font-medium no-underline hover:text-[var(--text-main)] transition-colors">
              Fonctionnalites
            </a>
            <a href="#pricing" className="hidden sm:inline text-[var(--text-muted)] text-sm font-medium no-underline hover:text-[var(--text-main)] transition-colors">
              Tarifs
            </a>
            <a
              href="#download"
              className="px-5 py-2 rounded-full bg-[var(--accent)] text-white text-sm font-bold no-underline
                hover:-translate-y-0.5 hover:shadow-[0_4px_15px_var(--accent-glow)] transition-all duration-200"
            >
              S&apos;inscrire
            </a>
          </div>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <header id="main-content" className="relative z-[2] min-h-screen flex flex-col items-center justify-center text-center px-6 py-20">
        {/* Logo pill */}
        <div className="hero-fade inline-flex items-center gap-4 mb-8 px-6 py-2.5 rounded-full bg-[var(--glass)] border border-[var(--glass-border)] backdrop-blur-[10px] shadow-neu-out hover:scale-105 hover:shadow-neu-in transition-all duration-300 cursor-default">
          <KoreLogo size={50} gradientId="heroGrad" />
          <span className="gradient-text font-black text-2xl tracking-widest">KORE</span>
        </div>

        {/* Title */}
        <h1 className="hero-fade text-[clamp(2.5rem,8vw,5rem)] font-black leading-[1.1] tracking-tight mb-5">
          <span className="shimmer-text">SCULPT YOUR BODY.</span>
          <span className="text-[var(--accent)] animate-[blink_0.7s_step-end_infinite]">|</span>
        </h1>

        {/* Subtitle */}
        <p className="hero-fade text-lg sm:text-xl text-[var(--text-muted)] max-w-[600px] mb-8 font-light">
          Suis tes programmes, enregistre tes performances et progresse
          seance apres seance. Simple, rapide, offline.
        </p>

        {/* Stats row */}
        <div className="hero-fade grid grid-cols-3 gap-6 sm:gap-10 mb-10 max-w-lg mx-auto w-full">
          {[
            { value: "100%", label: "Offline" },
            { value: "0\u20AC", label: "Pour commencer" },
            { value: "<1s", label: "Chargement" },
          ].map((stat) => (
            <div key={stat.label} className="bg-[var(--bg)] rounded-[20px] shadow-neu-out py-5 px-3 text-center">
              <div className="text-2xl sm:text-3xl font-black text-[var(--accent)]" style={{ textShadow: "0 0 20px var(--accent-glow)" }}>
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 font-medium uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* CTA button */}
        <a
          href="#download"
          className="hero-fade btn-liquid text-white px-10 py-4 rounded-full font-extrabold text-lg uppercase tracking-widest no-underline"
        >
          Rejoindre la beta
        </a>
      </header>

      {/* ===== FEATURES ===== */}
      <section id="features" className="relative z-[2] py-10 sm:py-16 px-6">
        <div className="max-w-[1100px] mx-auto">
          <h2 className="reveal text-center text-3xl sm:text-4xl font-black tracking-tight mb-4">
            Tout ce qu&apos;il te faut
          </h2>
          <p className="reveal text-center text-[var(--text-muted)] text-lg mb-14 font-light">
            Et rien de plus.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="reveal bg-[var(--bg)] p-10 rounded-[30px] shadow-neu-out border border-transparent
                  transition-all duration-400 text-left
                  hover:border-[var(--accent-glow)] hover:-translate-y-2 hover:rotate-x-[2deg] hover:rotate-y-[-2deg]"
                style={{ perspective: "1000px" }}
              >
                {/* Icon box inset */}
                <div className="w-[70px] h-[70px] rounded-[20px] bg-[var(--bg)] shadow-neu-in flex items-center justify-center text-3xl mb-6" role="img" aria-label={feature.title}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-[var(--text-muted)] text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" className="relative z-[2] py-10 sm:py-16 px-6">
        <div className="max-w-[1000px] mx-auto">
          <h2 className="reveal text-center text-3xl sm:text-4xl font-black tracking-tight mb-4">
            Tarifs simples et transparents
          </h2>
          <p className="reveal text-center text-[var(--text-muted)] text-lg mb-14 font-light">
            Commence gratuitement. Passe Pro quand tu es pret.
          </p>

          <div className="grid sm:grid-cols-3 gap-8">
            {PRICING.map((plan) => (
              <div
                key={plan.name}
                className={`reveal bg-[var(--bg)] rounded-[30px] p-8 shadow-neu-out border transition-all duration-300
                  ${plan.highlighted
                    ? "border-[var(--accent)] shadow-[0_0_30px_var(--accent-glow)] scale-[1.02]"
                    : "border-transparent"
                  }`}
              >
                {plan.highlighted && (
                  <div className="text-[var(--accent)] text-xs font-extrabold uppercase tracking-widest mb-3">
                    Le plus populaire
                  </div>
                )}
                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-black">{plan.price}</span>
                  <span className="text-[var(--text-muted)]">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <span className="text-[var(--accent)] mt-0.5">&#10003;</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-3.5 rounded-full font-bold text-sm transition-all duration-300 cursor-pointer border-none ${
                    plan.highlighted
                      ? "btn-liquid text-white uppercase tracking-wider"
                      : "bg-[var(--bg)] shadow-neu-out text-[var(--text-main)] hover:shadow-neu-in"
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA / DOWNLOAD ===== */}
      <section id="download" className="relative z-[2] py-20 sm:py-28 px-6">
        <div className="max-w-[600px] mx-auto text-center">
          <h2 className="reveal text-3xl sm:text-4xl font-black tracking-tight mb-4">
            Pret a progresser ?
          </h2>
          <p className="reveal text-[var(--text-muted)] text-lg mb-10 font-light">
            Inscris-toi pour etre informe du lancement et recevoir un acces anticipe.
          </p>

          <form onSubmit={handleSubmit} className="reveal space-y-4 max-w-md mx-auto" aria-label="Formulaire d'inscription">
            {/* Name input */}
            <div className="bg-[var(--bg)] rounded-full shadow-neu-out p-2.5">
              <label htmlFor="subscribe-name" className="sr-only">Prenom (optionnel)</label>
              <input
                id="subscribe-name"
                type="text"
                placeholder="Ton prenom (optionnel)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-transparent border-none py-3 px-6 rounded-full shadow-neu-in
                  text-[var(--text-main)] font-inherit text-base outline-none
                  placeholder:text-[var(--text-muted)] placeholder:opacity-60"
              />
            </div>

            {/* Email input */}
            <div className="bg-[var(--bg)] rounded-full shadow-neu-out p-2.5">
              <label htmlFor="subscribe-email" className="sr-only">Adresse email</label>
              <input
                id="subscribe-email"
                type="email"
                placeholder="Ton email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-required="true"
                className="w-full bg-transparent border-none py-3 px-6 rounded-full shadow-neu-in
                  text-[var(--text-main)] font-inherit text-base outline-none
                  placeholder:text-[var(--text-muted)] placeholder:opacity-60"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full btn-liquid text-white py-4 rounded-full font-extrabold text-base
                uppercase tracking-widest border-none cursor-pointer
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === "loading" ? "Inscription..." : "S\u2019inscrire"}
            </button>

            {status === "success" && (
              <p role="alert" className="text-[var(--success)] text-sm font-semibold">
                Inscription reussie ! Verifie ta boite mail.
              </p>
            )}
            {status === "error" && (
              <p role="alert" className="text-[var(--danger)] text-sm font-semibold">
                Une erreur est survenue. Reessaie.
              </p>
            )}
          </form>

          <p className="reveal text-[var(--text-muted)] text-xs mt-8 opacity-80">
            Pas de spam. Desabonnement en un clic.{" "}
            <a href="/privacy" className="underline hover:text-[var(--accent)] transition-colors">
              Politique de confidentialite
            </a>
          </p>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="relative z-[2] py-16 px-6 text-center">
        <div className="max-w-[1100px] mx-auto">
          <div className="flex justify-center gap-6 mb-6 flex-wrap">
            <a href="#features" className="text-[var(--text-muted)] text-sm font-medium no-underline hover:text-[var(--accent)] transition-colors">
              Fonctionnalites
            </a>
            <a href="#pricing" className="text-[var(--text-muted)] text-sm font-medium no-underline hover:text-[var(--accent)] transition-colors">
              Tarifs
            </a>
            <a href="mailto:contact@kore-app.com" className="text-[var(--text-muted)] text-sm font-medium no-underline hover:text-[var(--accent)] transition-colors">
              Contact
            </a>
            <a href="/privacy" className="text-[var(--text-muted)] text-sm font-medium no-underline hover:text-[var(--accent)] transition-colors">
              Confidentialite
            </a>
          </div>

          <div className="flex items-center justify-center gap-2 mb-6">
            <KoreLogo size={24} gradientId="footerGrad" className="!animate-none" />
            <span className="gradient-text font-black text-sm tracking-widest">KORE</span>
          </div>

          <p className="text-[var(--text-muted)] text-xs opacity-60">
            &copy; {new Date().getFullYear()} Kore. Tous droits reserves.
          </p>
        </div>
      </footer>
    </div>
  );
}
