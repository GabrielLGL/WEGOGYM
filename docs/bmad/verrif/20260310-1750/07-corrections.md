# Passe 7/8 — Corrections

## 7a — Critiques 🔴

### CRIT-1: HistoryDetailScreen edits overwritten on sets emission ✅
**Fichier:** `screens/HistoryDetailScreen.tsx:86-95`
**Avant:** `setEdits(newEdits)` — écrase tous les edits à chaque émission
**Après:** `setEdits(prev => { ... prev[s.id] ?? {...} })` — merge avec edits existants

## 7b — Warnings 🟡

### WARN-B1: OnboardingScreen handleSelectLanguage async sans try/catch ✅
**Fichier:** `screens/OnboardingScreen.tsx:75-78`
**Après:** try/catch ajouté avec log `__DEV__`

### WARN-Q1-Q4: 4 composants morts supprimés ✅
- `SessionItem.tsx` + test (supprimé)
- `SetItem.tsx` + test (supprimé)
- `AssistantPreviewSheet.tsx` + test (supprimé)
- `LastPerformanceBadge.tsx` + test (supprimé)
- Mock `LastPerformanceBadge` retiré de `WorkoutExerciseCard.test.tsx`
- Commentaire ref `SessionItem.test.tsx` nettoyé dans `ProgramDetailBottomSheet.test.tsx`

### Non corrigés (risque comportemental ou nécessite migration):
- WARN-CR1: KPI mismatch sets/histories filters — design tradeoff acceptable
- WARN-CR2: _celebrationQueue useState → useRef — optimisation, pas de bug
- WARN-B2: sets.created_at non indexé — nécessite migration v34
- WARN-B3: Program.duplicate reads hors write — risque théorique faible en single-user
- WARN-CR3: Non-reactive exercise names — refactoring significatif
- WARN-CR4: recalculateSetPrs redundant queries — optimisation

## 7c — Suggestions 🔵
Non traitées — toutes mineures.

## Vérifications post-correction
- TypeScript : ✅ 0 erreur
- Tests : ✅ 1690 passed, 0 failed (108 suites — 4 dead test files supprimés)
