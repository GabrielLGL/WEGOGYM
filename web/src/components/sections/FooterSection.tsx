import KoreLogo from "@/components/KoreLogo";

export default function FooterSection() {
  return (
    <footer className="relative z-[2] py-16 px-6 text-center">
      <div className="max-w-[1100px] mx-auto">
        <nav aria-label="Navigation pied de page" className="flex justify-center gap-6 mb-6 flex-wrap">
          <a href="#features" className="py-2 px-1 text-[var(--text-muted)] text-sm font-medium no-underline hover:text-[var(--accent)] transition-colors">
            Fonctionnalités
          </a>
          <a href="#pricing" className="py-2 px-1 text-[var(--text-muted)] text-sm font-medium no-underline hover:text-[var(--accent)] transition-colors">
            Tarifs
          </a>
          <a href="mailto:contact@kore-app.net" className="py-2 px-1 text-[var(--text-muted)] text-sm font-medium no-underline hover:text-[var(--accent)] transition-colors">
            Contact
          </a>
          <a href="/privacy" className="py-2 px-1 text-[var(--text-muted)] text-sm font-medium no-underline hover:text-[var(--accent)] transition-colors">
            Confidentialité
          </a>
          <a href="/mentions-legales" className="py-2 px-1 text-[var(--text-muted)] text-sm font-medium no-underline hover:text-[var(--accent)] transition-colors">
            Mentions légales
          </a>
        </nav>

        <h2 className="sr-only">Kore</h2>
        <div className="flex items-center justify-center gap-2 mb-6">
          <KoreLogo size={24} gradientId="footerGrad" className="!animate-none" />
          <span className="gradient-text font-black text-sm tracking-widest">KORE</span>
        </div>

        <p className="text-[var(--text-muted)] text-xs opacity-60">
          &copy; {new Date().getFullYear()} Kore. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
