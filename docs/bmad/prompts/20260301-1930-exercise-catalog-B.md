<!-- v1.0 — 2026-03-01 -->
# Rapport — Exercise Catalog — Groupe B — 20260301-1930

## Objectif
Créer `ExerciseCatalogScreen` : écran de recherche/parcours des 873 exercices Supabase,
avec affichage du GIF/image, détail, et bouton "Ajouter à ma bibliothèque".

## Fichiers concernés
- `mobile/src/screens/ExerciseCatalogScreen.tsx` — **NOUVEAU**

## Contexte technique

### Prérequis (Groupe A déjà fait)
- `mobile/src/services/exerciseCatalog.ts` existe avec :
  - `searchCatalogExercises(params: CatalogSearchParams): Promise<CatalogSearchResult>`
  - `mapCatalogToLocal(ex: CatalogExercise): { name, muscles, equipment, description }`
  - Types : `CatalogExercise`, `CatalogSearchParams`

### Architecture mobile
- **Thème** : Dark mode uniquement. `useColors()` hook pour toutes les couleurs.
- **i18n** : `useLanguage()` hook — `{ t }`. App en français (fr-FR).
- **Haptics** : `useHaptics()` hook — `onPress()`, `onSelect()`, `onSuccess()`
- **Modals/Dialogs** : Portal pattern — jamais `<Modal>` natif
- **WatermelonDB** : pour créer l'exercice importé. Mutations dans `database.write()`
- **Composants réutilisables** : `<Button>`, `<BottomSheet>` (dans `components/`)
- **Images** : utiliser `expo-image` avec `cachePolicy="memory-disk"` (Fabric-compatible)
- **Pas de** `useState` pour données DB, mais OK ici (données distantes, pas WatermelonDB)
- **Navigation** : prop `navigation` de React Navigation (NativeStack)

### Pattern d'accès DB (pour créer un exercice importé)
```typescript
import { database } from '../model'
import Exercise from '../model/models/Exercise'

// Toujours dans database.write() :
await database.write(async () => {
  await database.get<Exercise>('exercises').create((ex) => {
    ex.name = name
    ex._muscles = JSON.stringify(muscles)  // tableau stocké en JSON
    ex.equipment = equipment
    ex.description = description
    ex.isCustom = false  // exercice importé = pas custom
  })
})
```

