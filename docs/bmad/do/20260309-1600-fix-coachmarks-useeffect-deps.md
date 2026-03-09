# fix(CoachMarks) — useEffect deps manquantes
Date : 2026-03-09 16:00

## Instruction
CoachMarks useEffect deps (groupe C)

## Rapport source
Description directe

## Classification
Type : fix
Fichiers modifiés : mobile/src/components/CoachMarks.tsx

## Ce qui a été fait
Deux useEffect dans CoachMarks.tsx avaient des tableaux de dépendances incomplets :

1. **"Animate in on mount" effect (l.121)** : `[visible]` → ajouté `measureTarget`, `fadeAnim`, `tooltipAnim`
2. **"Re-measure on step change" effect (l.162)** : `[currentStep, ready]` → ajouté `measureTarget`, `tooltipAnim`

`fadeAnim` et `tooltipAnim` sont stables (useRef.current) donc pas de re-render supplémentaire.
`measureTarget` est un useCallback qui dépend de `step` — l'ajouter garantit que le bon target est mesuré si le step change entre deux renders.

## Vérification
- TypeScript : ✅
- Tests : ✅ 1737 passed
- Nouveau test créé : non

## Documentation mise à jour
aucune

## Statut
✅ Résolu — 20260309-1600

## Commit
70d7a3a fix(CoachMarks): add missing useEffect dependency arrays
