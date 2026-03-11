# Passe 7/8 — Corrections

**Run :** 20260311-1130

## 7a — Critiques 🔴 (5 fixes)

| # | Fix | Fichier | Description |
|---|-----|---------|-------------|
| C1 | ✅ | `StatsVolumeScreen.tsx` | `muscleLabel` → `muscleKey` avec sentinelle `NO_FILTER` — survit au changement de langue |
| C2 | ✅ | `useWorkoutCompletion.ts` | Ajout `isMountedRef` guards après `getTotalSessionCount()` et `unsafeFetchRaw()` |
| B07 | ✅ | `RestTimer.tsx` | Spring animation stockée dans `entryAnimRef` et `.stop()` au cleanup |
| B10 | ✅ | `useWorkoutCompletion.ts` | (combiné avec C2) |
| B16 | ✅ | `exportHelpers.ts` | `fetch()` déplacé hors de `database.write()` — prevent deadlock |

## 7b — Warnings 🟡 (3 fixes)

| # | Fix | Fichier | Description |
|---|-----|---------|-------------|
| W7 | ✅ | `BadgeCard.tsx` + `BadgesScreen.tsx` | Prop `unlockedAt` supprimée (dead prop) + map supprimé |
| Q2 | ✅ | `StatsVolumeScreen.tsx` | `WEEK_MS` importé de `model/constants` au lieu de dupliqué |
| Q1 | ✅ | `BadgeCard.test.tsx` | Test adapté (suppression `unlockedAt`) |

## 7c — Non corrigés (risque trop élevé / effort trop grand pour MVP)

| Issue | Raison du skip |
|-------|----------------|
| W4 — buildWeeklyActivity perf O(H*S) | Optimisation perf — pas de crash, tester l'impact avant refactor |
| W5 — computeMonthlySetsChart English defaults | 15+ tests à modifier, caller unique passe déjà le param |
| B01 — geminiProvider response.json() | Caller wraps dans try/catch, erreur bubble correctement |
| B04/B05/B06 — null safety `.history.id` | WDB relation FK toujours défini, null = corruption edge case |
| B08/B09 — Animated sans cleanup | Low risk, animation courte, pas de setState dans callback |
| B11/B12 — useCallback missing deps | `useModalState` retourne refs stables, pas de stale closure réel |
| B17/B18/B19 — fetch/find inside write() | Pattern WDB courant, find() est PK lookup, pas de deadlock observé |
| DB1-DB4 — PerformanceLog | Append-only, jamais `.update()` appelé, documented |

## Vérification post-correction

- `npx tsc --noEmit` : ✅ 0 erreurs
- `npm test` : ✅ 1694 pass, 0 fail
