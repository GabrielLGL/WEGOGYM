"use client";

import { useState } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import BackgroundBlobs from "@/components/BackgroundBlobs";
import KoreLogo from "@/components/KoreLogo";

type Status = "idle" | "loading" | "success" | "error" | "ratelimit";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !message || message.trim().length < 10) return;

    setStatus("loading");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      if (res.ok) {
        setStatus("success");
        setName("");
        setEmail("");
        setMessage("");
      } else if (res.status === 429) {
        setStatus("ratelimit");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

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
              <KoreLogo size={32} gradientId="contactGrad" />
              <span className="gradient-text font-black text-xl tracking-widest">KORE</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
              Contact
            </h1>
            <p className="text-[var(--text-muted)] text-sm mb-8">
              Une question, une suggestion ou un probl&egrave;me ? N&apos;h&eacute;site pas &agrave; nous &eacute;crire.
            </p>

            <div className="h-px bg-[var(--glass-border)] my-8" />

            {/* Email direct */}
            <section className="mb-10">
              <h2 className="text-xl font-bold mb-4 text-[var(--accent)]">Email</h2>
              <p className="text-[var(--text-muted)] text-sm leading-relaxed mb-4">
                Tu peux nous contacter directement par email :
              </p>
              <a
                href="mailto:contact@kore-app.net"
                className="inline-flex items-center gap-3 bg-[var(--bg)] rounded-full shadow-neu-out
                  px-6 py-3 text-[var(--accent)] font-semibold text-sm no-underline
                  hover:shadow-neu-in transition-shadow"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                contact@kore-app.net
              </a>
            </section>

            <div className="h-px bg-[var(--glass-border)] my-8" />

            {/* Formulaire */}
            <section>
              <h2 className="text-xl font-bold mb-4 text-[var(--accent)]">Formulaire de contact</h2>
              <p className="text-[var(--text-muted)] text-sm leading-relaxed mb-6">
                Ou utilise le formulaire ci-dessous. Nous te r&eacute;pondrons dans les meilleurs d&eacute;lais.
              </p>

              <form onSubmit={handleSubmit} aria-busy={status === "loading"} className="space-y-4" aria-label="Formulaire de contact">
                {/* Nom */}
                <div className="bg-[var(--bg)] rounded-full shadow-neu-out p-2.5">
                  <label htmlFor="contact-name" className="sr-only">Nom (optionnel)</label>
                  <input
                    id="contact-name"
                    type="text"
                    autoComplete="name"
                    placeholder="Ton nom (optionnel)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-transparent border-none py-3 px-6 rounded-full shadow-neu-in
                      text-[var(--text-main)] font-inherit text-base outline-none
                      placeholder:text-[var(--text-muted)] placeholder:opacity-60"
                  />
                </div>

                {/* Email */}
                <div className="bg-[var(--bg)] rounded-full shadow-neu-out p-2.5">
                  <label htmlFor="contact-email" className="sr-only">Adresse email</label>
                  <input
                    id="contact-email"
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

                {/* Message */}
                <div className="bg-[var(--bg)] rounded-[20px] shadow-neu-out p-2.5">
                  <label htmlFor="contact-message" className="sr-only">Message</label>
                  <textarea
                    id="contact-message"
                    placeholder="Ton message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    aria-required="true"
                    minLength={10}
                    rows={5}
                    className="w-full bg-transparent border-none py-3 px-6 rounded-[14px] shadow-neu-in
                      text-[var(--text-main)] font-inherit text-base outline-none resize-y min-h-[120px]
                      placeholder:text-[var(--text-muted)] placeholder:opacity-60"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  aria-disabled={status === "loading"}
                  tabIndex={status === "loading" ? -1 : 0}
                  className="w-full btn-liquid text-white py-4 rounded-full font-extrabold text-base
                    uppercase tracking-widest border-none cursor-pointer
                    aria-disabled:opacity-50 aria-disabled:cursor-not-allowed"
                >
                  {status === "loading" ? "Envoi..." : "Envoyer"}
                </button>

                {status === "success" && (
                  <p role="alert" className="text-[var(--success)] text-sm font-semibold text-center">
                    Message envoy&eacute; ! Nous te r&eacute;pondrons rapidement.
                  </p>
                )}
                {status === "ratelimit" && (
                  <p role="alert" className="text-[var(--accent)] text-sm font-semibold text-center">
                    Trop de messages envoy&eacute;s. R&eacute;essaie dans une heure.
                  </p>
                )}
                {status === "error" && (
                  <p role="alert" className="text-[var(--danger)] text-sm font-semibold text-center">
                    Une erreur est survenue. R&eacute;essaie ou contacte-nous par email.
                  </p>
                )}
              </form>
            </section>

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
