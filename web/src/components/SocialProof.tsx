"use client";

import { useEffect, useState } from "react";

const FALLBACK = 342;

export default function SocialProof() {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/subscribers-count")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data: { count: number }) => {
        setCount(data.count);
        setLoading(false);
      })
      .catch(() => {
        setCount(FALLBACK);
        setLoading(false);
      });
  }, []);

  return (
    <div
      className="hero-fade inline-flex items-center gap-2 mt-6 px-5 py-2 rounded-full
        bg-[var(--glass)] border border-[var(--glass-border)] backdrop-blur-[10px]
        shadow-neu-out text-sm"
    >
      <span aria-hidden="true">🔥</span>
      <span className="text-[var(--text-muted)]">
        {loading ? (
          <span
            className="inline-block w-8 h-3 rounded bg-[var(--text-muted)] opacity-30 animate-pulse align-middle"
            aria-hidden="true"
          />
        ) : (
          <span className="font-black text-[var(--accent)]">{count ?? FALLBACK}</span>
        )}
        {" "}personnes déjà inscrites
      </span>
    </div>
  );
}
