# REFACTOR(web) — Réécrire page.tsx pour utiliser les sections
Date : 2026-02-27 03:30

## Instruction
docs/bmad/prompts/20260227-0300-refactor-page-C.md

## Rapport source
docs/bmad/prompts/20260227-0300-refactor-page-C.md

## Classification
Type : refactor
Fichiers modifiés :
- web/src/app/page.tsx (réécrit)

## Ce qui a été fait
- Remplacé 473 lignes par 73 lignes (réduction 85%)
- Supprimé : constantes FEATURES/PRICING, navVisible state + useEffect, tout le JSX inline des sections, imports KoreLogo/SocialProof
- Conservé : state email/name/status, handleSubmit, wrapper div, BackgroundBlobs/ThemeToggle/ScrollReveal, skip-link accessibilité
- Importé et utilisé : HeroSection, FeaturesSection, PricingSection, SubscribeSection, FooterSection
- Props passées à HeroSection : email, name, status, setEmail, setName, onSubmit (adaptation vs rapport initial — HeroSection a un formulaire inline)
- Props passées à SubscribeSection : email, name, status, setEmail, setName, onSubmit
- Conservé overflow-hidden sur le wrapper div (présent dans la version actuelle, omis dans le template du rapport)

## Vérification
- TypeScript : ✅ npx tsc --noEmit — zéro erreur
- Tests : ⚠️ 6 failed — ÉCHECS PRÉ-EXISTANTS identiques avant/après le refactor
  - SocialProof non mocké dans page.test.tsx → fetch /api/subscribers-count non mocké
  - Deux inputs email (hero-email + subscribe-email) → getByLabelText(/adresse email/i) ambigu
  - Ces échecs étaient présents avant Group C et ne sont pas causés par ce groupe
- Nouveau test créé : non

## Documentation mise à jour
aucune

## Statut
✅ Résolu — 20260227-0330

## Commit
[sera rempli]
