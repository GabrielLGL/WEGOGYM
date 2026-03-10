const FAQ_ITEMS = [
  {
    question: "Est-ce que Kore est vraiment gratuit ?",
    answer:
      "Oui, Kore est une application de musculation 100% gratuite. Toutes les fonctionnalités de base — création de programmes, suivi des séries, historique — sont accessibles sans payer. Des options premium pourront être proposées à l\u2019avenir, mais le tracker restera gratuit.",
  },
  {
    question: "Kore fonctionne-t-il sans connexion internet ?",
    answer:
      "Absolument. Kore est conçu offline-first : toutes tes données sont stockées en local sur ton téléphone. Tu peux créer des programmes, enregistrer tes séances et consulter ton historique sans aucune connexion Wi-Fi ou 4G.",
  },
  {
    question: "Sur quels appareils Kore est-il disponible ?",
    answer:
      "Kore est disponible sur Android. Une version iOS est envisagée pour plus tard, mais la priorité est de proposer la meilleure expérience possible sur Android d\u2019abord.",
  },
  {
    question: "Comment créer un programme d\u2019entraînement ?",
    answer:
      "Depuis l\u2019écran d\u2019accueil, crée un nouveau programme, ajoute des séances et choisis tes exercices parmi la bibliothèque intégrée. Tu peux organiser chaque séance par muscle ciblé et équipement disponible.",
  },
  {
    question: "Mes données sont-elles en sécurité ?",
    answer:
      "Tes données restent sur ton appareil, en local. Kore ne collecte aucune donnée personnelle et ne nécessite pas de compte pour fonctionner. C\u2019est ton carnet d\u2019entraînement privé.",
  },
  {
    question: "Kore peut-il remplacer un coach sportif ?",
    answer:
      "Kore est un tracker d\u2019entraînement, pas un coach. Il t\u2019aide à structurer tes séances, suivre ta progression et rester régulier. Pour un accompagnement personnalisé (nutrition, technique), un coach reste complémentaire.",
  },
];

export default function FAQSection() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <section id="faq" className="relative z-[2] py-10 sm:py-16 px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-[700px] mx-auto">
        <h2 className="reveal text-center text-3xl sm:text-4xl font-black tracking-tight mb-4">
          Questions fréquentes
        </h2>
        <p className="reveal text-center text-[var(--text-muted)] text-lg mb-14 font-light">
          Tout ce que tu veux savoir sur Kore.
        </p>

        <div className="flex flex-col gap-4">
          {FAQ_ITEMS.map((item) => (
            <details
              key={item.question}
              className="reveal group bg-[var(--bg)] rounded-[20px] shadow-neu-out border border-transparent open:border-[var(--accent-glow)] transition-all duration-300"
            >
              <summary className="flex items-center justify-between gap-4 cursor-pointer p-5 sm:p-6 list-none [&::-webkit-details-marker]:hidden font-semibold text-[var(--text-main)]">
                <span>{item.question}</span>
                <span className="shrink-0 w-8 h-8 rounded-[10px] bg-[var(--bg)] shadow-neu-in flex items-center justify-center transition-transform duration-300 group-open:rotate-180">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    className="text-[var(--text-muted)]"
                  >
                    <path
                      d="M3 5.5L7 9.5L11 5.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </summary>
              <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-[var(--text-muted)] text-sm leading-relaxed">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
