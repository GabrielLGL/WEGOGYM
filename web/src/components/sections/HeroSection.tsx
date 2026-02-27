"use client";

import { useState, useEffect, useRef } from "react";
import KoreLogo from "@/components/KoreLogo";
import SocialProof from "@/components/SocialProof";

const WORDS = ["CORPS.", "PHYSIQUE.", "NIVEAU.", "POTENTIEL.", "MENTAL.", "OBJECTIF."];

interface HeroSectionProps {
  subscriberCount: number | null;
}

export default function HeroSection({ subscriberCount }: HeroSectionProps) {
  const [navVisible, setNavVisible] = useState(false);
  const [wordIdx, setWordIdx] = useState(0);
  const [phase, setPhase] = useState<"idle" | "out" | "in">("idle");
  const t1Ref = useRef<ReturnType<typeof setTimeout> | null>(null);
  const raf1Ref = useRef<number>(0);
  const raf2Ref = useRef<number>(0);

  useEffect(() => {
    function onScroll() {
      setNavVisible(window.scrollY > 500);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setPhase("out");
      t1Ref.current = setTimeout(() => {
        setWordIdx((i) => (i + 1) % WORDS.length);
        setPhase("in");
        raf1Ref.current = requestAnimationFrame(() => {
          raf2Ref.current = requestAnimationFrame(() => setPhase("idle"));
        });
      }, 380);
    }, 3200);
    return () => {
      clearInterval(timer);
      if (t1Ref.current) clearTimeout(t1Ref.current);
      cancelAnimationFrame(raf1Ref.current);
      cancelAnimationFrame(raf2Ref.current);
    };
  }, []);

  return (
    <>
      {/* ===== STICKY NAV ===== */}
      <nav
        aria-label="Navigation principale"
        className={`fixed top-0 left-0 right-0 z-50 py-3 transition-all duration-300 ${
          navVisible
            ? "translate-y-0 bg-[var(--bg)] shadow-[0_2px_20px_rgba(0,0,0,0.08)]"
            : "-translate-y-full"
        }`}
      >
        <div className="max-w-[1100px] mx-auto px-6 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 no-underline">
            <KoreLogo size={30} gradientId="navGrad" />
            <span className="gradient-text font-black text-base tracking-widest">KORE</span>
          </a>
          <div className="flex items-center gap-6">
            <a href="#features" className="hidden sm:inline text-[var(--text-muted)] text-sm font-medium no-underline hover:text-[var(--text-main)] transition-colors">
              Fonctionnalités
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
      <header aria-label="Présentation de Kore" className="relative z-[2] min-h-screen flex flex-col items-center justify-center text-center px-6 py-20">
        {/* Logo pill */}
        <div className="hero-fade inline-flex items-center gap-4 mb-8 px-6 py-2.5 rounded-full bg-[var(--glass)] border border-[var(--glass-border)] backdrop-blur-[10px] shadow-neu-out hover:scale-105 hover:shadow-neu-in transition-all duration-300 cursor-default">
          <KoreLogo size={50} gradientId="heroGrad" />
          <span className="gradient-text font-black text-2xl tracking-widest">KORE</span>
        </div>

        {/* Title */}
        <h1 className="hero-fade text-[clamp(2.5rem,8vw,5rem)] font-black leading-[1.1] tracking-tight mb-5">
          <span className="shimmer-text">FORGE TON </span>
          <span
            className="shimmer-text"
            style={{
              display: "inline-block",
              minWidth: "11ch",
              opacity: phase === "idle" ? 1 : 0,
              transform:
                phase === "idle"
                  ? "translateY(0px)"
                  : phase === "out"
                  ? "translateY(10px)"
                  : "translateY(-10px)",
              transition:
                phase === "in"
                  ? "none"
                  : phase === "out"
                  ? "opacity 0.35s cubic-bezier(0.4,0,1,1), transform 0.35s cubic-bezier(0.4,0,1,1)"
                  : "opacity 0.45s cubic-bezier(0,0,0.2,1), transform 0.45s cubic-bezier(0,0,0.2,1)",
            }}
          >
            {WORDS[wordIdx]}
          </span>
          <span className="text-[var(--accent)] animate-[blink_0.7s_step-end_infinite]">|</span>
        </h1>

        {/* Subtitle */}
        <p className="hero-fade text-lg sm:text-xl text-[var(--text-muted)] max-w-[600px] mb-8 font-light">
          Ton tracker de musculation 100% offline. Suis tes programmes, enregistre tes
          performances et progresse séance après séance.
        </p>

        {/* Stats row */}
        <div className="hero-fade grid grid-cols-3 gap-6 sm:gap-10 mb-10 max-w-lg mx-auto w-full">
          {[
            { value: "100%", label: "Offline" },
            { value: "0€", label: "Plan gratuit" },
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

        <SocialProof count={subscriberCount} />
      </header>
    </>
  );
}
