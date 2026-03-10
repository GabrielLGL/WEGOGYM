# Passe 3/8 — Code Review

**Run:** 20260310-1830

## Focus : 4 changements récents

### 1. ExerciseCard withObservables (HistoryDetailScreen.tsx)
- **Pattern correct** : 3 couches withObservables (historyId→history, history→sets+session, exerciseId→exercise)
- **Props flow** : ExerciseCardInner reçoit tous les props nécessaires
- **findAndObserve** : risque mineur si exercice supprimé pendant affichage (mitigé car sets disparaissent d'abord)

### 2. recalculateSetPrsBatch (workoutSetUtils.ts)
- **Promise.all → Promise.allSettled** : corrigé (une erreur ne bloque plus les autres)
- **Histories partagées** : lecture seule, pas de mutation → safe
- **database.write() concurrent** : WatermelonDB sérialise en interne → OK

### 3. celebrationQueueRef (HomeScreen.tsx)
- **useRef pattern correct** : ref lue dans handleCloseCelebration, pas de stale closure
- **Synchronous update** : `.current = queue.slice(1)` avant `setCurrentCelebration` → safe même si appelé rapidement

### 4. Schema v34 migration (migrations.ts + schema.ts)
- **Version sync** : schema.ts v34, migration toVersion: 34 — conforme
- **unsafeExecuteSql** : `CREATE INDEX IF NOT EXISTS` — idempotent, correct
- **isIndexed + SQL index** : doublon bénin (noms différents, pas de conflit)

## Conformité patterns
- Portal pattern (AlertDialog, pas de Modal natif) ✓
- database.write() pour toutes mutations ✓
- recalculateSetPrsBatch hors de write (pas de nested write) ✓
- useHaptics() sémantique ✓
- useColors() / theme ✓
- __DEV__ guard sur console.error/warn ✓
