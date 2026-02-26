# chore(HomeScreen) — Remplace escapes unicode par caractères UTF-8 littéraux
Date : 2026-02-26 19:00

## Instruction
Remplace tous les escapes unicode (\u00e9 etc.) dans mobile/src/screens/HomeScreen.tsx par les vrais caractères UTF-8 littéraux.
- L53 : 'Entra\u00eenement' → 'Entraînement'
- L62 : 'Dur\u00e9e' → 'Durée'
- L157 : "S\u00e9ances" → "Séances"
- L197 : Activit{'\u00e9'} → fusionner en 'Activité' dans le JSX Text

## Rapport source
description directe

## Classification
Type : chore
Fichiers modifiés : mobile/src/screens/HomeScreen.tsx

## Ce qui a été fait
- Remplacement ciblé de 4 escapes unicode non-emoji par les caractères UTF-8 réels
- Emojis surrogates (\uD83D, \uD83C, \uFE0F, etc.) conservés intacts
- Fusion de `Activit{'\u00e9'}` en un seul string `Activité` dans le nœud JSX Text

## Vérification
- TypeScript : ✅ npx tsc --noEmit — 0 erreur
- Tests : ✅ (aucun test modifié, chore purement cosmétique)
- Nouveau test créé : non

## Documentation mise à jour
aucune

## Statut
✅ Résolu — 20260226-1900

## Commit
