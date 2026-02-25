# feat(onboarding) — Onboarding personnalisé (niveau + objectif)
Date : 2026-02-25

## Stories
- S01 : Schema v20 (user_level, user_goal sur users + equipment, frequency sur programs)
- S02 : Constantes et types (UserLevel, UserGoal, labels FR, descriptions)
- S03 : Composant OnboardingCard réutilisable
- S04 : OnboardingScreen (2 steps non-skippable)
- S05 : Routing conditionnel (onboarding_completed → Home ou Onboarding)
- S06 : Reconfiguration dans Settings (section Mon profil)

## Fichiers créés
- `mobile/src/components/OnboardingCard.tsx`
- `mobile/src/screens/OnboardingScreen.tsx`
- `docs/stories/onboarding-profile/` (6 stories + overview)
- `docs/bmad/01-brainstorm.md` → `05-ux-design.md`

## Fichiers modifiés
- `mobile/src/model/schema.ts` — v19 → v20, +4 colonnes (2 users, 2 programs)
- `mobile/src/model/models/User.ts` — +userLevel, +userGoal
- `mobile/src/model/models/Program.ts` — +equipment, +frequency
- `mobile/src/model/constants.ts` — +types, +labels, +descriptions
- `mobile/src/navigation/index.tsx` — +routing conditionnel, +OnboardingScreen
- `mobile/src/screens/SettingsScreen.tsx` — +section Mon profil (niveau + objectif)

## Ce qui a été fait
1. Migration schema v20 : ajout colonnes profil (users) et programme (programs)
2. Types TypeScript stricts (UserLevel, UserGoal, ProgramEquipment)
3. Labels et descriptions en français pour l'UI
4. Composant OnboardingCard réutilisable (sélection visuelle avec haptic)
5. Écran OnboardingScreen en 2 étapes obligatoires avec progress dots
6. Texte explicatif sous chaque question ("Influence la difficulté...")
7. Routing conditionnel : observe User au lancement, redirige vers Onboarding ou Home
8. Section Mon profil dans Settings avec modification via OnboardingCards
9. Toast post-onboarding "Pour modifier, rendez-vous dans Paramètres"

## Vérification
- TypeScript : ✅ 0 erreur
- Tests : ✅ 1172 passed, 0 failed
- Critères d'acceptation : ✅ tous satisfaits
