# S04 — OnboardingScreen (2 steps)

## Description
Écran multi-steps : step 1 (niveau) → step 2 (objectif) → sauvegarde dans User → redirect Home.

## Tâches techniques
- [ ] `screens/OnboardingScreen.tsx` : state `step`, `selectedLevel`, `selectedGoal`
- [ ] Step 1 : titre, texte explicatif, 3 OnboardingCards (niveau), bouton Suivant
- [ ] Step 2 : titre, texte explicatif, 4 OnboardingCards (objectif), bouton Confirmer, bouton retour
- [ ] Progress dots (● ○ / ○ ●)
- [ ] Persistance : `database.write()` → update user (level, goal, onboarding_completed=true)
- [ ] Haptics : `onSelect` (cards), `onPress` (suivant), `onSuccess` (confirmer)
- [ ] Redirect : `navigation.replace('Home')`
- [ ] Toast : "Pour modifier vos préférences, rendez-vous dans Paramètres"
- [ ] Non-skippable : boutons disabled tant que pas de sélection
- [ ] Tests `screens/__tests__/OnboardingScreen.test.tsx`

## Critères d'acceptation
- [ ] 2 steps fonctionnels avec navigation avant/arrière
- [ ] Texte explicatif visible sur chaque step
- [ ] Sauvegarde dans User correcte
- [ ] Redirect vers Home après validation
- [ ] Toast affiché
- [ ] Non-skippable
