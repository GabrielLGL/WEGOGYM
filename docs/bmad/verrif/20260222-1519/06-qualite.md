# Passe 6/8 — Code mort & qualité — 20260222-1519

## Imports inutilisés
| # | Fichier | Import | Sévérité |
|---|---------|--------|----------|
| 1 | `navigation/index.tsx:2` | `useState` importé mais jamais utilisé | 🟡 |
| 2 | `screens/ExercisesScreen.tsx:1` | `useMemo` importé mais jamais utilisé | 🟡 |

## Code mort
| # | Fichier | Fonction | Sévérité |
|---|---------|----------|----------|
| 1 | `model/utils/databaseHelpers.ts:408-444` | `getExerciseStatsFromSets()` — remplacé par `buildExerciseStatsFromData()`, jamais appelé en prod | 🔵 |
| 2 | `hooks/useHaptics.ts:63-65` | `onDrag()` — défini et testé mais jamais appelé | 🔵 |

## `any` TypeScript
✅ Aucun `any` en production. Usage uniquement dans les tests (mocks).

## `console.*` non gardés
✅ Tous les `console.*` sont gardés avec `__DEV__`.

## Valeurs hardcodées (NON couvertes par la passe 3)
| # | Fichier | Problème | Sévérité |
|---|---------|----------|----------|
| 1 | `ChartsScreen.tsx:287-338` | ~30 valeurs numériques brutes (fontSize, padding, borderRadius) | 🟡 |
| 2 | `HomeScreen.tsx:384-457` | ~25 valeurs numériques brutes | 🟡 |
| 3 | `ExercisesScreen.tsx:286-329` | ~20 valeurs numériques brutes | 🟡 |
| 4 | `SessionDetailScreen.tsx:222-236` | ~10 valeurs numériques brutes | 🟡 |
| 5 | `navigation/index.tsx:163-210` | fontSize/height/padding bruts dans tab bar | 🟡 |
| 6 | `AssistantScreen.tsx:789,816` | fontSize: 26 et 28 hors tokens | 🟡 |
| 7 | `SessionExerciseItem.tsx` | padding/fontSize bruts | 🟡 |
| 8 | `ExercisePickerModal.tsx` | padding bruts | 🟡 |
| 9 | `RestTimer.tsx` | borderRadius/fontSize bruts | 🟡 |

Note : Les écrans stats récents utilisent correctement les tokens theme. Les écrans legacy (Charts, Home, Exercises) n'ont jamais été migrés.

## DRY
| # | Fichier | Problème | Sévérité |
|---|---------|----------|----------|
| 1 | `StatsCalendarScreen.tsx:81` | Date key formatting dupliquée vs `toDateKey()` dans `statsHelpers.ts` (non exportée) | 🔵 |

## Résumé
- 🟡 Warnings : 11 (2 imports + 9 fichiers hardcodés)
- 🔵 Suggestions : 3 (2 code mort + 1 DRY)
- ✅ : `any`, `console.*`, naming
