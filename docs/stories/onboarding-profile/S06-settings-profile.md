# S06 — Reconfiguration dans Settings

## Description
Section "Mon profil" dans SettingsScreen pour modifier niveau et objectif.

## Tâches techniques
- [ ] `screens/SettingsScreen.tsx` : section "Mon profil"
- [ ] Affichage niveau + objectif actuels (labels français)
- [ ] Tap → expandable avec OnboardingCards
- [ ] Sauvegarde immédiate via `database.write()`
- [ ] Haptic `onSuccess` après sauvegarde
- [ ] User observé via `withObservables`

## Critères d'acceptation
- [ ] Niveau et objectif affichés avec labels français
- [ ] Modification possible via cards
- [ ] Sauvegarde persistée immédiatement
- [ ] Valeurs cohérentes après relancement
