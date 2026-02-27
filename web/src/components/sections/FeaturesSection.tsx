import { FEATURES } from "@/data/features";

export default function FeaturesSection() {
  return (
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
              className="reveal bg-[var(--bg)] p-6 sm:p-10 rounded-[30px] shadow-neu-out border border-transparent
                transition-all duration-400 text-left
                hover:border-[var(--accent-glow)] hover:-translate-y-2 hover:rotate-x-[2deg] hover:rotate-y-[-2deg]"
              style={{ perspective: "1000px" }}
            >
              {/* Icon box inset */}
              <div className="w-[70px] h-[70px] rounded-[20px] bg-[var(--bg)] shadow-neu-in flex items-center justify-center text-3xl mb-6" aria-hidden="true">
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
  );
}
