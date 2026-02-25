# QA Report — Exercise Info (Animations/Demos placeholders) — 2026-02-25

## Resume
Feature : Fiches d'exercice avec description textuelle et placeholder animation
Date QA : 2026-02-25
Statut global : PASSED

---

## Resultats de verification technique

| Check | Resultat |
|-------|---------|
| `npx tsc --noEmit` | 0 erreur |
| `npm test` | 1186 passed, 0 failed, 66 suites |
| Nouvelles regressions | Aucune |

---

## Stories verifiees vs criteres d'acceptation

### STORY-01 — Schema v21 : animation_key + description
- [x] Schema version = 21
- [x] Table exercises a `animation_key` (string, optional) et `description` (string, optional)
- [x] Model Exercise a `animationKey?: string` et `description?: string`
- [x] Sync schema <-> model parfait
- [x] TypeScript compile sans erreur

### STORY-02 — Descriptions texte + animation_key pour exercices de base
- [x] Fichier `exerciseDescriptions.ts` cree dans `model/utils/`
- [x] 30 exercices de base couverts avec descriptions francaises
- [x] Descriptions claires, 2-4 phrases, cues actionables
- [x] Fonction `seedExerciseDescriptions()` exporte et integree dans App.tsx
- [x] Seed idempotent (ne re-ecrit pas si deja rempli)

### STORY-03 — Composant ExerciseInfoSheet
- [x] Composant `ExerciseInfoSheet.tsx` cree dans `components/`
- [x] Utilise `<BottomSheet>` existant (Portal pattern)
- [x] Affiche : placeholder animation, nom, chips muscles, description, notes
- [x] Gere l'absence de description ("Pas de description disponible")
- [x] Gere l'absence de notes ("Aucune note")
- [x] Se ferme au tap overlay et back Android
- [x] Theme dark mode respecte
- [x] 8 tests unitaires passent

### STORY-04 — Bouton info dans SessionExerciseItem
- [x] Icone `information-circle-outline` a cote du nom
- [x] Ouvre ExerciseInfoSheet au tap
- [x] Haptics `onPress` au tap
- [x] Drag & drop reste fonctionnel
- [x] Targets et delete restent fonctionnels
- [x] 11 tests existants passent (+ mocks ajoutes)

### STORY-05 — Bouton info dans ExercisePickerModal
- [x] Icone (i) a droite de chaque ligne exercice
- [x] Tap sur (i) ouvre ExerciseInfoSheet
- [x] Tap sur la ligne (hors icone) selectionne l'exercice
- [x] Filtres et ajout restent fonctionnels
- [x] 19 tests existants passent (+ mock ajoute)

---

## Conformite CLAUDE.md

| Regle | Respect |
|-------|---------|
| Mutations dans `database.write()` | OK (seedExerciseDescriptions) |
| Pas de native `<Modal>` | OK — BottomSheet via Portal |
| `withObservables` HOC | OK (SessionExerciseItem existant) |
| Pas de `any` TypeScript | OK |
| Couleurs via `colors.*` | OK |
| `console.log` garde avec `__DEV__` | OK (aucun ajoute) |
| `useHaptics()` | OK (SessionExerciseItem + ExercisePickerModal) |
| Schema/Model sync | OK (animation_key + description) |
| Pas de couleurs hardcodees | OK |

---

## Fichiers modifies/crees

### Nouveaux fichiers
- `mobile/src/model/utils/exerciseDescriptions.ts`
- `mobile/src/components/ExerciseInfoSheet.tsx`
- `mobile/src/components/__tests__/ExerciseInfoSheet.test.tsx`

### Fichiers modifies
- `mobile/src/model/schema.ts` (v20 → v21)
- `mobile/src/model/models/Exercise.ts` (+animationKey, +description)
- `mobile/src/components/SessionExerciseItem.tsx` (+icone info, +ExerciseInfoSheet)
- `mobile/src/components/ExercisePickerModal.tsx` (+icone info, +ExerciseInfoSheet)
- `mobile/App.tsx` (+seedExerciseDescriptions)
- `mobile/src/components/__tests__/SessionExerciseItem.test.tsx` (+mocks)
- `mobile/src/components/__tests__/ExercisePickerModal.test.tsx` (+mock)

---

## Conclusion
5/5 stories PASSED | TypeScript 0 erreur | 1186 tests passes | 0 regression
