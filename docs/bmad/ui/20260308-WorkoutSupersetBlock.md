# UI Review — WorkoutScreen Superset Block — 20260308

## Diagnostic
| # | Probleme | Severite | Statut |
|---|----------|----------|--------|
| 1 | Superset = cartes separees, pas de lien visuel clair | :red_circle: | Corrige |
| 2 | Header superset trop discret (fine ligne 1px) | :yellow_circle: | Corrige |
| 3 | Pas d'indication "pas de repos" entre exos groupes | :yellow_circle: | Corrige |
| 4 | Series non interleaved — UX confuse pour supersets | :red_circle: | Corrige |

## Solution implementee — SupersetBlock

Nouveau composant `WorkoutSupersetBlock` qui regroupe tout le superset en un seul bloc visuel :

1. **Barre gauche coloree** (4px) — `colors.primary` (superset) ou `colors.warning` (circuit)
2. **Header bandeau** avec icone + label + count
3. **Headers exercices compacts** avec badge lettre (A, B, C...) + nom + objectif + derniere perf
4. **Series interleaved** : Rond 1 → Ex A, Ex B / Rond 2 → Ex A, Ex B / ...
5. **Badge lettre** sur chaque set row pour identifier l'exercice

Les exercices hors superset gardent leur rendu `WorkoutExerciseCard` inchange.

## Fichiers modifies
| Fichier | Modification |
|---------|-------------|
| `components/WorkoutSupersetBlock.tsx` | **NOUVEAU** — bloc superset complet |
| `components/WorkoutExerciseCard.tsx` | Export `WorkoutSetRow` + `WorkoutSetRowProps`, retrait prop `supersetColor` |
| `screens/WorkoutScreen.tsx` | `buildWorkoutList` emet `supersetBlock`, `renderWorkoutItem` rend le bloc |
| `i18n/fr.ts` | Ajout `roundLabel: 'Serie'` |
| `i18n/en.ts` | Ajout `roundLabel: 'Round'` |

## Verification
- TypeScript : OK (0 erreurs)
- Commit : pending
