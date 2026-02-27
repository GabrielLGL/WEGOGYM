# fix(workout) — B4/B5/H5/Q1 : erreurs async, feedback utilisateur, CSS vars
Date : 2026-02-27 13:40

## Instruction
Continue RAPPORT 20260227-1220 — problèmes restants :
- B4 — handleConfirmEnd setState avant database.write (WorkoutScreen.tsx)
- B5 — validateSet échec DB invisible user (WorkoutScreen.tsx)
- H5 — ExercisePickerModal useEffect deps trop larges (ExercisePickerModal.tsx)
- Q1 — Couleurs hardcodées CSS keyframes (globals.css)

## Rapport source
docs/bmad/verrif/20260227-1220/RAPPORT.md

## Classification
Type : fix
Fichiers modifiés :
- mobile/src/screens/WorkoutScreen.tsx
- mobile/src/components/ExercisePickerModal.tsx
- web/src/app/globals.css

## Ce qui a été fait

### B4 — handleConfirmEnd (WorkoutScreen.tsx)
`setSessionXPGained`, `setNewLevelResult`, `setNewStreakResult` étaient appelés AVANT
`database.write()`. Si la write échouait, l'UI affichait des gains non persistés.
Fix : déplacé ces 3 setState après la fermeture du `database.write()`.

### B5 — handleValidateSet (WorkoutScreen.tsx)
Quand `validateSet` retournait `false` (échec DB), aucun feedback utilisateur.
Fix : ajout de `haptics.onError()` dans la branche `else`.

### H5 — ExercisePickerModal useEffect (ExercisePickerModal.tsx)
Le reset des états s'exécutait aussi quand `initialSets/Reps/Weight` changeaient
(pas seulement à la fermeture de la modale). Ajout d'un `prevVisibleRef` pour
détecter la transition `true → false` de `visible`, et ne reset que dans ce cas.
Aussi ajouté `useRef` aux imports React.

### Q1 — globals.css
Hardcoded colors remplacées par CSS variables :
- `@keyframes pulseLogo` : `rgba(108,92,231,0.4)` → `var(--accent-glow)`,
  `rgba(0,206,201,0.6)` → `var(--accent-secondary-glow)` (nouvelle variable ajoutée
  en `:root` et `[data-theme="dark"]` avec valeurs inversées pour dark mode)
- `.btn-liquid` : `#6c5ce7, #00cec9` → `var(--accent), var(--accent-secondary)`

## Vérification
- TypeScript mobile : ✅ 0 erreur
- TypeScript web : ✅ 0 erreur
- Tests : ✅ 77 passed (WorkoutScreen, WorkoutState, ExercisePickerModal)
- Nouveau test créé : non

## Documentation mise à jour
aucune

## Statut
✅ Résolu — 20260227-1340

## Commit
c704fd7 fix(workout): B4 setState after write, B5 haptic on error, H5 visible ref, Q1 CSS vars
