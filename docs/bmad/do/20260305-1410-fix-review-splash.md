# fix(splash) — corriger 4 problemes review
Date : 2026-03-05 14:10

## Instruction
rapport review cree — corriger les 4 problemes

## Rapport source
docs/bmad/reviews/20260305-1400-review.md

## Classification
Type : fix
Fichiers modifies : mobile/src/components/AnimatedSplash.tsx, mobile/App.tsx

## Ce qui a ete fait
1. **Unused import `View`** : supprime (seul `Image` est utilise)
2. **`runOnJS` inutile** : remplace `runOnJS(onFinish)()` par `onFinish` directement dans setTimeout (deja thread JS)
3. **Hardcoded spacing** : `marginBottom: 16` → `spacing.md`
4. **preventAutoHideAsync sans catch** : ajoute `.catch(() => {})` pour eviter un crash silencieux au module scope

## Verification
- TypeScript : ✅ zero erreur
- Tests : ✅ 1557 passed (3 failed pre-existants dans WorkoutScreen — non lies)
- Nouveau test cree : non (composant visuel/animation, pas de logique metier)

## Documentation mise a jour
aucune

## Statut
✅ Resolu — 20260305-1410

## Commit
03e051f feat(splash): add animated splash screen with Reanimated
