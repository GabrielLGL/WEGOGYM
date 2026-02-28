# STYLE(settings) — timer conditionnel + chevrons level/goal
Date : 2026-02-28 14:35

## Instruction
docs/bmad/prompts/20260228-1430-settings-ui-A.md

## Rapport source
docs/bmad/prompts/20260228-1430-settings-ui-A.md

## Classification
Type : style
Fichiers modifiés : `mobile/src/screens/SettingsScreen.tsx`

## Ce qui a été fait

### Tâche 1 — Timer conditionnel
Les 3 options dépendantes du timer (durée repos, vibration, son) sont maintenant enveloppées dans `{timerEnabled && (<>...</>)}`. Quand le timer est désactivé, ces options disparaissent de l'écran.

### Tâche 2 — Level et Goal cliquables
Les lignes "Niveau" et "Objectif" affichent désormais un chevron (`<Ionicons name="chevron-forward" />` ou `chevron-down` selon l'état d'expansion) en couleur `colors.primary` à droite de la valeur. Cela signale visuellement que la ligne est interactive.

## Vérification
- TypeScript : ⚠️ shell bash non fonctionnel — vérification manuelle requise (`npx tsc --noEmit` dans mobile/)
- Tests : ⚠️ shell bash non fonctionnel — vérification manuelle requise (`npm test` dans mobile/)
- Nouveau test créé : non (changements purement visuels/conditionnels)

## Documentation mise à jour
aucune

## Statut
✅ Résolu — 20260228-1435

## Commit
À faire manuellement :
```bash
git add mobile/src/screens/SettingsScreen.tsx docs/bmad/do/20260228-1435-style-settings-ui.md docs/bmad/prompts/20260228-1430-settings-ui-A.md
git commit -m "style(settings): hide timer options when disabled, add chevrons to level/goal rows"
git push origin main
```
