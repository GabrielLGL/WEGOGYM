<!-- v1.0 — 2026-02-27 -->
# Prompt — privacy-rgpd — 20260227-0030

## Demande originale
faisons la Politique de confidentialité + RGPD de la landing page

## Analyse
La landing page Kore (`web/`) collecte des emails + prénoms (Supabase + Resend). Une page RGPD est obligatoire. Deux groupes indépendants : création de la nouvelle page, et mise à jour des fichiers existants.

## Groupes générés

| Groupe | Rapport | Fichiers | Vague | Statut |
|--------|---------|----------|-------|--------|
| A | `docs/bmad/prompts/20260227-0030-privacy-rgpd-A.md` | `web/src/app/privacy/page.tsx` (NOUVEAU) | 1 | ⏳ |
| B | `docs/bmad/prompts/20260227-0030-privacy-rgpd-B.md` | `web/src/app/page.tsx` + `web/src/app/sitemap.ts` | 1 | ⏳ |

## Ordre d'exécution
Les deux groupes sont **indépendants** (fichiers distincts) — lancer en parallèle dans la même vague.

## Commandes

```
⚡ Vague 1 — lancer en PARALLÈLE :

Groupe A — Nouvelle page /privacy :
/do docs/bmad/prompts/20260227-0030-privacy-rgpd-A.md

Groupe B — Footer + sitemap :
/do docs/bmad/prompts/20260227-0030-privacy-rgpd-B.md
```

## Vérification finale (après les deux groupes)
- `cd web && npx tsc --noEmit` → 0 erreur
- `npm test` → 0 fail
- `http://localhost:3000/privacy` → page s'affiche, dark/light OK
- Footer → lien "Confidentialite" visible et cliquable
- Sous le formulaire → mention "Politique de confidentialite" avec lien
- `http://localhost:3000/sitemap.xml` → contient `/privacy`
