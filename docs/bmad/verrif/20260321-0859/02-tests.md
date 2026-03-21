# Passe 2/8 — Tests

## Resultat

`npx jest --coverage` → **147 suites, 1943 tests, 0 fail** ✅

## Coverage

| Metrique | Score |
|----------|-------|
| Statements | 72.93% |
| Branches | 60.34% |
| Functions | 65.96% |
| Lines | 74.88% |

## Fichiers sans couverture

| Fichier | Justification |
|---------|---------------|
| `services/healthConnectService.ts` | Service natif Android — necessite mock complexe |
| `services/healthKitService.ts` | Service natif iOS — necessite mock complexe |
| `services/progressPhotoService.ts` | FileSystem natif |
| `services/shareService.ts` | API native de partage |
| `widgets/KoreWidgetTaskHandler.tsx` | Widget Android natif |
| `components/AnimatedSplash.tsx` | Animation Reanimated |
| `types/workout.ts` | Types only — pas de logique |
| `services/ai/types.ts` | Types only — pas de logique |

## Verdict : TESTS OK — 0 fail, coverage 74.88% lines
