<!-- v1.0 — 2026-02-21 -->
# Prompt — keyboard-flicker-rename — 20260221-1106

## Demande originale
Corriger le flickering clavier lors du renommage d'un programme :
clic sur 3 points → Renommer → la modale s'ouvre mais le clavier s'ouvre/ferme/rouvre.

## Cause racine identifiée
`HomeScreen.tsx:284` — BottomSheet fermeture (200ms) + CustomModal ouverture (autoFocus)
lancés simultanément → layout shift Android → keyboard dismiss → re-trigger autoFocus.

## Options analysées
| Option | Approche | Choix |
|--------|----------|-------|
| A (retenu) | `InteractionManager.runAfterInteractions` | ✅ Recommandé |
| B | `setTimeout(250ms)` + ref cleanup | Possible mais magic number |
| C | `onAnimationComplete` callback dans CustomModal | Propre mais 2 fichiers |

## Groupes générés
| Groupe | Rapport | Fichiers | Vague | Statut |
|--------|---------|----------|-------|--------|
| A | 20260221-1106-keyboard-flicker-rename-A.md | HomeScreen.tsx | 1 | ⏳ |

## Ordre d'exécution
Un seul groupe — aucune dépendance.
