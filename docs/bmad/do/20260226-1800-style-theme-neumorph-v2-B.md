# style(theme) — Neumorphisme v2 Groupe B — LinearGradient
Date : 2026-02-26 18:00

## Classification
Type : style
Fichiers modifiés :
- `mobile/package.json` — ajout expo-linear-gradient ~14.0.2
- `mobile/src/components/Button.tsx`
- `mobile/src/screens/HomeScreen.tsx`

## Ce qui a été fait

### 0. Installation expo-linear-gradient
- `npx expo install expo-linear-gradient` → `"expo-linear-gradient": "~14.0.2"` dans package.json

### 1. Button.tsx — gradient sur variant `primary`
- Import ajouté : `import { LinearGradient } from 'expo-linear-gradient'`
- Rendu Pressable converti en render prop `{({ pressed }) => (...)}`
- Quand `variant === 'primary' && !pressed` : `<LinearGradient>` avec `StyleSheet.absoluteFillObject` et `borderRadius: borderRadius.sm` appliqué avant le contenu texte
- Colors : `[colors.primaryGradientStart, colors.primaryGradientEnd]` (`#00d9d4` → `#007a77`)
- Direction : `start={{ x: 0, y: 0 }}` → `end={{ x: 1, y: 1 }}` (diagonale haut-gauche → bas-droite)
- Au press : gradient absent, `backgroundColor: colors.primary` du style `variant_primary` ressort naturellement

### 2. HomeScreen.tsx — gradient sur le fond principal
- Import ajouté : `import { LinearGradient } from 'expo-linear-gradient'`
- Root ScrollView wrappé dans `<LinearGradient style={{ flex: 1 }}>`
- Colors : `[colors.bgGradientStart, colors.bgGradientEnd]` (`#22262e` → `#181b21`)
- Direction : `start={{ x: 0, y: 0 }}` → `end={{ x: 0.3, y: 1 }}` (légèrement incliné)
- ScrollView : `{ backgroundColor: 'transparent' }` ajouté inline pour laisser le gradient apparaître

## Vérification
- TypeScript : ✅ zéro erreur (`npx tsc --noEmit`)
- Tests : ✅ 1255 passed (4 failures pré-existantes — hors scope)

## Statut
✅ Résolu — 20260226-1800-B
