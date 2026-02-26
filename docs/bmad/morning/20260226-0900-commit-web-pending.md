# Rapport — Commit web/ changements en attente — 2026-02-26

## Problème
3 fichiers web/ sont modifiés (non staged) depuis plusieurs jours + fichiers non trackés :
- `web/src/app/api/subscribe/route.ts` — API route d'abonnement email
- `web/src/app/layout.tsx` — Layout principal Next.js
- `web/src/emails/welcome.tsx` — Email de bienvenue React Email
- `.gitignore` — modifications non stagées
- `.vercelignore` — fichier non tracké
- `docs/bmad/git-history/20260225-2130.md` — rapport git non commité

## Fichiers concernés
- web/src/app/api/subscribe/route.ts
- web/src/app/layout.tsx
- web/src/emails/welcome.tsx
- .gitignore
- .vercelignore
- docs/bmad/git-history/20260225-2130.md

## Commande à lancer
/do docs/bmad/morning/20260226-0900-commit-web-pending.md

## Contexte
- Lire chaque fichier modifié pour comprendre la nature des changements avant de commit
- Respecter git safety : `git add` uniquement les fichiers concernés (pas de `git add .`)
- Vérifier `.gitignore` : les temp files `mobile/jest_result.txt` et `mobile/tsc_result.txt` devraient y être ajoutés
- Convention commit : `feat(web): ...` ou `fix(web): ...` selon contenu

## Critères de validation
- `git status` propre (tous les fichiers concernés committés)
- `git push origin main` OK
- Pas de fichiers temp (jest_result.txt, tsc_result.txt) committés par erreur

## Statut
⏳ En attente
