# Passe 7a — Corrections critiques

**Date :** 2026-03-09

## Corrections appliquées

### C1. AnimatedSplash.tsx — theme dynamique
- **Avant :** Import statique `colors` depuis `../theme` → ignorait le toggle dark/light
- **Fix :** Remplacé par `useColors()` hook, couleurs injectées en inline style
- **Fichier :** `mobile/src/components/AnimatedSplash.tsx`

### C2. AssistantPreviewScreen.tsx — error feedback
- **Avant :** `catch` vide, erreur swallowed silencieusement
- **Fix :** Ajout `console.error` guardé `__DEV__`
- **Fichier :** `mobile/src/screens/AssistantPreviewScreen.tsx`

### C3. ProgramDetailScreen.tsx — 3 async handlers
- **Avant :** `handleSaveSession`, `handleDuplicateSession`, `handleMoveSession` sans try/catch
- **Fix :** Ajout try/catch + `__DEV__` console.error sur chaque handler
- **Fichier :** `mobile/src/screens/ProgramDetailScreen.tsx`

## Vérification
- `npx tsc --noEmit` : ✅ 0 erreur
- `npx jest` : ✅ 1737 tests, 0 fail
