# FEAT(exercises) — ExerciseCatalogScreen — Groupe B

Date : 2026-03-01 20:05

## Instruction
docs/bmad/prompts/20260301-1930-exercise-catalog-B.md

## Rapport source
docs/bmad/prompts/20260301-1930-exercise-catalog-B.md

## Classification
Type : feat
Fichiers modifiés :
- `mobile/src/screens/ExerciseCatalogScreen.tsx` (créé)

## Ce qui a été fait

### `mobile/src/screens/ExerciseCatalogScreen.tsx` (nouveau)

Écran de catalogue d'exercices Supabase (873 exercices free-exercise-db, CC0).

**Composants internes** :
- `CatalogItem` (memo) — ligne de liste avec thumbnail 60×60 (`expo-image`, `cachePolicy="memory-disk"`), placeholder icône barbell si `gif_url` null
- `ExerciseDetail` — vue détail dans BottomSheet : image 220px, badges catégorie/équipement/muscle, instructions numérotées, bouton import

**State & Refs** :
- State : `query`, `exercises`, `isLoading`, `isLoadingMore`, `hasMore`, `hasError`, `selectedExercise`, `isImporting`
- Refs : `currentOffsetRef`, `isLoadingRef`, `isLoadingMoreRef`, `hasMoreRef` — évite les race conditions sur la pagination async

**Fonctionnalités** :
- Recherche avec debounce 400ms (`useEffect` + `clearTimeout` cleanup — pitfall respect)
- Pagination FlatList via `onEndReached` + `onEndReachedThreshold=0.3`
- `loadInitial(q)` — reset offset, lance recherche
- `loadMore(q)` — append à la liste existante
- Vérification doublons avant import : `Q.where('name', name).fetchCount()`
- Import dans WatermelonDB via `database.write()` + `mapCatalogToLocal()`
- Gestion erreur : état `hasError` + bouton "Réessayer", loader initial centré, empty state
- AlertDialog "Déjà dans votre bibliothèque" (avec `hideCancel`) si doublon détecté

**Patterns respectés** :
- `useColors()` pour toutes les couleurs (pas de hardcoded)
- `useHaptics()` — `onSelect()` à l'ouverture détail, `onSuccess()` après import réussi
- `useModalState()` pour `detailSheet` et `duplicateAlert`
- Portal via `<BottomSheet>` (jamais `<Modal>` natif — Fabric)
- `expo-image` (pas `<Image>` RN) pour les GIFs/JPEGs
- Pas de `any` TypeScript

## Vérification
- TypeScript : ✅ `npx tsc --noEmit` → EXIT 0
- Tests : ✅ 1556 passed, 93 suites (2 suites en échec — `statsHelpers` + `statsKPIs` — pré-existantes, non liées)
- Nouveau test créé : non (écran réseau — mock complexe, hors scope)

## Documentation mise à jour
Aucune (JSDoc dans le fichier)

## Statut
✅ Résolu — 20260301-2005

## Commit
a6b35a1 feat(exercises): add ExerciseCatalogScreen — search + import from Supabase
