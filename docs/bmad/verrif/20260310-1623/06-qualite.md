# Passe 6/8 — Code mort & qualité

## Issues Found

### 🟡 WARN-1: 10x `any` dans useWorkoutCompletion.test.ts
**Fichier:** `hooks/__tests__/useWorkoutCompletion.test.ts:86,159,171,185,232,270,286,302,317,333`
**Problème:** `let output: any` — 10 occurrences.
**Fix:** Typer avec le type de retour réel du hook.

### 🟡 WARN-2: Module dead code `exerciseDescriptions.ts`
**Fichier:** `model/utils/exerciseDescriptions.ts`
**Problème:** Exporté mais jamais importé en production. Seul son test l'importe.
**Fix:** Intégrer dans seed.ts ou supprimer.

### 🔵 SUGG-1: AnimatedSplash hardcoded colors (justifié — avant ThemeProvider)
### 🔵 SUGG-2-6: Magic numbers (paddingBottom: 150/100, paddingTop: 80, marginBottom: 6, marginTop: 50)
**Fichiers:** `ProgramsScreen.tsx:211`, `ProgramDetailScreen.tsx:289`, `ExerciseCatalogScreen.tsx:623`, `ChartsScreen.tsx:348,352`
### 🔵 SUGG-7: CustomModal useEffect deps (fadeAnim/scaleAnim manquants mais stables via useRef)
### 🔵 SUGG-8-9: Inline icon styles dans ProgramsScreen, hardcoded colors dans test mocks

## Conformités vérifiées
- ✅ Aucun `<Modal>` natif
- ✅ Aucun `@ts-ignore` / `@ts-expect-error`
- ✅ Couleurs production via `colors.*` / `useColors()`
- ✅ fontSize/borderRadius via tokens theme
- ✅ console.* protégé par `__DEV__`
- ✅ Pas de `any` en production

## Résumé
- 🔴 Critiques: 0
- 🟡 Warnings: 2
- 🔵 Suggestions: 9
