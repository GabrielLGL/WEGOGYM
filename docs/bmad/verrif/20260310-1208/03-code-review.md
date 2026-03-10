# Passe 3/8 — Code Review

## Issues trouvées : 5

### 🔴 C1 — Missing useCallback Dependencies (ProgramDetailScreen)
**Fichier :** `screens/ProgramDetailScreen.tsx:72-89`
**Description :** 3 useCallback hooks manquent des dépendances critiques (addChoiceModal, sessionModal)
**Fix :** Ajouter les dépendances manquantes

### 🔴 C2 — Unsafe Retry Pattern (openaiProvider)
**Fichier :** `services/ai/openaiProvider.ts:32`
**Description :** setTimeout brut pour retry 429, pas conforme au pattern withTimeout
**Fix :** Pattern mineur, le setTimeout est awaited — pas de fuite réelle

### 🟡 W1 — Hardcoded Colors AnimatedSplash
**Fichier :** `components/AnimatedSplash.tsx:20-21`
**Description :** Couleurs hardcodées (#181b21, #00cec9) hors theme
**Note :** Intentionnel (hors ThemeProvider), mais devrait importer depuis theme

### 🟡 W2 — handleSaveSession sans useCallback
**Fichier :** `screens/ProgramDetailScreen.tsx:91-100`
**Description :** Fonction async non memoizée, recréée à chaque render
**Fix :** Wrapper dans useCallback

### 🔵 S1 — Pattern de logging inconsistant
**Description :** Minor — tous les console.error sont déjà gardés par __DEV__
