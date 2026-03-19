# Tache K — Navigation type safety (supprimer `as never`) — 20260319-2100

## Objectif
Supprimer tous les casts `as never` dans les appels `navigation.navigate()`. Utiliser le typage correct de React Navigation pour que TypeScript valide les routes.

## Fichiers a modifier
Chercher tous les fichiers avec `as never` dans mobile/src/ :
- `mobile/src/components/home/HomeHeroAction.tsx` (ligne ~86)
- `mobile/src/components/home/HomeNavigationGrid.tsx` (ligne ~63)
- `mobile/src/components/home/HomeStatusStrip.tsx` (ligne ~91)
- `mobile/src/components/home/HomeInsightsSection.tsx`
- `mobile/src/screens/StatsScreen.tsx` (ligne ~106)
- Tout autre fichier trouvé via `grep -r "as never" mobile/src/`

## Contexte technique

### Pourquoi `as never` ?
Les composants utilisent `useNavigation()` sans passer le type generique, ou passent une string variable comme route. React Navigation ne peut pas verifier que la route existe.

### Solution
Utiliser `useNavigation<NativeStackNavigationProp<RootStackParamList>>()` avec le bon type :

```tsx
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../navigation'

const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()

// Avant :
navigation.navigate(route as never)

// Apres :
navigation.navigate(route)  // TypeScript valide si route est un keyof RootStackParamList
```

### Cas des routes dynamiques
Si la route vient d'une variable string :
```tsx
// Si la variable est typee keyof RootStackParamList → pas besoin de cast
const route: keyof RootStackParamList = 'Programs'
navigation.navigate(route) // OK

// Si c'est un tableau d'objets avec route: keyof RootStackParamList → typer le tableau
interface Shortcut {
  route: keyof RootStackParamList
  label: string
}
```

### RootStackParamList
Le type est defini dans `mobile/src/navigation/index.tsx`. Il contient toutes les routes valides. Verifier que chaque route utilisee avec `as never` existe bien dans ce type.

Si une route n'existe PAS dans RootStackParamList (comme potentiellement `ReportDetail` qui pourrait etre `ReportDetail` avec des params optionnels), il faut :
1. Verifier que la route existe dans navigation/index.tsx
2. Si elle existe avec des params obligatoires, passer les params ou les rendre optionnels

## Etapes
1. `grep -r "as never" mobile/src/` pour trouver tous les fichiers
2. Pour chaque fichier : verifier que `useNavigation` a le bon type generique
3. Supprimer le `as never` et verifier que TS compile
4. Si erreur TS → verifier que la route existe dans RootStackParamList
5. `npx tsc --noEmit` → 0 erreur
6. `npm test` → 0 fail

## Contraintes
- NE PAS modifier `navigation/index.tsx` (sauf si une route manque et existe deja comme ecran)
- NE PAS ajouter de nouvelles routes
- Si un `as never` ne peut pas etre supprime proprement, le documenter en commentaire

## Criteres de validation
- `npx tsc --noEmit` → 0 erreur
- `npm test` → 2231+ passed
- Zero `as never` dans mobile/src/ (ou justifie par un commentaire)

## Dependances
Aucune.

## Statut
✅ Résolu — 20260319-2200

## Résolution
Rapport do : docs/bmad/do/20260319-2200-refactor-nav-typesafety.md
