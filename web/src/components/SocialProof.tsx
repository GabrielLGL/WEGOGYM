interface SocialProofProps {
  count: number | null;
}

export default function SocialProof({ count }: SocialProofProps) {
  if (count === null || count < 50) {
    return (
      <div
        className="hero-fade inline-flex items-center gap-2 mt-6 px-5 py-2 rounded-full
          bg-[var(--glass)] border border-[var(--glass-border)] backdrop-blur-[10px]
          shadow-neu-out text-sm"
      >
        <span aria-hidden="true">🔥</span>
        <span className="text-[var(--text-muted)]">Rejoins les premiers inscrits</span>
      </div>
    );
  }

  return (
    <div
      className="hero-fade inline-flex items-center gap-2 mt-6 px-5 py-2 rounded-full
        bg-[var(--glass)] border border-[var(--glass-border)] backdrop-blur-[10px]
        shadow-neu-out text-sm"
    >
      <span aria-hidden="true">🔥</span>
      <span className="text-[var(--text-muted)]">
        <span className="font-black text-[var(--accent)]">{count}</span>
        {" "}personnes déjà inscrites
      </span>
    </div>
  );
}
