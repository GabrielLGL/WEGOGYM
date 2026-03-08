# STORY-03 — Onboarding step 0 disclaimer

## Description
Ajouter un step 0 "Avertissement santé" dans OnboardingScreen. Affiche le disclaimer, un lien vers les CGU, et un bouton "Je certifie avoir lu et approuvé les CGU". Persiste `disclaimer_accepted = true` et `cgu_version_accepted = CGU_VERSION` en DB.

## Tâches techniques
1. `OnboardingScreen.tsx` : passer de 3 steps (0-2) à 4 steps (0-3)
2. Step 0 : texte disclaimer + lien CGU (navigation vers LegalScreen) + bouton acceptation
3. Dots : 4 au lieu de 3
4. `handleAcceptDisclaimer()` : sauvegarde en DB via `database.write()`
5. Support du mode `disclaimerOnly` : si user existant revoit le disclaimer (CGU update), après acceptation → retour Home

## Critères d'acceptation
- [ ] Step 0 affiché avant le choix de langue
- [ ] Lien CGU ouvre LegalScreen
- [ ] Bouton "Je certifie avoir lu et approuvé les CGU" sauvegarde en DB
- [ ] 4 dots de progression
- [ ] Mode disclaimerOnly fonctionne (retour Home après acceptation)
- [ ] `npx tsc --noEmit` → 0 erreur

## Estimation
M (1-2h)

## Dépendances
- STORY-01 (schema + model)
- STORY-02 (textes i18n)
