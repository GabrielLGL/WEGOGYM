# REFACTOR(theme) — Magic numbers → constantes theme
Date : 2026-02-26 12:00

## Instruction
docs/bmad/verrif/20260226-0938/RAPPORT.md (Groupe D)

## Rapport source
docs/bmad/verrif/20260226-0938/RAPPORT.md

## Classification
Type : refactor
Fichiers modifiés :
- mobile/src/screens/ExercisesScreen.tsx
- mobile/src/screens/ProgramsScreen.tsx
- mobile/src/screens/SessionDetailScreen.tsx
- mobile/src/screens/StatsScreen.tsx

## Ce qui a été fait
Remplacement des valeurs numériques hardcodées dans `StyleSheet.create()` par les constantes du theme lorsqu'elles ont une correspondance exacte :

**ExercisesScreen.tsx :**
- Import : ajout de `spacing` dans l'import theme
- `padding: 16` → `spacing.md` (addButton)
- `paddingVertical: 8` → `spacing.sm` (chip)
- `paddingHorizontal: 12` → `spacing.ms` (chip)
- `marginRight: 8` → `spacing.sm` (chip)
- `marginBottom: 8` → `spacing.sm` (chip)

**ProgramsScreen.tsx :**
- Import : ajout de `spacing` dans l'import theme
- `padding: 16` → `spacing.md` (bigButton)
- `padding: 12` → `spacing.ms` (input modal)
- `paddingVertical: 16` → `spacing.md` (sheetOption)

**SessionDetailScreen.tsx :**
- Import : ajout de `spacing` dans l'import theme
- `padding: 12` → `spacing.ms` (confirmBtn et cancelBtn)

**StatsScreen.tsx :**
- `height: 32` → `spacing.xl` (kpiSeparator)

Note : les fichiers avaient déjà été partiellement refactorisés lors d'un run précédent (fontSize.*, borderRadius.* déjà convertis). Seuls les spacing.* manquants ont été complétés. Les valeurs sans correspondance exacte (15, 17, 18, 20, 45, 50, 70, 85, 120...) ont été laissées intentionnellement en raw numbers.

## Vérification
- TypeScript : ✅ 0 erreur
- Tests : ✅ 1206 passed, 67 suites, 0 failed
- Nouveau test créé : non (pas de logique métier modifiée)

## Documentation mise à jour
aucune

## Statut
✅ Résolu — 20260226-1200

## Commit
ab8ea32 refactor(theme): magic numbers → spacing constants in screens
