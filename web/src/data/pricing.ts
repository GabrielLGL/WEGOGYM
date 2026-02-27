export interface PricingPlan {
  name: string;
  price: string;
  period: string;
  badge?: string;
  features: string[];
  cta: string;
  highlighted: boolean;
}

export const PRICING: PricingPlan[] = [
  {
    name: "Gratuit",
    price: "0€",
    period: "",
    features: [
      "3 programmes",
      "Suivi des performances",
      "Historique 30 jours",
      "Mode offline",
    ],
    cta: "Commencer gratuitement",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "2,50€",
    period: "/mois",
    features: [
      "Programmes illimités",
      "Suivi des performances",
      "Historique illimité",
      "Mode offline",
      "Statistiques avancées",
      "Export de données",
      "Support prioritaire",
    ],
    cta: "Rejoindre la beta",
    highlighted: true,
  },
  {
    name: "Pro Annuel",
    price: "19,99€",
    period: "/an",
    badge: "soit 1,67€/mois",
    features: [
      "Tout le plan Pro",
      "2 mois offerts",
      "Accès aux nouveautés en avant-première",
    ],
    cta: "Rejoindre la beta",
    highlighted: false,
  },
];
