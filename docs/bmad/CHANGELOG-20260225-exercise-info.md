# Changelog — Exercise Info — 2026-02-25

## Resume
Systeme de fiches d'exercice avec description textuelle et placeholder animation, accessibles d'un tap pendant la seance et dans la bibliotheque d'exercices.

## Decisions cles
- **Format : Placeholder (option D)** — Structure complete prete pour les vrais assets (Lottie/GIF/SVG) plus tard
- **30 exercices de base** couverts avec descriptions francaises
- **BottomSheet** via Portal (pas de Modal natif — Fabric crash)
- **Schema v21** — migration addColumns non-destructive
- **Seed idempotent** — ne re-ecrit pas les descriptions si deja presentes

## Stories implementees
| Story | Statut | Description |
|-------|--------|-------------|
| STORY-01 | ✅ | Schema v21 (animation_key + description) |
| STORY-02 | ✅ | 30 descriptions exercices + seed |
| STORY-03 | ✅ | Composant ExerciseInfoSheet |
| STORY-04 | ✅ | Bouton info en seance |
| STORY-05 | ✅ | Bouton info en bibliotheque |

## Resultat QA
- TypeScript : 0 erreur
- Tests : 1186 passed, 0 failed, 66 suites
- 0 regression
- 5/5 criteres d'acceptation valides
