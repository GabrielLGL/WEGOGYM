<!-- v1.0 — 2026-02-22 -->
# Rapport — Supprimer Tab Bar — Groupe B — 20260222-2300

## Objectif
Mettre a jour le HomeScreen pour supprimer toute reference au Tab Navigator (MainTabParamList, TAB_ROUTES, navigation composite). Toutes les routes deviennent des stack routes directes.

## Fichiers concernes
- `mobile/src/screens/HomeScreen.tsx`

## Contexte technique
- Le HomeScreen utilise actuellement un type `CompositeNavigationProp` combinant `BottomTabNavigationProp` et `NativeStackNavigationProp`.
- Il a un set `TAB_ROUTES` pour distinguer les routes tab vs stack.
- Apres le Groupe A, il n'y a plus de Tab Navigator — toutes les routes sont dans le Stack.
- Le type `MainTabParamList` n'existera plus apres le Groupe A.
- Le `paddingBottom: spacing.xl + 60` dans `content` style compense la tab bar — a supprimer.

## Etapes

### 1. Mettre a jour les imports
Remplacer :
```typescript
import { useNavigation, CompositeNavigationProp } from '@react-navigation/native'
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList, MainTabParamList } from '../navigation'
```
Par :
```typescript
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../navigation'
```

### 2. Simplifier le type de navigation
Remplacer :
```typescript
type HomeNavigation = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>
```
Par :
```typescript
type HomeNavigation = NativeStackNavigationProp<RootStackParamList, 'Home'>
```

### 3. Supprimer TAB_ROUTES
Supprimer la ligne :
```typescript
const TAB_ROUTES = new Set<string>(['Exercices', 'Assistant', 'Stats', 'Home'])
```

### 4. Simplifier handleTilePress
Remplacer la fonction `handleTilePress` par :
```typescript
const handleTilePress = (tile: Tile) => {
  haptics.onPress()
  try {
    navigation.navigate(tile.route as keyof RootStackParamList as never)
  } catch {
    if (__DEV__) console.warn(`[HomeScreen] Route "${tile.route}" non disponible`)
  }
}
```
(Plus besoin de distinguer tab routes vs stack routes — tout est stack maintenant)

### 5. Ajuster le padding du content
Dans les styles, remplacer :
```typescript
content: {
  padding: spacing.md,
  paddingBottom: spacing.xl + 60,  // 60 = hauteur tab bar
},
```
Par :
```typescript
content: {
  padding: spacing.md,
  paddingBottom: spacing.xl,
},
```

## Contraintes
- Ne pas modifier la structure visuelle du dashboard (header card, sections, tuiles)
- Ne pas toucher au withObservables HOC
- Ne pas toucher aux KPI/motivational phrase
- Garder l'export `HomeContent` pour les tests
- Respecter : pas de `any`, pas de hardcoded colors

## Criteres de validation
- `npx tsc --noEmit` → zero erreur
- `npm test` → zero fail
- Toutes les tuiles naviguent correctement (Programs, Exercices, Stats*, Assistant, Settings)
- Le dashboard reste visuellement identique (sans espace vide en bas)

## Dependances
Depend du **Groupe A** (navigation restructuree, MainTabParamList supprime).
Si lance avant le Groupe A, les imports de MainTabParamList causeraient des erreurs TypeScript.

## Statut
⏳ En attente
