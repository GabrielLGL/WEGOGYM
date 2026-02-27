<!-- v1.0 — 2026-02-27 -->
# Prompt — shimmer-text LCP optimization — 20260227-0120

## Demande originale
Dans web/src/app/globals.css, optimise l'animation .shimmer-text pour réduire l'impact sur le LCP. Ajoute will-change: background-position sur la classe, passe la durée de 4s à 6s pour réduire la fréquence de repaint, et enveloppe l'animation dans @media (prefers-reduced-motion: no-preference) pour qu'elle soit désactivée par défaut sur les devices qui le demandent.

## Groupes générés
| Groupe | Rapport | Fichiers | Vague | Statut |
|--------|---------|----------|-------|--------|
| A | docs/bmad/prompts/20260227-0120-shimmer-lcp-A.md | web/src/app/globals.css | 1 | ✅ |

## Ordre d'exécution
Groupe unique — pas de dépendance inter-groupes.
