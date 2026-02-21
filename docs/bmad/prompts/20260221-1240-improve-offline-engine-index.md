<!-- v1.0 — 2026-02-21 -->
# Prompt — Amélioration offline engine — 20260221-1240

## Demande originale
"maintenant améliore l'offline engine"

## Contexte
Suite à la suppression des providers cloud (chore f97c40b), l'offline engine est maintenant le seul provider actif pour tous les utilisateurs. Il doit être de qualité satisfaisante.

## Analyse de l'engine actuel
Forces déjà en place :
- Sélection compound-first ✅
- Filtre par niveau (minLevel) ✅
- PR-based weight suggestions ✅
- Focus muscle (+1 série) ✅
- Évitement répétition exercices (usedNames) ✅
- Splits configurables (PPL, brosplit, arnold, etc.) ✅

Manques identifiés (impact élevé) :
- `context.recentMuscles` reçu mais **jamais utilisé** ← principal manque
- Goal `cardio` ne sélectionne pas d'exercices cardio réels
- Noms de séances (mode session) sans indication du goal

## Groupes générés
| Groupe | Rapport | Fichiers | Vague | Statut |
|--------|---------|----------|-------|--------|
| A | 20260221-1240-improve-offline-engine-A.md | offlineEngine.ts | 1 | ⏳ |

## Ordre d'exécution
Un seul groupe. Pas de dépendances.