### Thème — couleurs clés
- `colors.background` (#121212) — fond principal
- `colors.card` (#1C1C1E) — cartes
- `colors.primary` — couleur d'accentuation
- `colors.text` — texte principal
- `colors.textSecondary` — texte secondaire
- `colors.border` — bordures
- `colors.danger` (#FF3B30) — danger

### i18n — clés manquantes (à ajouter dans fr.ts + en.ts)
Utiliser des strings hardcodées en français pour l'instant si les clés n'existent pas encore.
(Le Groupe C ou une passe ultérieure ajoutera les clés i18n.)

### Fichiers de référence pour les patterns
- `mobile/src/screens/ExercisesScreen.tsx` — pattern withObservables, ChipSelector, search
- `mobile/src/components/ExercisePickerModal.tsx` — pattern liste + filtres + Portal

## Étapes

### 1. Structure générale de l'écran
```
ExerciseCatalogScreen
├── Header implicite (géré par navigation)
├── SearchBar (TextInput stylisé)
├── FlatList d'exercices (lazy loading)
│   └── ExerciseCatalogItem (composant interne)
│       ├── Thumbnail GIF (expo-image, 60x60)
│       ├── Nom + target muscle
│       └── Bouton "+" ou "Ajouter"
└── BottomSheet (détail exercice, Portal)
    ├── Image GIF grande (expo-image)
    ├── Nom, catégorie, équipement, target
    ├── Instructions (ScrollView)
    └── Bouton "Ajouter à ma bibliothèque"
```

### 2. State local
```typescript
const [query, setQuery] = useState('')
const [exercises, setExercises] = useState<CatalogExercise[]>([])
const [isLoading, setIsLoading] = useState(false)
const [isLoadingMore, setIsLoadingMore] = useState(false)
const [hasMore, setHasMore] = useState(true)
const [offset, setOffset] = useState(0)
const [selectedExercise, setSelectedExercise] = useState<CatalogExercise | null>(null)
const detailSheet = useModalState()
```

### 3. Recherche avec debounce
- Debounce de 400ms sur `query` avant de lancer `searchCatalogExercises`
- Reset offset à 0 à chaque nouvelle recherche
- useEffect cleanup pour annuler le timeout (règle pitfall : `setTimeout` doit avoir cleanup)

```typescript
useEffect(() => {
  const timeout = setTimeout(() => {
    loadExercises(query, 0, true)  // reset = true
  }, 400)
  return () => clearTimeout(timeout)
}, [query])
```

### 4. Chargement initial et pagination
- `loadExercises(q, currentOffset, reset)` :
  - Si reset → setExercises([]), setOffset(0)
  - Appel `searchCatalogExercises({ query: q, limit: 50, offset: currentOffset })`
  - Append ou replace les exercices
  - Update `hasMore` depuis le résultat

- `onEndReached` dans FlatList → appeler `loadExercises(query, offset + 50, false)` si `hasMore && !isLoadingMore`

### 5. ExerciseCatalogItem (composant interne — pas d'export)
```tsx
// Carte compacte par exercice
// Image GIF : expo-image 60x60, contentFit="cover", borderRadius 8
// Si gif_url null → icône barbell (Ionicons)
// Nom : tronqué à 2 lignes
// Badge muscle : target muscle (anglais, pas de mapping pour l'affichage)
// Bouton info → ouvre detail sheet
```

### 6. BottomSheet détail exercice
Utiliser le composant `<BottomSheet>` depuis `components/BottomSheet.tsx` (Portal) :
```tsx
<BottomSheet
  visible={detailSheet.isOpen}
  onClose={detailSheet.close}
  title={selectedExercise?.name ?? ''}
>
  {selectedExercise && <ExerciseDetail exercise={selectedExercise} onImport={handleImport} />}
</BottomSheet>
```

**ExerciseDetail (composant interne)** :
- Image GIF grande (expo-image, 100% width, height 200, contentFit="cover")
- Si pas de gif → placeholder avec icône
- Row : catégorie | équipement | muscle cible
- Section "Instructions" : liste numérotée (si instructions.length > 0)
- Bouton `<Button variant="primary">Ajouter à ma bibliothèque</Button>`

### 7. Importer un exercice dans WatermelonDB
```typescript
const handleImport = async (ex: CatalogExercise) => {
  haptics.onSuccess()
  const { name, muscles, equipment, description } = mapCatalogToLocal(ex)
  await database.write(async () => {
    await database.get<Exercise>('exercises').create((record) => {
      record.name = name
      record._muscles = JSON.stringify(muscles)
      record.equipment = equipment
      record.description = description
      record.isCustom = false
    })
  })
  detailSheet.close()
  // Feedback : afficher un toast ou message court "Exercice ajouté !"
  // (pas d'AlertDialog ici, c'est une action positive)
}
```

**Gestion erreur import** : si l'exercice existe déjà (même nom), afficher `<AlertDialog>` "Exercice déjà dans votre bibliothèque" (cancel uniquement, pas de delete).

### 8. Empty state et error state
- Loading initial : `<ActivityIndicator>` centré
- Aucun résultat : texte "Aucun exercice trouvé" centré
- Erreur réseau : texte "Erreur de connexion. Vérifiez votre réseau." avec bouton "Réessayer"

## Contraintes
- **Pas** de `<Modal>` natif — utiliser `<BottomSheet>` avec Portal ✓
- **Toutes** les couleurs via `useColors()` — pas de couleurs hardcodées
- **Mutations DB** dans `database.write()` ✓
- **expo-image** (PAS `<Image>` de React Native) pour les GIFs
- **Pas de `any`** TypeScript
- **setTimeout cleanup** dans useEffect ✓

## Critères de validation
- `npx tsc --noEmit` dans `mobile/` → zéro erreur
- L'écran se monte sans crash
- La recherche fonctionne avec debounce
- Le BottomSheet s'ouvre et se ferme correctement
- L'import crée bien un exercice dans WatermelonDB

## Dépendances
**Ce groupe dépend de : Groupe A** (service `exerciseCatalog.ts` doit exister)

## Statut
✅ Résolu — 20260301-2005

## Résolution
Rapport do : docs/bmad/do/20260301-2005-feat-exercise-catalog-screen.md
