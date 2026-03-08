# STORY-05 — Lien CGU dans Settings

## Description
Ajouter un item "Conditions d'utilisation" dans la section SYSTÈME de SettingsScreen. Navigue vers LegalScreen.

## Tâches techniques
1. Identifier le composant SettingsAboutSection ou la section SYSTÈME
2. Ajouter un item avec icône + label `t.settings.legal`
3. `onPress` → `navigation.navigate('Legal')`

## Critères d'acceptation
- [ ] Item visible dans la section SYSTÈME
- [ ] Tap → ouvre LegalScreen
- [ ] Texte traduit FR/EN
- [ ] `npx tsc --noEmit` → 0 erreur

## Estimation
XS (< 30 min)

## Dépendances
- STORY-04 (LegalScreen + route)
