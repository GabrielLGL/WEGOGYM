# Tache S — Remplacer les couleurs hardcodees par le theme — 20260319-2300

## Objectif
Remplacer toutes les couleurs CSS hardcodees (`#fff`, `#FFF`, `#1C1C1E`, etc.) par les tokens du theme (`colors.*`). Cela assure la coherence Dark/Light mode.

## Fichiers a modifier

### Ecrans avec couleurs hardcodees
- `mobile/src/screens/StatsHeatmapScreen.tsx` — `color: '#fff'`
- `mobile/src/screens/StatsVolumeRecordsScreen.tsx` — `color: '#FFF'` (2 occurrences)
- `mobile/src/screens/StatsCompareScreen.tsx` — `color: '#fff'`

### Composants
- `mobile/src/components/home/HomeBodyStatusSection.tsx` — `color: '#fff'`

### Splash (NE PAS MODIFIER)
- `mobile/src/components/AnimatedSplash.tsx` — couleurs intentionnellement hardcodees pour le splash screen

### Tests (NE PAS MODIFIER)
- Les fichiers `__tests__/*.test.tsx` avec des couleurs hardcodees sont des valeurs de mock — ne pas toucher

## Contexte technique

### Mapping des couleurs
```
#fff / #FFF → colors.text (texte principal) ou colors.textSecondary
#1C1C1E → colors.card (fond de carte dark) — seulement dans les chart configs
```

### Pattern
```tsx
// AVANT :
color: '#fff',

// APRES :
color: colors.text,
```

### Pour les chart configs
Les couleurs dans les configs de graphiques (`react-native-chart-kit`) sont souvent passees comme strings. Verifier que le composant a acces a `useColors()` :
```tsx
const colors = useColors()

const chartConfig = useMemo(() => ({
  backgroundColor: colors.card,
  backgroundGradientFrom: colors.card,
  backgroundGradientTo: colors.card,
  color: () => colors.primary,
  labelColor: () => colors.text,
}), [colors])
```

Si le chartConfig est deja un `useMemo`, ajouter `colors` aux deps.

## Etapes
1. Pour chaque fichier : trouver les couleurs hardcodees
2. Verifier que `useColors()` est importe
3. Remplacer par le token theme equivalent
4. Si dans un `useMemo` → ajouter `colors` aux deps
5. `npx tsc --noEmit` → 0 erreur
6. `npm test` → 0 fail

## Contraintes
- NE PAS modifier `AnimatedSplash.tsx` (splash = couleurs fixes)
- NE PAS modifier les fichiers de test
- NE PAS modifier `theme/index.ts`
- NE PAS inventer de nouvelles couleurs — utiliser celles qui existent dans `theme/index.ts`
- Si une couleur n'a pas d'equivalent clair dans le theme → la laisser et ajouter un commentaire `// TODO: add to theme`

## Criteres de validation
- `npx tsc --noEmit` → 0 erreur
- `npm test` → 2231+ passed
- Zero `#fff` / `#FFF` / `#1C1C1E` dans les fichiers source (hors tests et AnimatedSplash)
- Dark/Light mode fonctionne correctement sur les ecrans modifies

## Dependances
Aucune.

## Statut
⏳ En attente
