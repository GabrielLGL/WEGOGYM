<!-- v1.0 — 2026-02-26 -->
# Rapport — Magic numbers → constantes theme — Groupe D — 20260226-1120

## Objectif
Remplacer les valeurs numériques en dur dans les `StyleSheet.create()` par des constantes
du fichier `mobile/src/theme/index.ts`. Cela améliore la cohérence visuelle et la
maintenabilité du thème.

## Fichiers concernés
Écrans et composants contenant des magic numbers — liste indicative (à compléter au scan) :
```
mobile/src/screens/ExercisesScreen.tsx
mobile/src/screens/ProgramsScreen.tsx
mobile/src/screens/ChartsScreen.tsx
mobile/src/screens/AssistantScreen.tsx
mobile/src/screens/HomeScreen.tsx
mobile/src/screens/SessionDetailScreen.tsx
mobile/src/screens/SettingsScreen.tsx
mobile/src/screens/StatsCalendarScreen.tsx
mobile/src/screens/StatsMeasurementsScreen.tsx
mobile/src/screens/StatsScreen.tsx
mobile/src/screens/StatsVolumeScreen.tsx
mobile/src/screens/StatsDurationScreen.tsx
mobile/src/screens/StatsRepartitionScreen.tsx
mobile/src/components/BadgeCard.tsx
mobile/src/components/BadgeCelebration.tsx
mobile/src/components/ErrorBoundary.tsx
mobile/src/theme/index.ts  ← si ajout de nouvelles constantes
```

## Contexte technique
Le fichier `mobile/src/theme/index.ts` exporte :

### `fontSize` (déjà existant)
```ts
export const fontSize = {
  xs: 12, sm: 14, md: 16, lg: 18, xl: 20, xxl: 24, xxxl: 28, hero: 32
}
```

### `borderRadius` (déjà existant)
```ts
export const borderRadius = {
  sm: 8, md: 12, lg: 20, xl: 24
}
```

### `spacing` (déjà existant)
```ts
export const spacing = {
  xs: 4, sm: 8, ms: 12, md: 16, lg: 24, xl: 32, xxl: 40
}
```

### `colors` (déjà existant — NE PAS toucher aux colors dans ce groupe)

## Étapes

### 1. Scanner les valeurs existantes
Chercher dans `mobile/src/screens/` et `mobile/src/components/`:
- `fontSize: [0-9]+`
- `borderRadius: [0-9]+`
- Optionnel : `padding: [0-9]+`, `margin: [0-9]+` (seulement si correspondance exacte)

### 2. Correspondances fontSize
Remplacer uniquement les valeurs ayant une correspondance EXACTE :
```
fontSize: 12  →  fontSize.xs
fontSize: 14  →  fontSize.sm
fontSize: 16  →  fontSize.md
fontSize: 18  →  fontSize.lg
fontSize: 20  →  fontSize.xl
fontSize: 24  →  fontSize.xxl
fontSize: 28  →  fontSize.xxxl
fontSize: 32  →  fontSize.hero
```

**Valeurs sans correspondance exacte** (11, 13, 15, 17, 22, 26, 48...) :
- Si une valeur apparaît dans **3 fichiers ou plus** → ajouter une constante dans `fontSize` dans `theme/index.ts`
- Sinon → laisser en dur (pas de sur-ingénierie)

Constantes à ajouter si nécessaire (après comptage) :
```ts
// Candidats potentiels (à vérifier au scan)
caption: 11,   // labels très petits
body: 13,      // sous-textes
bodyMd: 15,    // corps standard
title: 17,     // titres de liste
icon: 22,      // icônes emoji
```

### 3. Correspondances borderRadius
```
borderRadius: 8   →  borderRadius.sm
borderRadius: 12  →  borderRadius.md
borderRadius: 16  →  (aucune — ajouter `borderRadius.xl2: 16` si fréquent, sinon laisser)
borderRadius: 20  →  borderRadius.lg
borderRadius: 24  →  borderRadius.xl
```

### 4. Mettre à jour les imports dans chaque fichier
Ajouter `fontSize`, `borderRadius` (et/ou `spacing`) aux imports du theme :
```tsx
// Avant
import { colors } from '../theme'
// Après
import { colors, fontSize, borderRadius } from '../theme'
```

### 5. Remplacer les valeurs dans les StyleSheet
Exemple :
```tsx
// Avant
exoTitle: { color: colors.text, fontSize: 17, fontWeight: '600' },
// Après (si 17 n'a pas de match et est peu fréquent, laisser)

// Avant
addButton: { backgroundColor: colors.primary, padding: 16, borderRadius: 12 },
// Après
addButton: { backgroundColor: colors.primary, padding: 16, borderRadius: borderRadius.md },
```

## Contraintes
- **NE PAS modifier** les logiques métier — uniquement les `StyleSheet.create()`
- **NE PAS** remplacer les valeurs dans les `style` inline (props JSX) — uniquement dans `StyleSheet.create()`
- **Pas de sur-ingénierie** : ne pas créer une constante pour une valeur qui n'apparaît qu'une fois
- **Respecter le seuil** : seulement créer de nouvelles constantes si valeur présente dans 3+ fichiers
- Pas de `any` TypeScript
- Conserver le comportement visuel exact (ne pas changer les valeurs, juste les référencer)

## Critères de validation
- `npx tsc --noEmit` → zéro erreur TypeScript
- `npm test` → zéro fail (les styles ne sont pas testés unitairement, mais les composants le sont)
- Vérification manuelle : toutes les remplacements utilisent une constante theme ou conservent la valeur exacte d'origine

## Dépendances
Aucune dépendance sur Groupe A ou B. Peut être lancé en parallèle.

## Statut
⏳ En attente
