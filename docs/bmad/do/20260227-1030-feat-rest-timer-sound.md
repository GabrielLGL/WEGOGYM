# feat(RestTimer) — soundEnabled + vibrationEnabled props + expo-av
Date : 2026-02-27 11:30

## Instruction
docs/bmad/prompts/20260227-1030-timer-son-B.md

## Rapport source
docs/bmad/prompts/20260227-1030-timer-son-B.md (description directe)

## Classification
Type : feat
Fichiers modifiés :
- `mobile/src/components/RestTimer.tsx`
- `mobile/src/utils/timerBeep.ts` (nouveau)
- `mobile/src/components/__tests__/RestTimer.test.tsx`
- `mobile/package.json` (expo-av ~15.0.2 installé)

## Ce qui a été fait

### 1. Nouvelles props dans RestTimer.tsx
- `vibrationEnabled?: boolean` (défaut `true`) — conditionne la triple vibration haptics
- `soundEnabled?: boolean` (défaut `true`) — conditionne le beep sonore
- Rétrocompatible : comportement identique sans ces props

### 2. Gestion de la vibration
- `vibrationEnabled` contrôle le bloc `haptics.onDelete()` triple dans `finishTimer()`
- Utilisation de `vibrationEnabledRef` pour éviter les stale closures (appelé depuis `setInterval`)

### 3. Gestion du son (expo-av)
- `soundRef = useRef<Audio.Sound | null>(null)` — ref pour cleanup
- `useEffect` dédié pour `soundRef.current.unloadAsync()` au démontage (Known Pitfalls)
- `soundEnabledRef` pour éviter les stale closures

### 4. Nouveau module `mobile/src/utils/timerBeep.ts`
Approche choisie : **WAV généré en mémoire en JavaScript pur** → data URI `data:audio/wav;base64,...`
- Aucun fichier audio requis, 100% offline
- WAV PCM 8-bit mono 8000Hz, 440Hz sine, 0.3s, avec fade-in/out (claquements évités)
- Encodage base64 pur JS (sans `btoa` — instable sur Hermes avec bytes > 127)
- Data URI mise en cache module-level après 1ère génération
- Expo-av / ExoPlayer Android supporte les data URIs

### 5. Tests mis à jour
- Mocks ajoutés : `expo-av` et `../../utils/timerBeep`
- 3 nouveaux tests :
  - ✅ Son joué par défaut à la fin du timer
  - ✅ Son non joué si `soundEnabled=false`
  - ✅ Rendu sans erreur avec `vibrationEnabled=false` et `soundEnabled=false`

## Vérification
- TypeScript : ✅ 0 erreur (`npx tsc --noEmit`)
- Tests : ✅ 17 passed, 0 failed
- Nouveau test créé : oui (3 nouveaux tests)

## Documentation mise à jour
Aucune (CLAUDE.md et patterns existants couvrent le cas)

## Statut
✅ Résolu — 20260227-1130

## Commit
0a2694e feat(RestTimer): add soundEnabled/vibrationEnabled props + beep via expo-av
