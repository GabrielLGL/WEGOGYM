# Brainstorm — Disclaimer santé + CGU — 2026-03-08

## Idée reformulée
En tant qu'utilisateur, je vois un disclaimer santé obligatoire au premier lancement (step 0 de l'onboarding) et je peux relire les CGU depuis les réglages.

## Persona cible
Tous (débutant, intermédiaire, avancé) — obligation légale, pas une feature ciblée.

## Idées explorées
1. Écran disclaimer dédié AVANT l'onboarding (step 0 bloquant)
2. Disclaimer intégré DANS l'onboarding comme step supplémentaire
3. Checkbox "J'accepte les CGU" sur le dernier step de l'onboarding
4. BottomSheet disclaimer au premier lancement (overlay)
5. Page CGU accessible dans Settings (texte scrollable)
6. Page CGU dans un WebView (lien externe)
7. CGU stockées en dur dans l'app (offline-first = pas de WebView)
8. Disclaimer court + lien "Lire les CGU complètes"
9. Persister `disclaimer_accepted: true` dans la table `users`
10. Empêcher l'accès à l'app tant que le disclaimer n'est pas accepté
11. Avertissement santé récurrent avant chaque séance (trop intrusif)
12. Badge/lien CGU dans le footer de SettingsScreen
13. Version des CGU (pour re-demander acceptation si elles changent)

## Top 5 Insights
1. **Disclaimer bloquant step 0** — L'utilisateur DOIT accepter avant l'onboarding | Risque : friction UX, mais juridiquement nécessaire
2. **Intégrer dans l'onboarding** — Ajouter step 0 "Santé & CGU" avant le choix de langue | Risque : onboarding 4 steps au lieu de 3
3. **CGU en dur dans l'app** — Texte statique, pas de WebView (offline-first) | Risque : mise à jour = nouvelle version de l'app
4. **Persister l'acceptation en DB** — Champ `disclaimer_accepted` boolean dans `users` | Risque : migration schéma v33
5. **Page CGU dans Settings** — Texte scrollable accessible depuis les réglages | Risque : aucun

## Décisions prises
- Step 0 dans l'onboarding (avant la langue)
- Boolean simple `disclaimer_accepted` (pas de versioning CGU)
- Template de texte générique adapté à l'app (non juridiquement validé)
- CGU en dur dans l'app (offline-first)

## Contraintes techniques identifiées
- Migration schéma v32 → v33 (ajout colonne `disclaimer_accepted` dans `users`)
- Onboarding passe de 3 à 4 steps (dots + navigation)
- Texte CGU + disclaimer dans les fichiers i18n (fr.ts + en.ts)

## Prêt pour Phase 2 ?
OUI
