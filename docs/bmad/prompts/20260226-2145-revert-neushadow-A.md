<!-- v1.0 — 2026-02-26 -->
# Rapport — Revert NeuShadow — Groupe A — 20260226-2145

## Objectif
Supprimer le wrapper NeuShadow (react-native-shadow-2) de Button.tsx et retirer le fichier
NeuShadow.tsx. Revenir au système d'ombre natif simple : `neuShadow.*` spread ViewStyle
depuis `useTheme()`, stable sur Android et iOS sans SVG.

## Fichiers concernés
1. `mobile/src/components/Button.tsx` — revert NeuShadow → neuShadow spread
2. `mobile/src/components/NeuShadow.tsx` — supprimer le fichier

## Contexte technique
- `useTheme()` depuis `contexts/ThemeContext` retourne `{ colors, neuShadow, isDark, ... }`
- `neuShadow` contient `{ elevated, elevatedSm, pressed }` — chacun est un ViewStyle spread
  - `elevated` : shadow iOS + elevation Android + borderColor
  - `pressed` : shadow réduit pour l'état enfoncé
- Le gradient `LinearGradient` sur le bouton primary doit être CONSERVÉ (il est déjà en place)
- `spacing.lg` = 24, `borderRadius.sm` = 10
- CLAUDE.md §3 : pas de Modal natif, pas de hardcoded colors, pas de any TypeScript

## État actuel de Button.tsx (à revert)
```tsx
import React, { useState } from 'react'           // ← retirer useState
import { NeuShadow } from './NeuShadow'           // ← retirer cet import

// Dans le composant :
const { colors } = useTheme()                     // ← ajouter neuShadow
const [isPressed, setIsPressed] = useState(false) // ← supprimer

const pressable = (                               // ← supprimer cette variable
  <Pressable
    onPressIn={() => setIsPressed(true)}          // ← supprimer
    onPressOut={() => setIsPressed(false)}        // ← supprimer
    style={[...sans neuShadow spread...]}
  >...</Pressable>
)
if (variant === 'ghost') return pressable         // ← supprimer
return <NeuShadow ...>{pressable}</NeuShadow>     // ← supprimer
```

## État cible de Button.tsx (après revert)
```tsx
import React from 'react'
// Pas d'import NeuShadow, pas de useState

const { colors, neuShadow } = useTheme()
// Pas de isPressed state

return (
  <Pressable
    style={({ pressed }) => [
      styles.base,
      styles[`size_${size}` as keyof typeof styles] as ViewStyle,
      styles[`variant_${variant}` as keyof typeof styles] as ViewStyle,
      variant !== 'ghost' && (pressed ? neuShadow.pressed : neuShadow.elevated),
      fullWidth && styles.fullWidth,
      disabled && styles.disabled,
      style,
    ].filter(Boolean)}
    onPress={handlePress}
    disabled={disabled}
  >
    {({ pressed }) => (
      <>
        {variant === 'primary' && !pressed && (
          <LinearGradient
            colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFillObject, { borderRadius: borderRadius.sm }]}
          />
        )}
        {typeof children === 'string' ? (
          <Text style={textStyles}>{children}</Text>
        ) : (
          children
        )}
      </>
    )}
  </Pressable>
)
```

## Étapes

### 1. Lire Button.tsx en entier
Lire `mobile/src/components/Button.tsx` pour voir l'état exact avant modification.

### 2. Réécrire Button.tsx
Appliquer les changements décrits dans "État cible" ci-dessus :
- Ligne 1 : `import React from 'react'` (pas de `useState`)
- Retirer `import { NeuShadow } from './NeuShadow'`
- `const { colors, neuShadow } = useTheme()` (ajouter `neuShadow`)
- Supprimer `const [isPressed, setIsPressed] = useState(false)`
- Supprimer `const pressable = (...)`
- Supprimer `onPressIn` et `onPressOut`
- Supprimer `if (variant === 'ghost') return pressable`
- Supprimer le return `<NeuShadow>...</NeuShadow>`
- Restaurer le return `<Pressable ...>` direct avec `neuShadow.pressed / .elevated`
- Conserver le `LinearGradient` sur primary intact

### 3. Supprimer NeuShadow.tsx
```bash
# Dans mobile/src/components/
# Supprimer le fichier (avec Bash ou en le remplaçant par un fichier vide puis suppression)
```
Utiliser la commande bash :
```bash
rm mobile/src/components/NeuShadow.tsx
```

### 4. Vérifier TypeScript
```bash
cd mobile && npx tsc --noEmit
```
Zéro erreur attendu. Si erreur → vérifier qu'il n'y a plus d'import de NeuShadow nulle part.

### 5. Tests
```bash
cd mobile && npm test -- --passWithNoTests 2>&1 | tail -5
```

## Contraintes
- Conserver le `LinearGradient` sur le bouton primary — ne pas le supprimer
- `style` prop de Button doit rester sur le `<Pressable>` (layout externe)
- Pas de `any` TypeScript
- Le `disabled` prop doit rester fonctionnel (opacity 0.5)
- Ne pas modifier les styles (sizes, variants) — seulement la gestion des ombres

## Critères de validation
- `npx tsc --noEmit` → zéro erreur
- `npm test` → zéro fail sur les tests Button
- `NeuShadow.tsx` n'existe plus dans `mobile/src/components/`
- Button affiche l'ombre native simple (elevation Android, shadowColor iOS)

## Dépendances
Aucune dépendance sur Groupe B. Peut tourner en parallèle.

## Statut
✅ Résolu — 20260226-2145

## Résolution
Rapport do : docs/bmad/do/20260226-2145-style-button-revert-neushadow.md
