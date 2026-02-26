# Rapport — fix(ExerciseTargetInputs) : saisie rapide perd des caractères

**Date :** 2026-02-27
**Groupe A** — fichier unique + test

---

## Problème

Race condition dans les TextInput contrôlés de React Native.

- L'utilisateur tape "40" rapidement dans le champ Poids
- `handleWeightChange("4")` → `setLocalWeight("4")` → rendu planifié
- Avant ce rendu, le natif a déjà "40"
- Le rendu React commet `value="4"` → le TextInput natif se reset à "4" → le "0" est perdu

Le `if (isNaN(num)) return` sans `setLocalState` aggravait le problème : état contrôlé diverge du natif → reset visible.

---

## Cause racine

Clamping synchrone dans `onChangeText` → controlled value diverge du natif pendant la frappe.

---

## Fix appliqué

**Principe :** `onChangeText` accepte tout (valeur brute), `onBlur` valide/clamp.

### Handlers modifiés

| Handler | Avant | Après |
|---------|-------|-------|
| `handleSetsChange` | clamp immédiat | passe brut + `onSetsChange(value)` |
| `handleWeightChange` | clamp immédiat | passe brut + `onWeightChange(value)` |
| `handleRepsMinChange` | clamp immédiat | passe brut |
| `handleRepsMaxChange` | clamp immédiat | passe brut |

### Handlers ajoutés (blur)

- `handleSetsBlur` — clamp [1, 10]
- `handleWeightBlur` — clamp [0, 999]
- `handleRepsMinBlur` — clamp [1, 99]
- `handleRepsMaxBlur` — clamp [1, 99]

### TextInputs

Ajout `onBlur={handler}` sur les 4 inputs concernés.

---

## Tests mis à jour

- Tests de clamping : ajout `fireEvent(input, 'blur')` + `toHaveBeenLastCalledWith`
- 2 nouveaux tests fast-typing ajoutés
- Total : **26 tests verts** (0 régression)

---

## Vérification

```
npx tsc --noEmit   → 0 erreur
npm test           → 26/26 ✓
```

---

## Fichiers modifiés

- `mobile/src/components/ExerciseTargetInputs.tsx`
- `mobile/src/components/__tests__/ExerciseTargetInputs.test.tsx`
