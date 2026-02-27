"use client";

import { useState } from "react";
import Link from "next/link";

export default function SubscribeSection() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "duplicate" | "ratelimit">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !consent) return;

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
        setConsent(false);
      } else if (res.status === 429) {
        setStatus("ratelimit");
      } else if (res.status === 409) {
        setStatus("duplicate");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id="download" className="relative z-[2] py-20 sm:py-28 px-6">
      <div className="max-w-[600px] mx-auto text-center">
        <h2 className="reveal text-3xl sm:text-4xl font-black tracking-tight mb-4">
          Prêt à progresser ?
        </h2>
        <p className="reveal text-[var(--text-muted)] text-lg mb-10 font-light">
          Inscris-toi pour être informé du lancement et recevoir un accès anticipé.
        </p>

        <form onSubmit={handleSubmit} aria-busy={status === "loading"} className="reveal space-y-4 max-w-md mx-auto" aria-label="Formulaire d'inscription">
          {/* Name input */}
          <div className="bg-[var(--bg)] rounded-full shadow-neu-out p-2.5">
            <label htmlFor="subscribe-name" className="sr-only">Prénom (optionnel)</label>
            <input
              id="subscribe-name"
              type="text"
              autoComplete="given-name"
              placeholder="Ton prénom (optionnel)"
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
              autoComplete="email"
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

          {/* Consentement RGPD */}
          <label className="flex items-start gap-3 text-left cursor-pointer select-none">
            {/* Checkbox native cachée — accessibilité + validation formulaire */}
            <input
              type="checkbox"
              required
              aria-required="true"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="sr-only"
            />
            {/* Checkbox neumorphique custom */}
            <span
              aria-hidden="true"
              className={`mt-0.5 w-5 h-5 shrink-0 rounded-[6px] bg-[var(--bg)] flex items-center justify-center transition-all duration-200 border ${
                consent
                  ? "shadow-neu-in border-[var(--accent)]"
                  : "shadow-neu-out border-white/10"
              }`}
            >
              {consent && (
                <svg width="11" height="9" viewBox="0 0 11 9" fill="none" aria-hidden="true">
                  <path d="M1 4l3 3 6-6" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            <span className="text-[var(--text-muted)] text-xs leading-relaxed">
              J&apos;accepte la{" "}
              <Link href="/privacy" className="text-[var(--accent)] hover:underline">
                politique de confidentialité
              </Link>{" "}
              et souhaite recevoir des nouvelles de Kore.
            </span>
          </label>

          {/* Submit */}
          <button
            type="submit"
            aria-disabled={status === "loading" || !consent}
            tabIndex={status === "loading" ? -1 : 0}
            className="w-full btn-liquid text-white py-4 rounded-full font-extrabold text-base
              uppercase tracking-widest border-none cursor-pointer
              aria-disabled:opacity-50 aria-disabled:cursor-not-allowed"
          >
            {status === "loading" ? "Inscription..." : "S\u2019inscrire"}
          </button>

          {status === "success" && (
            <p role="alert" className="text-[var(--success)] text-sm font-semibold">
              Inscription réussie ! Vérifie ta boite mail.
            </p>
          )}
          {status === "ratelimit" && (
            <p role="alert" className="text-[var(--accent)] text-sm font-semibold">
              Trop de tentatives. Réessaie dans une heure.
            </p>
          )}
          {status === "duplicate" && (
            <p role="alert" className="text-[var(--accent)] text-sm font-semibold">
              Cet email est déjà inscrit. À bientôt !
            </p>
          )}
          {status === "error" && (
            <p role="alert" className="text-[var(--danger)] text-sm font-semibold">
              Une erreur est survenue. Réessaie.
            </p>
          )}
        </form>

        <p className="reveal text-[var(--text-muted)] text-xs mt-8 opacity-80">
          Pas de spam. Désabonnement en un clic.{" "}
          <a href="/privacy" className="underline hover:text-[var(--accent)] transition-colors">
            Politique de confidentialité
          </a>
        </p>
      </div>
    </section>
  );
}
