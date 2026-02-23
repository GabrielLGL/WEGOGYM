# fix(security) — secureKeyStore crash resilience

Date : 2026-02-23 10:00

## Instruction
Fix ExpoSecureStore crash: make secureKeyStore.ts resilient when native module unavailable (lazy import + fallback to no-op on Expo Go)

## Rapport source
Description directe

## Classification
Type : fix
Fichiers modifiés :
- mobile/src/services/secureKeyStore.ts
- mobile/src/services/__tests__/secureKeyStore.test.ts (nouveau)

## Ce qui a été fait
1. **Added try/catch to `setApiKey` and `deleteApiKey`** — these were the only two exported functions without error handling. If the native module loaded via `require` but crashed at runtime (common in Expo Go), these would throw unhandled errors.
2. **Added `_disabled` flag and `disableStore()` helper** — when any native call fails at runtime, the store is permanently disabled for the session. This prevents repeated crash attempts on subsequent calls.
3. **Created comprehensive test suite** (7 tests) covering:
   - Success path for get/set/delete
   - Native call failure resilience for all three
   - Store disabling after first failure (subsequent calls don't retry)

## Vérification
- TypeScript : ✅ zero errors
- Tests : ✅ 847 passed (48 suites)
- Nouveau test créé : oui (7 tests in secureKeyStore.test.ts)

## Documentation mise à jour
Aucune (pattern already documented in CLAUDE.md section 3.1)

## Statut
✅ Résolu — 20260223-1000

## Commit
e573456 fix(security): make secureKeyStore resilient when native module unavailable
