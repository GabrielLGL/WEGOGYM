# fix(contexts) — ThemeContext rollback si database.write() échoue
Date : 2026-02-28 20:15

## Instruction
[rapport 20260228-1911 — problème restant #2 : ThemeContext race] ← groupe B

## Rapport source
`docs/bmad/verrif/20260228-1911/03-code-review.md` — problème #6

## Classification
Type : fix
Fichiers modifiés :
- `mobile/src/contexts/ThemeContext.tsx`

## Ce qui a été fait

### Problème identifié
`setMode(newMode)` était appelé AVANT `database.write()`. En cas d'échec DB :
- UI affichait le nouveau thème
- DB conservait l'ancien thème
- À l'app restart : thème divergent

### Solution : Optimistic update + rollback
```typescript
// Avant — silent fail sans rollback
const toggleTheme = useCallback(async () => {
  const newMode = mode === 'dark' ? 'light' : 'dark'
  setMode(newMode)           // mis à jour immédiatement
  await persistTheme(newMode) // echec silencieux → divergence
}, [mode, persistTheme])

// Après — rollback garanti si DB échoue
const toggleTheme = useCallback(async () => {
  const newMode = mode === 'dark' ? 'light' : 'dark'
  const previousMode = mode
  setMode(newMode)                       // optimistic update
  const success = await persistTheme(newMode)
  if (!success) setMode(previousMode)    // rollback si DB échoue
}, [mode, persistTheme])
```

### Détail de `persistTheme`
- Retourne maintenant `Promise<boolean>` (true = succès, false = échec DB)
- Cas `!user` → retourne `true` (pas d'utilisateur = phase onboarding, toggle OK sans persist)
- Cas DB error → log __DEV__ + retourne `false`

### `setThemeMode` mis à jour avec le même pattern
- Ajout de `mode` dans les deps de `setThemeMode` (nécessaire pour `previousMode`)
- Même logique rollback

## Vérification
- TypeScript : ✅ 0 erreur
- Tests : ✅ 1559 passed / 93 suites — 0 régression
- Nouveau test créé : non — le moduleNameMapper de Jest intercepte tous les imports
  de `contexts/ThemeContext` et les remplace par le mock, rendant le test du code
  réel impossible sans refactoring du setup Jest (hors scope)

## Documentation mise à jour
Aucune — le pattern rollback est standard React, pas un nouveau pitfall projet.

## Statut
✅ Résolu — 20260228-2015

## Commit
`b847c69` — `fix(contexts): ThemeContext rollback on database.write() failure`
