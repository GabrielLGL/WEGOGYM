# Rapport — Animation cleanup — 2026-03-11

## Problème
`Animated.timing` lancés sans cleanup dans :
- `SessionDetailScreen.tsx` — animations qui peuvent tourner après unmount
- `useAssistantWizard.ts` — idem

Risque : memory leak + warning "Can't perform state update on unmounted component".

## Fichiers concernés
- `mobile/src/screens/SessionDetailScreen.tsx`
- `mobile/src/hooks/useAssistantWizard.ts`

## Commande à lancer
/do docs/bmad/morning/20260311-1900-animation-cleanup.md

## Contexte
Pattern à appliquer : stocker la référence de l'animation et appeler `.stop()` dans le cleanup du useEffect, ou utiliser un `isMountedRef` pour guard les callbacks `.start()`.

```typescript
// Pattern correct
useEffect(() => {
  const anim = Animated.timing(value, { ... });
  anim.start();
  return () => anim.stop();
}, [deps]);
```

## Critères de validation
- `npx tsc --noEmit` — 0 erreurs
- `npm test` — 1694 tests passent
- Chaque `Animated.timing().start()` a un `.stop()` correspondant dans un cleanup

## Statut
⏳ En attente
