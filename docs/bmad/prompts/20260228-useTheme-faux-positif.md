# Rapport — CR-3 : SettingsScreen useTheme() vs useColors()

**Date :** 2026-02-28
**Source :** verrif 20260228-2026, CR-3 (🟡 warning)
**Verdict : Faux positif — aucun changement nécessaire**

---

## Ticket initial

> "SettingsScreen : utilise `useTheme()` au lieu de `useColors()`"

## Analyse

`SettingsScreen.tsx:34` destructure **4 propriétés** depuis `useTheme()` :

```tsx
const { colors, isDark, toggleTheme, neuShadow } = useTheme()
```

| Propriété | Usages | Rôle |
|-----------|--------|------|
| `colors` | ~35 | Styles dynamiques |
| `isDark` | conditions | Affichage conditionnel dans le rendu |
| `toggleTheme` | bouton | Bascule thème clair/sombre |
| `neuShadow` | `createStyles()` | Ombres neumorphes |

`useColors()` est défini comme alias minimal :

```tsx
/** Alias pratique pour les composants qui ont juste besoin des couleurs */
export function useColors(): ThemeColors {
  return useTheme().colors
}
```

## Conclusion

`useColors()` est prévu pour les composants qui n'ont besoin **que** des couleurs.
`SettingsScreen` a besoin de `isDark`, `toggleTheme`, et `neuShadow` en plus des couleurs.

Utiliser `useColors()` obligerait à appeler `useTheme()` en parallèle pour les 3 autres propriétés → **deux appels de contexte redondants**.

**L'usage actuel de `useTheme()` est correct et optimal.**

## Action

- Aucune modification de code
- Ticket supprimé du backlog
