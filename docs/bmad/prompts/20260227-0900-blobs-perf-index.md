<!-- v1.0 — 2026-02-27 -->
# Prompt — blobs-perf — 20260227-0900

## Demande originale
Dans web/src/components/BackgroundBlobs.tsx, optimise les deux blobs pour réduire le coût de repaint :
remplace blur-[80px] par blur-[60px], ajoute will-change: transform sur chaque blob, réduis opacity de
0.40 à 0.25, et remplace fixed par absolute (le parent devient relative avec overflow-hidden).
Teste que le rendu visuel reste cohérent en light et dark mode.

## Groupes générés

| Groupe | Rapport | Fichiers | Vague | Statut |
|--------|---------|----------|-------|--------|
| A | `docs/bmad/prompts/20260227-0900-blobs-perf-A.md` | `BackgroundBlobs.tsx` | 1 | ⏳ |
| B | `docs/bmad/prompts/20260227-0900-blobs-perf-B.md` | `page.tsx` + `privacy/page.tsx` | 1 | ⏳ |

## Ordre d'exécution
Groupes A et B **indépendants** — lancer en parallèle dans la même vague.

## Vérification finale
- `npx tsc --noEmit` → 0 erreur
- `npm test` → 0 fail
- Inspecter dans le navigateur (dark + light mode) :
  - Blobs plus subtils (opacity 0.25 vs 0.40)
  - Flou légèrement réduit (60px vs 80px, encore diffus)
  - Aucun débordement horizontal des blobs
  - Blobs scrollent avec le contenu (plus fixes à la viewport)
- DevTools → Layers panel → chaque blob dans son propre layer GPU

## Commit suggéré
```
perf(web): optimize BackgroundBlobs — blur 60px, opacity 0.25, will-change, absolute
```
