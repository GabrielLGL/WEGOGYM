<!-- v1.0 — 2026-02-28 -->
# Prompt — fix-stats-duration — 20260228-1400

## Demande originale
Quand l'utilisateur fait une séance et la valide (appuie sur "Terminer"),
elle n'apparaît pas dans StatsDurationScreen ("Durée des séances").

## Analyse
| Champ | Valeur |
|---|---|
| Type | Bug fix |
| Commande suggérée | `/do` |
| Parallélisation | Non nécessaire (flux unique workout→stats) |

## Groupes générés
| Groupe | Rapport | Fichiers | Vague | Statut |
|--------|---------|----------|-------|--------|
| A | 20260228-1400-fix-stats-duration-A.md | WorkoutScreen.tsx, StatsDurationScreen.tsx, statsDuration.ts | 1 | ✅ |

## Ordre d'exécution
Groupe unique — pas de dépendances inter-groupes.

## Résultat
Fix appliqué le 2026-02-28. TSC 0 erreur, 37 tests passés.
Rapport détaillé : `docs/bmad/do/20260228-1400-fix-stats-duration.md`
