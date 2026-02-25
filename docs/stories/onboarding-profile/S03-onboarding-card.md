# S03 — Composant OnboardingCard

## Description
Composant réutilisable de card de sélection pour l'onboarding et les settings.

## Tâches techniques
- [ ] `components/OnboardingCard.tsx` : props `label`, `description?`, `selected`, `onPress`
- [ ] Style : fond `colors.card`, border `#3A3A3C` / `colors.primary` si selected
- [ ] Haptic feedback `onSelect` au tap
- [ ] Animation scale subtile à la sélection
- [ ] Tests `components/__tests__/OnboardingCard.test.tsx`

## Critères d'acceptation
- [ ] Card affiche label + description
- [ ] État sélectionné visuellement distinct (border primary 2px)
- [ ] Haptic au tap
- [ ] Tests passent
