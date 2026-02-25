# S03 — Helper suggestProgression + parseRepsTarget
> Feature: smart-templates-notes | Priorite: Must | Dependance: —

## Description
Creer un nouveau fichier `progressionHelpers.ts` avec les fonctions `parseRepsTarget()` et `suggestProgression()` qui calculent la suggestion de progression adaptative.

## Fichier cree
- `mobile/src/model/utils/progressionHelpers.ts`

## Taches techniques
1. `parseRepsTarget(repsTarget: string | undefined | null)` :
   - "6-8" → `{ type: 'range', min: 6, max: 8 }`
   - "5" → `{ type: 'fixed', value: 5 }`
   - null/undefined → `null`
2. `suggestProgression(lastWeight, lastReps, repsTarget)` :
   - Range et lastReps >= max → `{ suggestedWeight: +2.5, suggestedReps: min, label: "+2.5 kg" }`
   - Range et lastReps < max → `{ suggestedWeight: same, suggestedReps: +1, label: "+1 rep" }`
   - Fixed → `{ suggestedWeight: +2.5, suggestedReps: same, label: "+2.5 kg" }`
   - Null/invalide → `null`
3. Exporter `ProgressionSuggestion` interface
4. Tests unitaires complets

## Criteres d'acceptation
- [ ] `parseRepsTarget("6-8")` retourne range avec min=6, max=8
- [ ] `parseRepsTarget("5")` retourne fixed avec value=5
- [ ] `parseRepsTarget(null)` retourne null
- [ ] `suggestProgression(80, 8, "6-8")` → +2.5 kg (range max atteint)
- [ ] `suggestProgression(80, 6, "6-8")` → +1 rep (range pas atteint)
- [ ] `suggestProgression(100, 5, "5")` → +2.5 kg (fixe)
- [ ] `suggestProgression(80, 8, null)` → null
- [ ] `suggestProgression(0, 8, "6-8")` → null (poids invalide)
- [ ] Pas de `any` TypeScript
- [ ] `npx tsc --noEmit` passe
