<!-- v1.0 — 2026-02-27 -->
# Rapport — fix(ExerciseTargetInputs) : saisie rapide v2 — Groupe A — 20260227-0900

## Objectif

Corriger la vraie cause racine de la race condition : `value={state}` (async)
est remplacé par `value={ref.current}` (sync) pour les 4 TextInputs.

## Fichiers concernés

- `mobile/src/components/ExerciseTargetInputs.tsx`
- `mobile/src/components/__tests__/ExerciseTargetInputs.test.tsx`

## Contexte technique

### Vrai mécanisme du bug

La race condition React Native / TextInput contrôlé :

1. User tape "5" → `onChangeText("5")` → `setLocalSets("5")` → re-render PLANIFIÉ (async)
2. Avant le re-render, user tape "5" → natif a "55"
3. Re-render : `value={localSets}` = "5" (stale state)
4. React Native voit : nouveau prop "5" ≠ dernière valeur envoyée "3" → envoie "5" au natif
5. Natif se reset à "5" → "0" perdu

**Déplacer le clamp vers onBlur (fix précédent) ne résout PAS ce problème** :
le `setLocalSets(value)` dans onChangeText déclenche toujours le re-render async
qui applique la valeur stale.

### Solution : ref synchrone

La ref est mise à jour SYNCHRONEMENT dans onChangeText. Quand React re-rend
(async), `ref.current` contient déjà la DERNIÈRE valeur tapée. React Native
envoie cette dernière valeur au natif → qui l'affiche déjà → pas de correction
visible.

```
user tape "555" vite :
  onChangeText("5") → ref = "5", setState("5")
  onChangeText("55") → ref = "55", setState("55")  [avant re-render]
  onChangeText("555") → ref = "555", setState("555") [avant re-render]
  re-render → value = ref.current = "555" → natif déjà "555" → ✓
```

## Étapes

### 1. Import `useRef`

```tsx
import React, { useState, useRef } from 'react'
```

### 2. Ajouter 4 refs (après les useState)

```tsx
// Refs pour value props — évite la race condition avec controlled TextInput
// Mis à jour synchroniquement dans onChangeText, utilisés dans value prop et blur handlers
const localSetsRef = useRef(sets)
const localWeightRef = useRef(weight)
const repsMinRef = useRef(reps.includes('-') ? reps.split('-')[0] : reps)
const repsMaxRef = useRef(reps.includes('-') ? (reps.split('-')[1] ?? '') : '')
```

### 3. Mettre à jour chaque handler pour écrire dans la ref en premier

**handleSetsChange** :
```tsx
const handleSetsChange = (value: string) => {
  localSetsRef.current = value
  if (value === '') { setLocalSets(''); onSetsChange(''); return }
  setLocalSets(value)
  onSetsChange(value)
}
```

**handleSetsBlur** (lire la ref, pas le state) :
```tsx
const handleSetsBlur = () => {
  const raw = localSetsRef.current
  if (raw === '') return
  const num = parseInt(raw, 10)
  if (isNaN(num)) { localSetsRef.current = ''; setLocalSets(''); onSetsChange(''); return }
  const v = String(Math.min(Math.max(num, 1), 10))
  if (v !== raw) { localSetsRef.current = v; setLocalSets(v); onSetsChange(v) }
}
```

**handleRepsMinChange** :
```tsx
const handleRepsMinChange = (value: string) => {
  repsMinRef.current = value
  if (value === '') { setRepsMin(''); onRepsChange(''); return }
  setRepsMin(value)
  onRepsChange(repsMode === 'range' && repsMaxRef.current ? `${value}-${repsMaxRef.current}` : value)
}
```

**handleRepsMinBlur** (lire ref) :
```tsx
const handleRepsMinBlur = () => {
  const raw = repsMinRef.current
  if (raw === '') return
  const num = parseInt(raw, 10)
  if (isNaN(num)) { repsMinRef.current = ''; setRepsMin(''); onRepsChange(''); return }
  const v = String(Math.min(Math.max(num, 1), 99))
  if (v !== raw) {
    repsMinRef.current = v
    setRepsMin(v)
    onRepsChange(repsMode === 'range' && repsMaxRef.current ? `${v}-${repsMaxRef.current}` : v)
  }
}
```

**handleRepsMaxChange** :
```tsx
const handleRepsMaxChange = (value: string) => {
  repsMaxRef.current = value
  if (value === '') { setRepsMax(''); onRepsChange(repsMinRef.current || ''); return }
  setRepsMax(value)
  onRepsChange(repsMinRef.current ? `${repsMinRef.current}-${value}` : value)
}
```

**handleRepsMaxBlur** (lire ref) :
```tsx
const handleRepsMaxBlur = () => {
  const raw = repsMaxRef.current
  if (raw === '') return
  const num = parseInt(raw, 10)
  if (isNaN(num)) { repsMaxRef.current = ''; setRepsMax(''); onRepsChange(repsMinRef.current || ''); return }
  const v = String(Math.min(Math.max(num, 1), 99))
  if (v !== raw) {
    repsMaxRef.current = v
    setRepsMax(v)
    onRepsChange(repsMinRef.current ? `${repsMinRef.current}-${v}` : v)
  }
}
```

**switchToFixed** (mettre à jour repsMaxRef) :
```tsx
const switchToFixed = () => {
  setRepsMode('fixed')
  repsMaxRef.current = ''
  setRepsMax('')
  onRepsChange(repsMinRef.current)
}
```

**handleWeightChange** :
```tsx
const handleWeightChange = (value: string) => {
  localWeightRef.current = value
  setLocalWeight(value)
  onWeightChange(value)
}
```

**handleWeightBlur** (lire ref) :
```tsx
const handleWeightBlur = () => {
  const raw = localWeightRef.current
  if (raw === '' || raw === '.') return
  const num = parseFloat(raw)
  if (isNaN(num) || num < 0) { localWeightRef.current = '0'; setLocalWeight('0'); onWeightChange('0'); return }
  if (num > 999) { localWeightRef.current = '999'; setLocalWeight('999'); onWeightChange('999'); return }
}
```

### 4. Mettre à jour les 4 value props

```tsx
// Séries
value={localSetsRef.current}

// Poids
value={localWeightRef.current}

// Reps (mode fixe ET plage)
value={repsMinRef.current}

// Reps max (mode plage)
value={repsMaxRef.current}
```

### 5. Tests — aucun changement nécessaire

Tous les tests existants passent car :
- Les tests vérifient les callbacks (pas le state interne)
- `getByDisplayValue` utilise le value prop = ref.current, donc fonctionne
- Les tests clamping ont déjà blur + toHaveBeenLastCalledWith (fix précédent)

## Critères de validation

- `npx tsc --noEmit` → 0 erreur
- `npm test -- --testPathPattern="ExerciseTargetInputs" --no-coverage` → 26+ tests verts

## Dépendances

Aucune dépendance externe.

## Statut
⏳ En attente
