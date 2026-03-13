# chore(leaderboard) — migrer Clipboard deprecated vers expo-clipboard
Date : 2026-03-13 19:45

## Instruction
migrer Clipboard deprecated vers expo-clipboard dans LeaderboardScreen

## Rapport source
description directe

## Classification
Type : chore
Fichiers modifiés : mobile/src/screens/LeaderboardScreen.tsx, mobile/package.json

## Ce qui a été fait
- Supprimé l'import `Clipboard` de `react-native` (deprecated)
- Installé `expo-clipboard` (compatible SDK 52)
- Importé `* as Clipboard from 'expo-clipboard'`
- Remplacé `Clipboard.setString()` → `Clipboard.setStringAsync()` (API async)
- Rendu `handleCopyCode` async pour supporter l'API

## Vérification
- TypeScript : ✅
- Tests : ✅ 1734 passed
- Nouveau test créé : non

## Documentation mise à jour
aucune

## Statut
✅ Résolu — 20260313-1945

## Commit
4b20c1d chore(leaderboard): migrate deprecated Clipboard to expo-clipboard
