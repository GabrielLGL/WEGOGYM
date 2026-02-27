import { PRICING } from "@/data/pricing";

export default function PricingSection() {
  return (
    <section id="pricing" className="relative z-[2] py-10 sm:py-16 px-6">
      <div className="max-w-[1000px] mx-auto">
        <h2 className="reveal text-center text-3xl sm:text-4xl font-black tracking-tight mb-4">
          Tarifs simples et transparents
        </h2>
        <p className="reveal text-center text-[var(--text-muted)] text-lg mb-14 font-light">
          Commence gratuitement. Passe Pro quand tu es prêt.
        </p>

        <div className="grid sm:grid-cols-3 gap-8">
          {PRICING.map((plan) => (
            <article
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
      </div>
    </section>
  );
}
