<!-- v1.0 — 2026-03-01 -->
# Rapport — Exercise Catalog — Groupe C — 20260301-1930

## Objectif
Brancher `ExerciseCatalogScreen` dans la navigation et ajouter un point d'entrée
depuis `ExercisesScreen` (bouton "Catalogue" ou icône dans le header).

## Fichiers concernés
- `mobile/src/navigation/index.tsx` — ajouter la route `ExerciseCatalog`
- `mobile/src/screens/ExercisesScreen.tsx` — ajouter bouton d'accès au catalogue

## Contexte technique

### Navigation actuelle (extrait pertinent)
```typescript
// mobile/src/navigation/index.tsx
import ExercisesScreen from '../screens/ExercisesScreen'
import CreateExerciseScreen from '../screens/CreateExerciseScreen'

// Dans le Stack.Navigator :
<Stack.Screen name="Exercices" component={ExercisesScreen} options={{ title: t.navigation.exercises }} />
<Stack.Screen name="CreateExercise" component={CreateExerciseScreen} options={{ title: t.exercises.newTitle }} />
```

Le projet utilise **React Navigation 7 — Native Stack uniquement**.
Pas de Bottom Tabs. Le HomeScreen est le hub de navigation.

### RootStackParamList (type navigation)
Chercher dans `navigation/index.tsx` la définition de `RootStackParamList` et y ajouter :
```typescript
ExerciseCatalog: undefined
```

### Pattern de navigation vers un écran sans paramètre
```typescript
navigation.navigate('ExerciseCatalog')
```

### ExercisesScreen — structure actuelle
- Header avec titre géré par la navigation
- Bouton "Créer un exercice" (bouton flottant ou dans le header)
- ChipSelector filtres muscles + équipement
- SearchBar
- FlatList exercices
- Accès à `navigation` via prop

### Thème et i18n
- `useColors()` pour toutes les couleurs
- `useLanguage()` pour `{ t }`
- Icône "globe" ou "search" pour le catalogue (Ionicons)
- Label : "Catalogue" (FR) / "Catalog" (EN) — peut être hardcodé pour l'instant

## Étapes

### 1. `mobile/src/navigation/index.tsx` — ajouter la route

**a)** Import du nouvel écran :
```typescript
import ExerciseCatalogScreen from '../screens/ExerciseCatalogScreen'
```

**b)** Ajouter `ExerciseCatalog: undefined` dans `RootStackParamList`.

**c)** Ajouter le `Stack.Screen` dans le Navigator, après `CreateExercise` :
```tsx
<Stack.Screen
  name="ExerciseCatalog"
  component={ExerciseCatalogScreen}
  options={{ title: 'Catalogue global' }}
/>
```

### 2. `mobile/src/screens/ExercisesScreen.tsx` — ajouter point d'entrée

**Option retenue** : ajouter une icône dans le header de l'écran Exercices (headerRight).
Utiliser `useLayoutEffect` ou `navigation.setOptions` depuis le composant.

```tsx
// Dans ExercisesScreen, récupérer navigation via prop ou hook
React.useLayoutEffect(() => {
  navigation.setOptions({
    headerRight: () => (
      <TouchableOpacity
        onPress={() => {
          haptics.onPress()
          navigation.navigate('ExerciseCatalog')
        }}
        style={{ marginRight: spacing.md }}
      >
        <Ionicons name="globe-outline" size={24} color={colors.primary} />
      </TouchableOpacity>
    ),
  })
}, [navigation, colors, haptics])
```

**Alternative si ExercisesScreen n'a pas accès à `navigation` directement** :
Utiliser `useNavigation()` hook de React Navigation.

### 3. Vérification TypeScript du type navigation
Si `ExercisesScreen` est wrappé dans `withObservables` et ne reçoit pas `navigation`
directement en prop, utiliser :
```typescript
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
```

## Contraintes
- **Pas** de Bottom Tabs — navigation Native Stack uniquement ✓
- **Haptics** sur le bouton d'accès : `haptics.onPress()`
- **Toutes les couleurs** via `useColors()`
- **PAS** de `any` TypeScript
- Ne pas casser la navigation existante (Exercices, CreateExercise, etc.)

## Critères de validation
- `npx tsc --noEmit` dans `mobile/` → zéro erreur
- La route `ExerciseCatalog` est accessible depuis `ExercisesScreen`
- Le bouton/icône s'affiche correctement dans le header
- La navigation fonctionne (aller + retour arrière)
- Aucune régression sur les écrans existants

## Dépendances
**Ce groupe dépend de : Groupe B** (`ExerciseCatalogScreen` doit exister)

## Statut
⏳ En attente
