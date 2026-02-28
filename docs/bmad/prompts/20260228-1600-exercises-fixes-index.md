# exercises-fixes — 20260228-1600

## Index des rapports

| Fichier | Contenu |
|---------|---------|
| `20260228-1600-exercises-fixes-A.md` | Groupe A — Correctifs rapides ExercisesScreen.tsx |
| `20260228-1600-exercises-fixes-B.md` | Groupe B — CreateExerciseScreen + navigation + tests |

## Résumé

**Statut : ✅ DONE — TypeScript clean, 20/20 tests pass**

### Changements effectués

1. **Couleur bouton** — `colors.text` → `colors.primaryText` dans `addButtonText`
2. **Bouton ••• masqué** pour exercices pré-installés (`{item.isCustom && ...}`)
3. **Option Modifier** masquée dans BottomSheet pour exercices non-custom (`{selectedExercise?.isCustom && ...}`)
4. **CreateExerciseScreen** créé (`mobile/src/screens/CreateExerciseScreen.tsx`)
5. **Navigation** — `CreateExercise` ajouté à `RootStackParamList` + enregistré dans le Stack
6. **ExercisesScreen** — bouton navigue vers `CreateExercise`, modal de création supprimée
7. **i18n** — `descriptionLabel` + `descriptionPlaceholder` ajoutés à fr.ts + en.ts
8. **Tests** — `ExercisesScreen.test.tsx` mis à jour (20 tests, tous passent)
