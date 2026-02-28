# Groupe A — Correctifs rapides ExercisesScreen.tsx

## Fichier modifié
`mobile/src/screens/ExercisesScreen.tsx`

## Changements

### 1. Couleur du texte du bouton "+ Créer un exercice"
- `addButtonText` : `color: colors.text` → `color: colors.primaryText`
- `colors.primaryText = '#ffffff'` (blanc) pour garantir la lisibilité sur fond `colors.primary`

### 2. Masquer le bouton ••• pour les exercices pré-installés
```tsx
// Avant
<TouchableOpacity style={styles.moreBtn} onPress={() => onOptionsPress(item)}>
  <Text style={styles.moreIcon}>•••</Text>
</TouchableOpacity>

// Après
{item.isCustom && (
  <TouchableOpacity style={styles.moreBtn} onPress={() => onOptionsPress(item)}>
    <Text style={styles.moreIcon}>•••</Text>
  </TouchableOpacity>
)}
```

### 3. Double protection dans le BottomSheet
L'option "Modifier" dans le BottomSheet est également conditionnée à `selectedExercise?.isCustom` :
```tsx
{selectedExercise?.isCustom && (
  <TouchableOpacity style={styles.sheetOption} onPress={...}>
    <Ionicons name="pencil-outline" ... />
    <Text style={styles.sheetText}>{t.exercises.editTitle}</Text>
  </TouchableOpacity>
)}
```

## Résultat
- Exercice pré-installé → aucun bouton ••• visible ✓
- Exercice custom → bouton ••• présent, options Edit + Delete dans BottomSheet ✓
- Texte du bouton "Créer un exercice" blanc sur fond cyan ✓
