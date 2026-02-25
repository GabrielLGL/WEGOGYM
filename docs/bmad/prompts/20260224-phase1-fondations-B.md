<!-- v1.0 — 2026-02-24 -->
# Rapport — Phase 1 Fondations — Groupe B — Onboarding personnalise

## Objectif
Creer un onboarding de premiere utilisation en 2 minutes qui configure l'app pour l'utilisateur. Questions: niveau (debutant/intermediaire/avance), objectif (prise de masse/force/recomp/sante), equipement disponible (salle complete/home gym/poids du corps), frequence souhaitee (2-5x/semaine). Les reponses sont stockees dans le modele User et influencent les suggestions de l'app.

## Source
Brainstorming session: `docs/brainstorming/brainstorming-session-2026-02-23.md`
Feature: #91 (Onboarding personnalise)

## Fichiers concernes
- `mobile/src/model/schema.ts` — Ajouter colonnes au modele User (level, goal, equipment, frequency)
- `mobile/src/model/models/User.ts` — Ajouter champs
- `mobile/src/screens/OnboardingScreen.tsx` — Nouveau ecran (ou flow multi-etapes)
- `mobile/src/navigation/index.tsx` — Routing conditionnel (si premier lancement → onboarding)
- `mobile/src/components/` — Composants d'onboarding (selection cards, progress dots)

## Contexte technique
- Stack: React Native Expo 52, TypeScript, WatermelonDB (schema v17)
- Navigation: React Navigation 7 (Native Stack only)
- Modele User = single row preferences, champ `name` existant
- Theme: Dark mode only, utiliser theme/index.ts
- Haptics: utiliser useHaptics() pour feedback selection
- Langue: Francais (fr-FR)
- Pas de Modal natif (Fabric crash) — utiliser Portal si besoin

## Etapes
1. Schema migration: ajouter champs user_level, user_goal, user_equipment, user_frequency, onboarding_completed au modele User
2. Creer le composant OnboardingScreen avec steps (swipeable ou bouton suivant)
3. Chaque step = une question avec selection visuelle (cards avec icones)
4. Stocker les reponses dans User via database.write()
5. Ajouter logique de navigation: si onboarding_completed === false → OnboardingScreen au lieu de HomeScreen
6. Marquer onboarding_completed = true a la fin
7. Optionnel: bouton "Reconfigurer" dans les settings pour relancer

## Contraintes
- Ne pas casser: navigation existante, modele User existant
- Respecter: WatermelonDB patterns, theme, haptics, pas de Modal natif
- L'onboarding doit etre rapide (max 4-5 ecrans)
- Selections doivent etre visuellement claires et attrayantes

## Criteres de validation
- npx tsc --noEmit → zero erreur
- npm test → zero fail
- Premier lancement → onboarding s'affiche
- Reponses persistees dans User
- Apres completion → HomeScreen normal
- Re-lancement de l'app → pas de re-onboarding

## Dependances
Aucune dependance — peut etre fait en parallele des autres groupes.

## Statut
✅ Résolu — 20260225

## Résolution
Rapports do : docs/bmad/do/20260225-feat-onboarding-profile.md
