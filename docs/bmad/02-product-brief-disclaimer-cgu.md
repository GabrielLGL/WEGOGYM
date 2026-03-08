# Product Brief — Disclaimer santé + CGU — 2026-03-08

## Problème
Kore propose des programmes d'entraînement et des suggestions IA sans aucune protection juridique. Si un utilisateur se blesse, l'éditeur est exposé.

## Solution
1. **Step 0 de l'onboarding** : écran disclaimer santé + acceptation CGU (bloquant)
2. **Page CGU dans Settings** : texte complet consultable à tout moment

## Utilisateurs cibles
Tous les utilisateurs, dès le premier lancement.

## Métriques de succès
- 100% des utilisateurs voient le disclaimer avant d'accéder à l'app
- CGU accessibles en < 2 taps depuis Settings
- `disclaimer_accepted = true` persisté en DB

## Texte disclaimer (step 0)
> Kore est un outil de suivi d'entraînement. Les programmes et suggestions proposés ne constituent pas un avis médical. Consultez un professionnel de santé avant de commencer ou modifier un programme d'exercice physique. Vous êtes seul responsable de votre pratique sportive. En continuant, vous acceptez les Conditions Générales d'Utilisation.

## Texte CGU (page Settings) — sections
1. Objet — Kore est une app de suivi de musculation
2. Acceptation — L'utilisation implique l'acceptation des CGU
3. Avertissement santé — Pas un avis médical, consulter un professionnel
4. Responsabilité — L'éditeur décline toute responsabilité en cas de blessure
5. Données — Données stockées localement, aucune collecte serveur
6. Propriété intellectuelle — L'app et son contenu appartiennent à l'éditeur
7. Modification — Les CGU peuvent être modifiées à tout moment
8. Contact — Adresse email de contact

## Décisions techniques
- Boolean simple `disclaimer_accepted` dans `users` (pas de versioning)
- Migration schéma v32 → v33
- Texte en dur dans i18n (offline-first, pas de WebView)
- Onboarding : 4 steps (disclaimer → langue → niveau → objectif)
