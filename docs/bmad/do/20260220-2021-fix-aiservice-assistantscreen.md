# fix(aiService+AssistantScreen) — filtre date performance_logs + suppression forceUpdate hack
Date : 2026-02-20 20:21

## Instruction
20260220-2021 (aiService + AssistantScreen)

## Rapport source
docs/bmad/morning/20260220-2021-fix-builddbcontext-forceupdate.md

## Classification
Type : fix
Fichiers modifiés :
- mobile/src/services/ai/aiService.ts
- mobile/src/screens/AssistantScreen.tsx

## Ce qui a été fait

### aiService.ts — buildDBContext performance_logs
- Remplacé `Q.take(500)` par filtre `Q.where('created_at', Q.gte(thirtyDaysAgo))` + `Q.take(50)`
- `thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000`
- Contexte IA limité aux PRs des 30 derniers jours (pertinent + léger)

### AssistantScreen.tsx — suppression forceUpdate hack
- Supprimé `const [, forceUpdate] = useState(0)` (ligne 179)
- Supprimé `forceUpdate(n => n + 1)` dans `useFocusEffect` + le commentaire associé
- `withObservables` gère déjà la réactivité de `user?.aiProvider` — le badge se met à jour automatiquement

## Vérification
- TypeScript : ✅ (erreurs pré-existantes dans sentry.test.ts non liées)
- Tests : ✅ 664 passed, 0 failed
- Nouveau test créé : non (tests existants couvrent buildDBContext + performance_logs)

## Documentation mise à jour
aucune

## Statut
✅ Résolu — 20260220-2021

## Commit
313f892 fix(aiService+AssistantScreen): date filter on perfLogs + remove forceUpdate hack
