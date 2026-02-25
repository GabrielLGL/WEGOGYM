# Architecture — Animations/Demos exercices — 2026-02-25

## 1. Migration schema v20 → v21

### Modification `mobile/src/model/schema.ts`
```typescript
// Version bump
version: 21

// Table exercises — 2 colonnes ajoutees
{ name: 'animation_key', type: 'string', isOptional: true }
{ name: 'description', type: 'string', isOptional: true }
```

### Modification `mobile/src/model/models/Exercise.ts`
```typescript
@text('animation_key') animationKey?: string
@text('description') description?: string
```

### Pas de fichier de migration
App non publiee → DB reset au changement de version. Pas besoin de `migrations.ts`.

---

## 2. Donnees : exerciseDescriptions.ts

### Fichier : `mobile/src/model/utils/exerciseDescriptions.ts` (NOUVEAU)

```typescript
interface ExerciseDescriptionData {
  animationKey: string
  description: string
}

// Mapping nom d'exercice → donnees
export const EXERCISE_DESCRIPTIONS: Record<string, ExerciseDescriptionData> = {
  'Developpe couche': {
    animationKey: 'bench_press',
    description: 'Allonge sur le banc, pieds au sol. Descends la barre vers le milieu de la poitrine en controlant. Pousse vers le haut en expirant. Garde les epaules collees au banc.',
  },
  // ... 20-30 exercices
}
```

### Helper de seed
```typescript
export async function seedExerciseDescriptions(database: Database): Promise<number>
```
- Parcourt tous les exercices en base
- Pour chaque exercice dont le nom matche dans `EXERCISE_DESCRIPTIONS`
- Met a jour `animation_key` et `description` via `database.write()` + `database.batch()`
- Retourne le nombre d'exercices mis a jour
- Appele au lancement de l'app (idempotent — ne re-ecrit pas si deja rempli)

---

## 3. Composant ExerciseInfoSheet

### Fichier : `mobile/src/components/ExerciseInfoSheet.tsx` (NOUVEAU)

```typescript
interface ExerciseInfoSheetProps {
  exercise: Exercise
  visible: boolean
  onClose: () => void
}
```

**Structure du BottomSheet :**
```
┌─────────────────────────────────────┐
│           ── drag handle ──          │
│                                     │
│   ┌─────────────────────────────┐   │
│   │     [icone placeholder]     │   │
│   │    "Animation a venir"      │   │
│   └─────────────────────────────┘   │
│                                     │
│   NOM DE L'EXERCICE                 │
│                                     │
│   [Pecs] [Epaules] [Triceps]       │ ← chips muscles
│                                     │
│   ── Description ──                 │
│   Allonge sur le banc, pieds au     │
│   sol. Descends la barre vers...    │
│                                     │
│   ── Notes ──                       │
│   Grip pronation, tempo 3-1-1-0     │
│   (ou "Aucune note" en italic)      │
│                                     │
└─────────────────────────────────────┘
```

**Composants reutilises :**
- `<BottomSheet>` existant (Portal pattern)
- Chips muscles : simple `View` + `Text` avec style chip (pas ChipSelector — affichage seul)
- Couleurs du theme uniquement

---

## 4. Integration SessionExerciseItem

### Fichier : `mobile/src/components/SessionExerciseItem.tsx` (MODIFIE)

**Ajouts :**
- Import `ExerciseInfoSheet` + `useModalState` + `useHaptics`
- State : `const infoSheet = useModalState()`
- Icone info (Ionicons `information-circle-outline`) a cote du nom
- Au tap : `haptics.onPress()` + `infoSheet.open()`
- Rendu : `<ExerciseInfoSheet exercise={exercise} visible={infoSheet.isOpen} onClose={infoSheet.close} />`

**Layout modifie :**
```
[drag] [nom exercice] [icone info (i)]    [poubelle]
       [muscles • equipment]
       [Notes]
       [series x reps]
```

---

## 5. Integration ExercisePickerModal

### Fichier : `mobile/src/components/ExercisePickerModal.tsx` (MODIFIE)

**Ajouts :**
- Import `ExerciseInfoSheet` + `useModalState`
- State : `const infoSheet = useModalState()` + `selectedInfoExercise`
- Icone info (i) a cote de chaque exercice dans la liste
- Au tap : ouvre l'ExerciseInfoSheet pour l'exercice concerne
- N'interfere pas avec la selection d'exercice (tap sur la ligne = selection, tap sur icone = info)

---

## 6. Flux de donnees complet

```
App Launch
    │
    ▼
[seedExerciseDescriptions()] ← idempotent, 1 seule fois
    │
    ▼
Exercices en base ont animation_key + description
    │
    ▼
SessionExerciseItem / ExercisePickerModal
    │
    ├── Tap sur icone info (i)
    │       │
    │       ▼
    │   ExerciseInfoSheet (BottomSheet)
    │       ├── Placeholder animation (icone + texte)
    │       ├── Nom exercice
    │       ├── Chips muscles
    │       ├── Description (depuis exercise.description)
    │       └── Notes (depuis exercise.notes)
    │
    └── Tap normal → selection / edit targets (inchange)
```

---

## 7. Fichiers impactes (liste complete)

### Nouveaux fichiers
| Fichier | Role |
|---------|------|
| `model/utils/exerciseDescriptions.ts` | Mapping descriptions + helper seed |
| `components/ExerciseInfoSheet.tsx` | Fiche info exercice (BottomSheet) |
| `components/__tests__/ExerciseInfoSheet.test.tsx` | Tests du composant |

### Fichiers modifies
| Fichier | Modification |
|---------|-------------|
| `model/schema.ts` | v20 → v21, +2 colonnes exercises |
| `model/models/Exercise.ts` | +`animationKey`, +`description` |
| `components/SessionExerciseItem.tsx` | +icone info, +ExerciseInfoSheet |
| `components/ExercisePickerModal.tsx` | +icone info, +ExerciseInfoSheet |

---

## 8. Ordre d'implementation recommande

1. **US-01** Schema v21 + Model Exercise mis a jour
2. **US-02** exerciseDescriptions.ts (mapping + helper seed)
3. **US-03** ExerciseInfoSheet (composant BottomSheet)
4. **US-04** Integration SessionExerciseItem (bouton info en seance)
5. **US-05** Integration ExercisePickerModal (bouton info en bibliotheque)

---

## 9. Dependances
- Aucune nouvelle dependance npm
- Ionicons deja disponible via `@expo/vector-icons`
- Composants reutilises : `BottomSheet`, `useModalState`, `useHaptics`, `colors.*`, `spacing.*`
