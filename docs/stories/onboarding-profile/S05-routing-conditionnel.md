# S05 — Routing conditionnel

## Description
Diriger l'utilisateur vers OnboardingScreen ou HomeScreen selon `onboarding_completed`.

## Tâches techniques
- [ ] `navigation/index.tsx` : observer User pour déterminer l'écran initial
- [ ] Si `onboarding_completed === false` → initialRouteName = 'Onboarding'
- [ ] Si `onboarding_completed === true` → initialRouteName = 'Home'
- [ ] Attendre résolution avant premier rendu (pas de flash)
- [ ] Ajouter `Stack.Screen name="Onboarding"` avec `headerShown: false`
- [ ] Ajouter 'Onboarding' au `RootStackParamList`

## Critères d'acceptation
- [ ] Premier lancement → OnboardingScreen
- [ ] Lancement suivant → HomeScreen directement
- [ ] Pas de flash d'écran blanc
- [ ] Navigation fluide après onboarding (replace, pas push)
