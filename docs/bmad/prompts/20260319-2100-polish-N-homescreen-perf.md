# Tache N — HomeScreen performance audit — 20260319-2100

## Objectif
Optimiser le HomeScreen (l'ecran le plus visite) en memoisant les sous-composants et en reduisant les re-renders. Le HomeScreen affiche 8+ cartes/sections qui se re-rendent toutes quand une seule donnee change.

## Fichier principal
- `mobile/src/screens/HomeScreen.tsx`

## Sous-composants a optimiser
- `mobile/src/components/home/HomeHeaderCard.tsx`
- `mobile/src/components/home/HomeHeroAction.tsx`
- `mobile/src/components/home/HomeStatusStrip.tsx`
- `mobile/src/components/home/HomeWeeklyActivityCard.tsx`
- `mobile/src/components/home/HomeBodyStatusSection.tsx`
- `mobile/src/components/home/HomeStreakSection.tsx`
- `mobile/src/components/home/HomeInsightsCarousel.tsx`
- `mobile/src/components/home/HomeInsightsSection.tsx`
- `mobile/src/components/home/HomeNavigationGrid.tsx`
- `mobile/src/components/home/HomeGamificationCard.tsx`

## Contexte technique

### Probleme
Quand `withObservables` stream une mise a jour (ex: un nouveau set), TOUS les sous-composants re-rendent car les props changent au niveau du HomeContent. Meme les composants qui ne dependent pas de cette donnee.

### Solution
1. **Wrapper chaque sous-composant dans `React.memo`** — ne re-rend que si ses props changent
2. **Verifier que les props passees sont stables** — pas de creation d'objets inline
3. **useMemo sur les donnees derivees** dans HomeScreen avant de les passer aux enfants

### Pattern
```tsx
// Dans le sous-composant :
export const HomeHeaderCard = React.memo(function HomeHeaderCard({ ... }: HomeHeaderCardProps) {
  // ...
})

// OU si c'est une named export :
function HomeHeaderCardInner({ ... }: HomeHeaderCardProps) {
  // ...
}
export const HomeHeaderCard = React.memo(HomeHeaderCardInner)
```

### Verification des props
Dans HomeScreen, verifier qu'on ne passe pas d'objets crees inline :
```tsx
// MAUVAIS (objet recree a chaque render) :
<HomeHeaderCard stats={{ sessions: 10, volume: 5000 }} />

// BON (objet stable via useMemo) :
const stats = useMemo(() => ({ sessions: 10, volume: 5000 }), [sessions, volume])
<HomeHeaderCard stats={stats} />
```

### Refs passees en props
Les `React.RefObject` sont stables par nature — pas de probleme a les passer.

## Etapes
1. Lire `HomeScreen.tsx` pour comprendre quelles props sont passees a chaque sous-composant
2. Identifier les props instables (objets/arrays crees inline)
3. Stabiliser avec `useMemo` dans HomeScreen si necessaire
4. Wrapper chaque sous-composant dans `React.memo`
5. `npx tsc --noEmit` → 0 erreur
6. `npm test` → 0 fail

## Contraintes
- NE PAS changer les props des sous-composants (juste les wrapper dans memo)
- NE PAS changer le layout ou l'ordre des composants
- NE PAS modifier la logique metier
- Si un composant a des enfants (children), React.memo peut ne pas aider — le noter

## Criteres de validation
- `npx tsc --noEmit` → 0 erreur
- `npm test` → 2231+ passed
- Chaque sous-composant Home est wrappé dans React.memo
- Pas de props instables passees inline

## Dependances
Aucune.

## Statut
⏳ En attente
