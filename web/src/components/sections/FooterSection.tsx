import KoreLogo from "@/components/KoreLogo";

export default function FooterSection() {
  return (
    <footer className="relative z-[2] py-16 px-6 text-center">
      <div className="max-w-[1100px] mx-auto">
        <nav aria-label="Navigation pied de page" className="flex justify-center gap-6 mb-6 flex-wrap">
          <a href="#features" className="text-[var(--text-muted)] text-sm font-medium no-underline hover:text-[var(--accent)] transition-colors">
            Fonctionnalités
          </a>
          <a href="#pricing" className="text-[var(--text-muted)] text-sm font-medium no-underline hover:text-[var(--accent)] transition-colors">
            Tarifs
          </a>
          <a href="mailto:contact@kore-app.com" className="text-[var(--text-muted)] text-sm font-medium no-underline hover:text-[var(--accent)] transition-colors">
            Contact
          </a>
          <a href="/privacy" className="text-[var(--text-muted)] text-sm font-medium no-underline hover:text-[var(--accent)] transition-colors">
            Confidentialité
          </a>
        </nav>

        {/* Social links */}
        <div className="flex justify-center gap-4 mb-6">
          <a
            href="https://instagram.com/kore.app"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Kore sur Instagram"
            className="w-9 h-9 rounded-full bg-[var(--bg)] shadow-neu-out flex items-center justify-center
              text-[var(--text-muted)] hover:text-[var(--accent)] hover:scale-110
              transition-all duration-200 no-underline text-base"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <circle cx="12" cy="12" r="4"/>
              <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
            </svg>
          </a>
          <a
            href="https://tiktok.com/@kore.app"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Kore sur TikTok"
            className="w-9 h-9 rounded-full bg-[var(--bg)] shadow-neu-out flex items-center justify-center
              text-[var(--text-muted)] hover:text-[var(--accent)] hover:scale-110
              transition-all duration-200 no-underline text-base"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.27 8.27 0 004.84 1.54V6.78a4.85 4.85 0 01-1.07-.09z"/>
            </svg>
          </a>
        </div>

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
