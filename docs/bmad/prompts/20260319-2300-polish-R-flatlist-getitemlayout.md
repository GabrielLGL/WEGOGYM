# Tache R — FlatList getItemLayout optimization — 20260319-2300

## Objectif
Ajouter `getItemLayout` aux FlatLists qui ont des items de hauteur fixe. Cela permet a React Native de sauter le calcul de layout et d'ameliorer le scroll sur les longues listes.

## Fichiers a modifier

### 1. `mobile/src/screens/ExerciseCatalogScreen.tsx`
- FlatList avec 500+ exercices
- Items de hauteur fixe (nom + muscle + equipement = ~60-70px)
- Ajouter `getItemLayout` + `keyExtractor` optimise

### 2. `mobile/src/screens/ExercisesScreen.tsx`
- FlatList d'exercices custom
- Meme pattern que ExerciseCatalog

### 3. `mobile/src/screens/LeaderboardScreen.tsx`
- FlatList de classement
- Items de hauteur fixe (rang + nom + score)

### 4. `mobile/src/screens/BadgesScreen.tsx`
- FlatList ou ScrollView de badges
- Items de hauteur fixe

### 5. `mobile/src/screens/ActivityFeedScreen.tsx`
- FlatList d'activite recente

## Contexte technique

### Pattern getItemLayout
```tsx
const ITEM_HEIGHT = 72 // hauteur fixe d'un item en pixels
const SEPARATOR_HEIGHT = 0 // si pas de separateur

const getItemLayout = useCallback(
  (_data: unknown, index: number) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  }),
  [],
)

<FlatList
  data={items}
  getItemLayout={getItemLayout}
  // ...
/>
```

### Comment determiner la hauteur
1. Lire le composant renderItem
2. Additionner : padding vertical + fontSize lineHeight + margins
3. OU mesurer sur device avec React DevTools
4. La hauteur doit etre EXACTE sinon le scroll sera decale

### Avec separateurs
```tsx
const getItemLayout = useCallback(
  (_data: unknown, index: number) => ({
    length: ITEM_HEIGHT + SEPARATOR_HEIGHT,
    offset: (ITEM_HEIGHT + SEPARATOR_HEIGHT) * index,
    index,
  }),
  [],
)
```

### Attention
- Si les items ont une hauteur VARIABLE (texte multi-ligne, images dynamiques) → NE PAS ajouter getItemLayout
- Si la FlatList a un `ListHeaderComponent` → ajuster l'offset du premier item
- Toujours tester le scroll apres ajout

## Etapes
1. Pour chaque fichier : lire et identifier la FlatList
2. Verifier si les items ont une hauteur fixe
3. Si oui → calculer la hauteur et ajouter getItemLayout
4. Verifier que keyExtractor utilise un ID stable (pas l'index)
5. `npx tsc --noEmit` → 0 erreur
6. `npm test` → 0 fail

## Contraintes
- NE PAS modifier le rendu des items
- NE PAS ajouter getItemLayout si la hauteur est variable
- NE PAS modifier les composants Home (deja optimises)
- Garder les optimisations existantes (initialNumToRender, etc.)

## Criteres de validation
- `npx tsc --noEmit` → 0 erreur
- `npm test` → 2231+ passed
- Au moins 3 FlatLists avec getItemLayout

## Dependances
Aucune.

## Statut
⏳ En attente
