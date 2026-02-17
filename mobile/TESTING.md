# Guide de Tests - WEGOGYM Mobile

## Installation des dépendances de test

Installez les dépendances de développement nécessaires pour les tests :

```bash
npm install --save-dev \
  jest@^29.7.0 \
  jest-expo@^52.0.1 \
  @testing-library/react-native@^12.4.3 \
  @testing-library/jest-native@^5.4.3 \
  @testing-library/react-hooks@^8.0.1 \
  @types/jest@^29.5.11 \
  react-test-renderer@18.3.1
```

## Commandes de test

```bash
# Exécuter tous les tests
npm test

# Exécuter les tests en mode watch (auto-reload)
npm run test:watch

# Exécuter les tests avec rapport de couverture
npm run test:coverage
```

## Structure des tests

```
mobile/src/
├── components/__tests__/
│   ├── AlertDialog.test.tsx
│   └── Button.test.tsx
├── hooks/__tests__/
│   ├── useHaptics.test.ts
│   └── useModalState.test.ts
└── model/utils/__tests__/
    ├── databaseHelpers.test.ts
    └── validationHelpers.test.ts
```

## Tests disponibles

### 1. Validation Helpers (`validationHelpers.test.ts`)

Tests des fonctions de validation :
- ✅ `isValidText()` - Validation de texte non vide
- ✅ `isValidNumeric()` - Validation de valeurs numériques
- ✅ `validateWorkoutInput()` - Validation des entrées d'entraînement
- ✅ `validateMuscles()` - Validation de la sélection de muscles
- ✅ `validateExerciseInput()` - Validation des données d'exercice

**Coverage:** ~100% des fonctions de validation

### 2. Database Helpers (`databaseHelpers.test.ts`)

Tests des fonctions utilitaires de base de données :
- ✅ `parseNumericInput()` - Parsing de valeurs numériques
- ✅ `parseIntegerInput()` - Parsing de valeurs entières
- ✅ `filterExercises()` - Filtrage par muscle/équipement
- ✅ `searchExercises()` - Recherche par nom
- ✅ `filterAndSearchExercises()` - Combinaison filtres + recherche

**Coverage:** Fonctions pures uniquement (pas de tests DB asynchrones pour l'instant)

### 3. Hooks (`useHaptics.test.ts`, `useModalState.test.ts`)

Tests des hooks personnalisés :
- ✅ `useHaptics()` - API sémantique de feedback haptique
- ✅ `useModalState()` - Gestion d'état de modal avec sync tab bar
- ✅ `useMultiModalSync()` - Synchronisation multi-modals

**Coverage:** ~100% des branches de logique

### 4. Composants (`Button.test.tsx`, `AlertDialog.test.tsx`)

Tests des composants UI réutilisables :
- ✅ `<Button>` - Composant de bouton unifié
- ✅ `<AlertDialog>` - Modal de confirmation

**Coverage:** Rendering, interactions, variants, props

## Conventions de test

### Naming

- Fichiers de test : `*.test.ts` ou `*.test.tsx`
- Dossier : `__tests__/` dans le même dossier que le code testé
- Describe blocks : Nom du fichier/fonction testée
- Test cases : `should <comportement attendu>`

### Structure

```typescript
import { functionToTest } from '../moduleToTest'

describe('functionToTest', () => {
  beforeEach(() => {
    // Setup avant chaque test
  })

  it('should do something', () => {
    // Arrange
    const input = 'test'

    // Act
    const result = functionToTest(input)

    // Assert
    expect(result).toBe('expected')
  })
})
```

### Mocking

Les mocks globaux sont définis dans les tests :
- `expo-haptics` : Mocké pour tester les appels haptiques
- `react-native` : DeviceEventEmitter mocké pour tests de sync
- `@gorhom/portal` : Portal mocké pour rendering simple

## Métriques de couverture

Objectifs de couverture :
- **Validation helpers:** 100% (critique pour la sécurité des données)
- **Database helpers:** 80%+ (fonctions pures uniquement)
- **Hooks:** 80%+ (logique métier)
- **Composants:** 70%+ (UI + interactions)

Exécutez `npm run test:coverage` pour voir le rapport détaillé.

## Ajouter de nouveaux tests

### Pour une nouvelle fonction utilitaire

1. Créer `src/path/to/__tests__/myUtil.test.ts`
2. Importer la fonction à tester
3. Écrire des tests pour tous les cas (happy path + edge cases)
4. Exécuter `npm test` pour valider

### Pour un nouveau composant

1. Créer `src/components/__tests__/MyComponent.test.tsx`
2. Utiliser `@testing-library/react-native` pour le rendering
3. Tester le rendering, les interactions utilisateur, les props
4. Mocker les dépendances externes (haptics, navigation, etc.)

### Pour un nouveau hook

1. Créer `src/hooks/__tests__/useMyHook.test.ts`
2. Utiliser `renderHook` de `@testing-library/react-hooks`
3. Tester les valeurs retournées et les effets de bord
4. Mocker les dépendances (DeviceEventEmitter, etc.)

## Debugging des tests

```bash
# Mode verbose (affiche console.log)
npm test -- --verbose

# Test spécifique
npm test -- validationHelpers.test.ts

# Watch mode avec pattern
npm run test:watch -- --testNamePattern="isValidText"
```

## CI/CD

Ces tests sont conçus pour être exécutés dans un pipeline CI/CD :

```yaml
# Exemple GitHub Actions
- name: Run tests
  run: npm test

- name: Upload coverage
  run: npm run test:coverage
```

## Ressources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
