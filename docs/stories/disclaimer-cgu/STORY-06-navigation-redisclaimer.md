# STORY-06 — Navigation re-disclaimer (CGU version check)

## Description
Modifier la logique de routage initial dans navigation/index.tsx. Si l'utilisateur a un `cgu_version_accepted` inférieur à `CGU_VERSION`, rediriger vers l'onboarding en mode disclaimerOnly.

## Tâches techniques
1. `navigation/index.tsx` : modifier le useEffect de routage initial
2. Logique : si `user.cguVersionAccepted < CGU_VERSION` → route Onboarding avec param `disclaimerOnly: true`
3. Ajouter `disclaimerOnly` aux params de la route Onboarding dans RootStackParamList
4. OnboardingScreen lit ce param et n'affiche que le step 0

## Critères d'acceptation
- [ ] User existant avec CGU outdated → voit le step 0
- [ ] Après acceptation → retour Home (pas d'onboarding complet)
- [ ] User existant avec CGU à jour → accès direct Home
- [ ] Nouveau user → onboarding complet (4 steps)
- [ ] `npx tsc --noEmit` → 0 erreur

## Estimation
S (< 1h)

## Dépendances
- STORY-01 (schema)
- STORY-03 (onboarding step 0 avec mode disclaimerOnly)
