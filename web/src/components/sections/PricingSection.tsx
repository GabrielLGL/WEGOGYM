"use client";

import { useEffect, useRef, useState } from "react";
import { PRICING } from "@/data/pricing";

const AUTO_SCROLL_MS = 4500;

export default function PricingSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const userScrolledRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const stopAutoScroll = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  const scrollToCard = (index: number) => {
    const container = scrollRef.current;
    if (!container) return;
    const card = container.children[index] as HTMLElement;
    if (card) container.scrollTo({ left: card.offsetLeft, behavior: "smooth" });
    setActiveIndex(index);
  };

  const startAutoScroll = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % PRICING.length;
        const container = scrollRef.current;
        if (container) {
          const card = container.children[next] as HTMLElement;
          if (card) container.scrollTo({ left: card.offsetLeft, behavior: "smooth" });
        }
        return next;
      });
    }, AUTO_SCROLL_MS);
  };

  useEffect(() => {
    startAutoScroll();
    return () => stopAutoScroll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = () => {
    const container = scrollRef.current;
    if (!container) return;
    const center = container.scrollLeft + container.offsetWidth / 2;
    let closest = 0;
    let minDist = Infinity;
    Array.from(container.children).forEach((child, i) => {
      const el = child as HTMLElement;
      const dist = Math.abs(el.offsetLeft + el.offsetWidth / 2 - center);
      if (dist < minDist) { minDist = dist; closest = i; }
    });
    setActiveIndex(closest);
    if (userScrolledRef.current) stopAutoScroll();
  };

  const handleTouchStart = () => { userScrolledRef.current = true; };

  return (
    <section id="pricing" className="relative z-[2] py-10 sm:py-16 px-6">
      <div className="max-w-[1000px] mx-auto">
        <h2 className="reveal text-center text-3xl sm:text-4xl font-black tracking-tight mb-4">
          Tarifs simples et transparents
        </h2>
        <p className="reveal text-center text-[var(--text-muted)] text-lg mb-14 font-light">
          Commence gratuitement. Passe Pro quand tu es prêt.
        </p>

        <div
          ref={scrollRef}
          onTouchStart={handleTouchStart}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory gap-6 py-6 sm:grid sm:grid-cols-3 sm:overflow-visible sm:snap-none sm:py-0 sm:gap-8"
          style={{ scrollbarWidth: "none" }}
        >
          {PRICING.map((plan) => (
            <article
              key={plan.name}
              className={`shrink-0 w-[75vw] snap-start sm:w-auto bg-[var(--bg)] rounded-[30px] p-8 border transition-all duration-300
                ${plan.highlighted
                  ? "border-[var(--accent)] shadow-neu-accent sm:scale-[1.02]"
                  : "border-transparent shadow-neu-out"
                }`}
            >
              {plan.highlighted && (
                <div className="text-[var(--accent)] text-xs font-extrabold uppercase tracking-widest mb-3">
                  Recommandé
                </div>
              )}
              <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
              <div className="mb-1">
                <span className="text-4xl font-black">{plan.price}</span>
                <span className="text-[var(--text-muted)]">{plan.period}</span>
              </div>
              {plan.badge && (
                <p className="text-[var(--text-muted)] text-xs mb-5">{plan.badge}</p>
              )}
              {!plan.badge && <div className="mb-5" />}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <span className="text-[var(--accent)] mt-0.5" aria-hidden="true">&#10003;</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#download"
                className={`block w-full py-3.5 rounded-full font-bold text-sm text-center no-underline transition-all duration-300 ${
                  plan.highlighted
                    ? "btn-liquid text-white uppercase tracking-wider"
                    : "bg-[var(--bg)] shadow-neu-out text-[var(--text-main)] hover:shadow-neu-in"
                }`}
              >
                {plan.cta}
              </a>
            </article>
          ))}
        </div>

        {/* Dots — mobile only */}
        <div className="sm:hidden flex justify-center items-center gap-2.5 mt-5">
          {PRICING.map((_, i) => (
            <button
              key={i}
              onClick={() => { scrollToCard(i); }}
              aria-label={`Voir tarif ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === activeIndex
                  ? "w-6 h-2 bg-[var(--accent)]"
                  : "w-2 h-2 bg-[var(--text-muted)] opacity-40"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
