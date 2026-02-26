<!-- v1.0 — 2026-02-27 -->
# Rapport — input-flicker — Groupe A — 20260227-0010

## Objectif
Corriger le clignotement (flicker) des inputs `Séries` et `Poids (kg)` dans `ExerciseTargetInputs`.

## Symptôme
Quand l'utilisateur saisit un chiffre dans les champs **Séries** ou **Poids**, la valeur disparaît brièvement puis réapparaît. Le champ **Reps** n'a pas ce problème.

## Cause racine
- `sets` et `weight` sont des **props directes** passées au composant.
- Quand l'utilisateur tape, `onSetsChange`/`onWeightChange` est appelé → le parent met à jour son state → re-render → nouvelle prop descendante → TextInput re-rendu. Ce cycle async crée le flicker.
- `repsMin`/`repsMax` utilisent un **état local** (`useState`) : mise à jour instantanée dans le même composant, pas de cycle parent.

## Fichier concerné
`mobile/src/components/ExerciseTargetInputs.tsx`

## Fix à appliquer

### 1. Ajouter deux états locaux (après les états reps existants)
```tsx
const [localSets, setLocalSets] = useState(sets)
const [localWeight, setLocalWeight] = useState(weight)
```

### 2. Modifier `handleSetsChange` pour mettre à jour l'état local
```tsx
const handleSetsChange = (value: string) => {
  if (value === '') { setLocalSets(''); onSetsChange(''); return }
  const num = parseInt(value, 10)
  if (isNaN(num)) return
  const v = String(Math.min(Math.max(num, 1), 10))
  setLocalSets(v)
  onSetsChange(v)
}
```

### 3. Modifier `handleWeightChange` pour mettre à jour l'état local
```tsx
const handleWeightChange = (value: string) => {
  if (value === '' || value === '.') { setLocalWeight(value); onWeightChange(value); return }
  const num = parseFloat(value)
  if (isNaN(num)) return
  if (num < 0) { setLocalWeight('0'); onWeightChange('0'); return }
  if (num > 999) { setLocalWeight('999'); onWeightChange('999'); return }
  setLocalWeight(value)
  onWeightChange(value)
}
```

### 4. Mettre à jour les TextInputs pour utiliser les états locaux
- Input Séries : `value={localSets}` (était `value={sets}`)
- Input Poids : `value={localWeight}` (était `value={weight}`)

## Contraintes
- Ne pas modifier les props (`sets`, `weight`, `onSetsChange`, `onWeightChange`) — l'interface du composant reste identique
- Ne pas modifier la logique de validation/clamping
- Ne pas modifier les reps (déjà correct)
- Pas de `useEffect` pour synchroniser depuis les props — le pattern existant des reps n'en utilise pas

## Critères de validation
- `cd mobile && npx tsc --noEmit` → zéro erreur TypeScript
- `npm test -- --testPathPattern="ExerciseTargetInputs"` → tous les tests passent (24/24)
- Visuellement : saisir "3" dans Séries et "60" dans Poids ne cause plus de flicker

## Rapport do
`docs/bmad/do/20260227-0010-fix-input-flicker.md`

## Dépendances
Aucune — groupe unique.

## Statut
⏳ En attente
