# Rapport — fix buildDBContext filtre date + forceUpdate hack — 2026-02-20

## Problème
2 corrections groupées (Groupe D+E du dernier verrif) :
1. `aiService.ts` — `buildDBContext()` charge jusqu'à 500 entrées d'historique sans filtre de date → lenteur + contexte IA inutilement large
2. `AssistantScreen.tsx` — `forceUpdate` hack utilisé (useState({}) pattern) pour forcer re-render → pattern à supprimer, utiliser WatermelonDB withObservables ou state correct

## Fichiers concernés
- `mobile/src/services/ai/aiService.ts`
- `mobile/src/screens/AssistantScreen.tsx`

## Commande à lancer
/do Limiter buildDBContext dans aiService.ts aux 30 derniers jours d'historique (remplacer Q.take(500) par filtre Q.where created_at >= 30j) + supprimer forceUpdate hack dans AssistantScreen.tsx et remplacer par pattern React correct

## Contexte
- CLAUDE.md : WatermelonDB mutations dans database.write(), withObservables pour data, no any, no console.log hors __DEV__
- aiService.ts utilise WatermelonDB queries pour construire le contexte IA
- AssistantScreen.tsx est un écran complexe avec un assistant IA
- Pour le filtre date : utiliser `Q.where('created_at', Q.gte(Date.now() - 30 * 24 * 60 * 60 * 1000))` avant Q.take(50) max
- Pour forceUpdate : identifier pourquoi il est utilisé, remplacer par useCallback/useMemo ou useState correct
- Rapport verrif source : `docs/bmad/verrif/20260220-1844/RAPPORT.md` problèmes #5, #6

## Critères de validation
- `npx tsc --noEmit` → 0 erreur
- `npm test` → 0 fail
- buildDBContext : requête inclut filtre date sur history
- AssistantScreen : aucun `forceUpdate` ou `setState({})` hack visible

## Statut
⏳ En attente
