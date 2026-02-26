# Passe 2 — Tests — 20260226-0224

## Résultat

**⚠️ Jest : 47/47 suites PASS, 840/840 tests PASS — mais exit code 1**

```
Test Suites: 47 passed, 47 total
Tests:       840 passed, 840 total
Snapshots:   0 total
Time:        19.267 s
```

## Cause du exit code 1

`WorkoutSummarySheet.test.tsx` provoque deux `ReferenceError` après teardown :

```
ReferenceError: You are trying to access a property or method of the Jest
environment after it has been torn down.
From src/components/__tests__/WorkoutSummarySheet.test.tsx.
  at Timeout.now [as _onTimeout] (node_modules/react-native/jest/setup.js:58:55)
```

**Cause :** Le composant `WorkoutSummarySheet` utilise `BottomSheet`, qui démarre
une `Animated.timing()` à la montée. Plusieurs tests ne call pas `jest.useFakeTimers()`,
donc l'animation utilise de vrais timers qui s'exécutent APRÈS le teardown du test.

**Fix requis :** Ajouter `afterEach(() => { jest.clearAllTimers() })` dans le fichier de test,
et encadrer le rendu dans des tests qui n'utilisent pas de fake timers.

## Fichiers critiques sans tests

Aucun fichier critique identifié sans couverture. Les hooks, screens, services et modèles
sont couverts.
