# Tache M — useCallback audit sur 6 ecrans — 20260319-2100

## Objectif
Verifier et wrapper dans `useCallback` tous les handlers non-memoises sur les ecrans les plus utilises. Previent les re-renders inutiles des composants enfants (surtout ceux wrappés dans React.memo).

## Fichiers a auditer et corriger
- `mobile/src/screens/ReportDetailScreen.tsx` — handlePrev, handleNext (lignes ~66-75)
- `mobile/src/screens/StatsCalendarScreen.tsx` — handlers de navigation mois
- `mobile/src/screens/BadgesScreen.tsx` — handlers de selection
- `mobile/src/screens/LeaderboardScreen.tsx` — handlers de tri
- `mobile/src/screens/SkillTreeScreen.tsx` — handlers d'interaction
- `mobile/src/screens/PersonalChallengesScreen.tsx` — handlers de selection

## Contexte technique

### Regle
Tout handler passe en prop a un composant enfant ou utilise dans un FlatList renderItem DOIT etre un `useCallback` :

```tsx
// AVANT (re-cree a chaque render) :
const handlePress = () => { ... }

// APRES (stable entre les renders) :
const handlePress = useCallback(() => { ... }, [deps])
```

### Quand NE PAS ajouter useCallback
- Si le handler est utilise inline dans le JSX et n'est PAS passe en prop a un enfant memo
- Si le handler a trop de deps qui changent souvent (le useCallback ne sert alors a rien)
- Si le composant est simple et ne re-rend pas souvent

### Pattern a suivre
```tsx
import { useCallback } from 'react'

// Handler avec deps stables
const handlePrev = useCallback(() => {
  setOffset(prev => prev - 1)
}, [])

// Handler avec deps
const handleSelect = useCallback((id: string) => {
  haptics.onSelect()
  setSelectedId(id)
}, [haptics])
```

### Verification
Pour chaque fichier :
1. Lire le fichier
2. Identifier tous les handlers (`const handleX = () => { ... }` ou `function handleX()`)
3. Verifier s'ils sont wrappés dans `useCallback`
4. Si non, verifier s'ils sont passes en prop ou utilises dans un renderItem
5. Si oui → wrapper dans `useCallback` avec les bonnes deps
6. S'assurer que `useCallback` est importe de react

## Etapes
1. Pour chaque fichier : lire et identifier les handlers
2. Wrapper ceux qui doivent l'etre
3. Verifier les deps (pas de deps manquantes)
4. `npx tsc --noEmit` → 0 erreur
5. `npm test` → 0 fail

## Contraintes
- NE PAS modifier WorkoutScreen (deja fait)
- NE PAS modifier les composants Home (deja faits)
- NE PAS ajouter useCallback sur les handlers inline simples (overkill)
- NE PAS changer la logique metier

## Criteres de validation
- `npx tsc --noEmit` → 0 erreur
- `npm test` → 2231+ passed
- Tous les handlers passes en prop sont des useCallback

## Dependances
Aucune.

## Statut
⏳ En attente
