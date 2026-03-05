# fix(navigation) — .catch() manquant + dep array incomplet
Date : 2026-03-06 00:45

## Instruction
navigation/index.tsx — issues #1 et #4 du review 20260306-0030

## Rapport source
docs/bmad/reviews/20260306-0030-review.md

## Classification
Type : fix
Fichiers modifies : mobile/src/navigation/index.tsx

## Ce qui a ete fait
1. **AppContent useEffect (L141-146)** : Ajout `.catch()` sur la DB query qui determine la route initiale. Fallback vers 'Onboarding' si erreur DB. Log __DEV__ garde.
2. **AppNavigator useEffect (L213-226)** : Ajout `.catch()` sur la DB query des preferences (theme/lang). Fallback vers defaults (dark/fr) avec `setReady(true)` pour ne pas bloquer l'app. Log __DEV__ garde.
3. **GlobalBackHandler useEffect (L113)** : Ajout de `haptics` et `exitMessage` dans le dependency array pour eviter les stale closures.

## Verification
- TypeScript : ✅ zero erreur
- Tests : ✅ 1572 passed (93 suites)
- Nouveau test cree : non (navigation setup — difficilement testable en unit)

## Documentation mise a jour
aucune

## Statut
✅ Resolu — 20260306-0045
