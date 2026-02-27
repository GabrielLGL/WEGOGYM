<!-- v1.0 — 2026-02-27 -->
# Rapport — Refactor page.tsx — Groupe C — 20260227-0300

## Objectif
Mettre à jour `web/src/app/page.tsx` pour importer et utiliser les sections créées par les Groupes A et B. Supprimer le code extrait, garder uniquement le state et la logique de soumission.

## Fichiers concernés
- **Modifier** : `web/src/app/page.tsx`

## Contexte technique
- Projet : Next.js 14 (App Router) + TypeScript strict
- Ce fichier doit rester `"use client"` (il gère le state email/name/status)
- Styling : Tailwind CSS
- Composants existants conservés : `BackgroundBlobs`, `ThemeToggle`, `ScrollReveal`

## État actuel de page.tsx (avant ce groupe)
Le fichier contient actuellement ~410 lignes avec TOUT le code inline.
Les Groupes A et B ont créé ces nouveaux fichiers :
- `web/src/data/features.ts` — FEATURES
- `web/src/data/pricing.ts` — PRICING
- `web/src/components/sections/HeroSection.tsx` — nav + hero (navVisible interne)
- `web/src/components/sections/FeaturesSection.tsx`
- `web/src/components/sections/PricingSection.tsx`
- `web/src/components/sections/SubscribeSection.tsx` — props: email, name, status, setEmail, setName, onSubmit
- `web/src/components/sections/FooterSection.tsx`

## Résultat attendu de page.tsx

```tsx
"use client";

import { useState } from "react";
import BackgroundBlobs from "@/components/BackgroundBlobs";
import ThemeToggle from "@/components/ThemeToggle";
import ScrollReveal from "@/components/ScrollReveal";
import HeroSection from "@/components/sections/HeroSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import PricingSection from "@/components/sections/PricingSection";
import SubscribeSection from "@/components/sections/SubscribeSection";
import FooterSection from "@/components/sections/FooterSection";

export default function Home() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });

      if (res.ok) {
        setStatus("success");
        setEmail("");
        setName("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen relative">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:bg-[var(--accent)] focus:text-white focus:px-4 focus:py-2 focus:rounded-lg">
        Aller au contenu principal
      </a>
      <BackgroundBlobs />
      <ThemeToggle />
      <ScrollReveal />

      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <SubscribeSection
        email={email}
        name={name}
        status={status}
        setEmail={setEmail}
        setName={setName}
        onSubmit={handleSubmit}
      />
      <FooterSection />
    </div>
  );
}
```

## Étapes
1. Lire `web/src/app/page.tsx` pour confirmer l'état actuel
2. Réécrire le fichier avec le contenu ci-dessus (remplacer complètement)
3. Vérifier `cd web && npx tsc --noEmit` → zéro erreur

## Ce qui est supprimé de page.tsx
- Import de `KoreLogo` (maintenant dans HeroSection et FooterSection)
- Les constantes `FEATURES` et `PRICING` (maintenant dans data/)
- Le `navVisible` state et son `useEffect` (maintenant dans HeroSection)
- Tout le JSX inline des sections (maintenant dans leurs composants respectifs)

## Ce qui reste dans page.tsx
- `useState` pour email, name, status
- La fonction `handleSubmit`
- Le wrapper `<div className="min-h-screen relative">` avec les composants globaux
- L'import et l'utilisation des sections

## Contraintes
- Ne PAS modifier les fichiers des Groupes A et B
- TypeScript strict — pas de `any`
- Le rendu final doit être **identique** au rendu actuel (même HTML généré)
- Les tests existants (`page.test.tsx`) doivent continuer à passer sans modification

## Critères de validation
- `cd web && npx tsc --noEmit` → zéro erreur
- `cd web && npm test` → tous les tests passent (notamment les tests du formulaire d'inscription)
- Le fichier page.tsx fait moins de 60 lignes

## Dépendances
**Dépend de** : Groupe A (data/ + FeaturesSection + PricingSection) et Groupe B (HeroSection + FooterSection + SubscribeSection)
→ Lancer UNIQUEMENT après que les Groupes A et B soient terminés.

## Statut
✅ Résolu — 20260227-0330

## Résolution
Rapport do : docs/bmad/do/20260227-0330-refactor-page-C.md
Note : HeroSection reçoit les props de formulaire (email, name, status, setEmail, setName, onSubmit) car page.tsx avait évolué. Le fichier fait 73 lignes (vs objectif <60) — légère différence due aux props supplémentaires.
