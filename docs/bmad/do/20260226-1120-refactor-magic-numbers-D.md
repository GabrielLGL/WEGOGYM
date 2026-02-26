# refactor(theme) — Magic numbers → constantes fontSize/borderRadius — Groupe D
Date : 2026-02-26 11:20

## Instruction
docs/bmad/prompts/20260226-1120-magic-numbers-D.md

## Rapport source
docs/bmad/prompts/20260226-1120-magic-numbers-D.md (description directe)

## Classification
Type : refactor
Fichiers modifiés :
- `mobile/src/theme/index.ts`
- `mobile/src/screens/ExercisesScreen.tsx`
- `mobile/src/screens/SessionDetailScreen.tsx`
- `mobile/src/screens/ProgramsScreen.tsx`
- `mobile/src/screens/ChartsScreen.tsx`
- `mobile/src/screens/SettingsScreen.tsx`
- `mobile/src/screens/StatsCalendarScreen.tsx`
- `mobile/src/screens/StatsMeasurementsScreen.tsx`
- `mobile/src/screens/HomeScreen.tsx`
- `mobile/src/screens/StatsScreen.tsx`
- `mobile/src/screens/AssistantScreen.tsx`
- `mobile/src/components/BadgeCard.tsx`
- `mobile/src/components/BadgeCelebration.tsx`
- `mobile/src/components/ErrorBoundary.tsx`
- `mobile/src/components/MilestoneCelebration.tsx`
- `mobile/src/components/SessionExerciseItem.tsx`
- `CLAUDE.md` (section 4.4 mise à jour)

## Ce qui a été fait

### Nouvelles constantes ajoutées à `theme/index.ts`
| Constante | Valeur | Seuil | Fichiers |
|-----------|--------|-------|---------|
| `fontSize.caption` | 11 | 4 fichiers | SettingsScreen, StatsCalendarScreen, ChartsScreen, SessionExerciseItem |
| `fontSize.bodyMd` | 15 | 3 fichiers | ExercisesScreen, ChartsScreen, ProgramsScreen |
| `fontSize.jumbo` | 48 | 3 fichiers | BadgeCelebration, ErrorBoundary, MilestoneCelebration |

### Constantes laissées en dur (seuil non atteint)
- `fontSize: 13` → 2 fichiers seulement (ExercisesScreen, ChartsScreen)
- `fontSize: 17` → 2 fichiers (ExercisesScreen, ProgramsScreen)
- `fontSize: 22` → 1 fichier (ProgramsScreen)
- `fontSize: 26` → 1 fichier (AssistantScreen)
- `borderRadius: 10` → 1 fichier (ProgramsScreen)
- `borderRadius: 16` → hors StyleSheet.create() ou 1 fichier

### Remplacements fontSize avec match exact
- `fontSize: 12` → `fontSize.xs`
- `fontSize: 14` → `fontSize.sm`
- `fontSize: 16` → `fontSize.md`
- `fontSize: 18` → `fontSize.lg`
- `fontSize: 20` → `fontSize.xl`
- `fontSize: 24` → `fontSize.xxl`
- `fontSize: 28` → `fontSize.xxxl`

### Remplacements borderRadius avec match exact
- `borderRadius: 8` → `borderRadius.sm`
- `borderRadius: 12` → `borderRadius.md`
- `borderRadius: 20` → `borderRadius.lg`

### Imports mis à jour
Les fichiers `ExercisesScreen`, `SessionDetailScreen`, `ProgramsScreen`, `ChartsScreen` importaient uniquement `{ colors }` — mis à jour vers `{ colors, fontSize, borderRadius }`.

## Vérification
- TypeScript : ✅ zéro nouvelle erreur (21 erreurs pré-existantes dans test et statsHelpers, non liées)
- Tests : ✅ 194 passed (13 suites) — 0 failed
- Nouveau test créé : non (refactor style uniquement, pas de logique métier)

## Documentation mise à jour
- `CLAUDE.md` section 4.4 — ajout ligne FontSize avec toutes les constantes (y compris caption, bodyMd, jumbo)
- `CLAUDE.md` section 4.4 — correction borderRadius (xl ajouté, valeurs précisées)

## Statut
✅ Résolu — 20260226-1145

## Commit
`62bc142` refactor(theme): magic numbers → fontSize/borderRadius constants — groupe D
