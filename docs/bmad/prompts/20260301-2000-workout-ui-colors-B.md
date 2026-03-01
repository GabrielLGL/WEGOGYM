<!-- v1.0 — 2026-03-01 -->
# Rapport — workout-ui-colors — Groupe B — 20260301-2000

## Objectif
Réduire la taille et l'impact visuel des boutons de validation de série, et corriger la couleur de l'icône checkmark.

## Fichiers concernés
- `mobile/src/components/WorkoutExerciseCard.tsx`

## Contexte technique
- Theme : `useTheme()` depuis `mobile/src/contexts/ThemeContext.tsx`
- `colors.primary` = `#00cec9` cyan (dark) / `#6c5ce7` violet (light)
- `colors.primaryText` = `#ffffff` blanc pur — pour icônes/textes sur fond coloré plein
- `colors.success` = `#00cec9` en dark (même que primary)
- `colors.successBg` = `rgba(0, 206, 201, 0.12)` — background teinté léger pour état validé
- Composant `WorkoutSetRow` (React.memo) — ne pas briser l'animation `Animated.spring` sur validation
- JAMAIS de couleurs hardcodées

## État actuel (problèmes)
- Style `validateBtn` (bouton checkmark, état non validé) :
  - `width: 38, height: 38` → trop grand
  - `backgroundColor: colors.primary` (fond plein cyan) → trop voyant
  - Icône `checkmark-outline` avec `color={colors.text}` → couleur incorrect sur fond plein
- Style `validateBtnActive` (bouton croix, état validé) :
  - `width: 38, height: 38` → trop grand
  - `backgroundColor: colors.success` (fond plein) → trop voyant pour une action secondaire (dé-valider)

## Étapes

### Style `validateBtn` (bouton valider — non validé)
Changer vers un style **outline** (moins voyant) :
```ts
validateBtn: {
  width: 32,
  height: 32,
  borderRadius: borderRadius.lg,
  backgroundColor: 'transparent',
  borderWidth: 1.5,
  borderColor: colors.primary,
  justifyContent: 'center',
  alignItems: 'center',
  marginLeft: 'auto',
},
```

### Style `validateBtnDisabled` (outline désactivé)
Mettre à jour pour cohérence avec le nouveau style outline :
```ts
validateBtnDisabled: {
  borderColor: colors.border,
  backgroundColor: 'transparent',
},
```
(Retirer `backgroundColor: colors.cardSecondary` qui n'est plus pertinent avec un style outline)

### Icône checkmark dans le bouton valider (ligne ~180)
Changer `color={colors.text}` → `color={colors.primary}` (icône primary sur fond transparent)

Pour l'état disabled, l'icône doit aussi être moins visible :
- Ajouter une prop conditionnelle : `color={valid ? colors.primary : colors.border}`

### Style `validateBtnActive` (bouton dé-valider — état validé)
Réduire la taille et adoucir :
```ts
validateBtnActive: {
  width: 32,
  height: 32,
  borderRadius: borderRadius.lg,
  backgroundColor: colors.successBg,
  borderWidth: 1,
  borderColor: colors.primary + '60',
  justifyContent: 'center',
  alignItems: 'center',
  marginLeft: 'auto',
},
```

### Icône croix dans le bouton dé-valider (ligne ~127)
Vérifier que `color={colors.text}` reste correct (texte sur fond successBg — ok, lisible)

## Contraintes
- Ne PAS toucher la logique de validation / dé-validation
- Ne PAS modifier `WorkoutExerciseCardContent` ni ses handlers
- Ne PAS casser l'animation `Animated.spring` sur scaleAnim — elle enveloppe le bouton via `Animated.View`
- Ne PAS modifier les styles du set validé (`setRowValidated`, `setBadgeValidated`) — c'est correct
- Ne PAS modifier les inputs ou les styles d'erreur

## Critères de validation
- `npx tsc --noEmit` → zéro erreur
- `npm test` → zéro fail
- Le bouton checkmark est visuellement moins imposant (outline au lieu de plein)
- La taille est réduite (32 au lieu de 38)
- L'icône checkmark est primary color (cyan/violet) sur fond transparent
- L'animation spring fonctionne encore après validation
- L'état dé-valider (croix) est aussi réduit et moins agressif

## Dépendances
Aucune — indépendant des groupes A et C

## Statut
⏳ En attente
