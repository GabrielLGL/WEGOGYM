# Tache I — React.memo round 2 — 20260319-1900

## Objectif
Continuer la memoisation des FlatList render items sur les ecrans restants (non couverts par la tache C).

## Fichiers a modifier
- `mobile/src/screens/ExerciseCatalogScreen.tsx` — CatalogItem (ligne ~439)
- `mobile/src/screens/ProgressPhotosScreen.tsx` — renderThumbnail (ligne ~180)
- `mobile/src/screens/SelfLeaguesScreen.tsx` — RankRow inline (ligne ~198)
- `mobile/src/screens/StatsVolumeDistributionScreen.tsx` — renderBar (ligne ~105)
- `mobile/src/screens/StatsMuscleBalanceScreen.tsx` — renderPair (ligne ~148)
- `mobile/src/screens/StatsRestTimeScreen.tsx` — inline renderItem (ligne ~125)

## Contexte technique

### Pattern a suivre (identique a la tache C)
L'app utilise deja ce pattern dans `ExercisesScreen.tsx` :

```tsx
// 1. Interface pour les props
interface CatalogItemProps {
  item: CatalogExercise
  onImport: (id: string) => void
}

// 2. Composant extrait et memoize
const CatalogItem = React.memo(function CatalogItem({ item, onImport }: CatalogItemProps) {
  const colors = useColors()
  const styles = useItemStyles(colors)
  return (...)
})

// 3. renderItem stable dans le parent
const renderItem = useCallback(({ item }: { item: CatalogExercise }) => (
  <CatalogItem item={item} onImport={handleImport} />
), [handleImport])
```

### Regles
- Extraire le contenu inline dans un composant nomme
- Wrapper dans `React.memo()`
- Typer les props avec une interface
- Garder le `useCallback` sur le renderItem parent
- Les callbacks passes en props doivent etre stables (`useCallback`)
- Si le composant utilise `useColors()` en interne, le theme change → re-render auto (correct)
- NE PAS ajouter de custom comparator sauf si necessaire

### Notes par fichier

**ExerciseCatalogScreen.tsx** — Verifier si `CatalogItem` est deja un composant extrait. Si oui, juste le wrapper dans `React.memo()`. Si c'est inline dans le renderItem, extraire d'abord.

**ProgressPhotosScreen.tsx** — `renderThumbnail` rend une image avec un overlay. Extraire en `PhotoThumbnail` component.

**SelfLeaguesScreen.tsx** — Le renderItem rend un `RankRow` inline. Extraire en composant.

**StatsVolumeDistributionScreen.tsx** — `renderBar` rend une barre avec label et pourcentage.

**StatsMuscleBalanceScreen.tsx** — `renderPair` rend une paire de muscles avec barres de comparaison.

**StatsRestTimeScreen.tsx** — Rend une carte avec nom d'exercice et temps de repos moyen.

## Etapes
1. Pour chaque fichier : lire le renderItem actuel
2. Extraire dans un composant nomme avec interface Props
3. Wrapper dans `React.memo()`
4. Verifier que les callbacks sont stables
5. `npx tsc --noEmit` → 0 erreur
6. `npm test` → 0 fail

## Contraintes
- NE PAS modifier les 7 fichiers deja faits dans la tache C (ActivityFeedScreen, ProgramDetailScreen, StatsHallOfFameScreen, StatsHeatmapScreen, StatsSetQualityScreen, StatsPRTimelineScreen, StatsExerciseFrequencyScreen)
- NE PAS modifier ExercisesScreen (deja memo)
- NE PAS changer la logique metier

## Criteres de validation
- `npx tsc --noEmit` → 0 erreur
- `npm test` → 2231+ passed
- 6 nouveaux composants wrappees dans React.memo

## Dependances
Aucune — independant.

## Statut
⏳ En attente
