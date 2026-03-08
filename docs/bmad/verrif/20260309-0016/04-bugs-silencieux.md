# Passe 4/8 — Bugs silencieux

**Date :** 2026-03-09 00:16

## Résultats du scan

### 🔴 Critiques (crashes, data loss)

**1. `duplicateSession` ne copie pas tous les champs de SessionExercise**
- **Fichier** : `hooks/useProgramManager.ts:150-162`
- **Type** : Data loss silencieuse
- **Description** : Les champs `restTime`, `supersetId`, `supersetType`, `supersetPosition`, `setsTargetMax`, `notes` ne sont pas copiés. Violation du pitfall CLAUDE.md.
- **Fix** : Ajouter les champs manquants dans le callback `create`.

**2. `handleConfirmEnd` — async sans try/catch**
- **Fichier** : `screens/WorkoutScreen.tsx:228-244`
- **Type** : Crash non intercepté
- **Fix** : Envelopper dans try/catch.

**3. `HistoryDetailScreen` — fetch exercises sans annulation**
- **Fichier** : `screens/HistoryDetailScreen.tsx:101-116`
- **Type** : State update after unmount / race condition
- **Fix** : Ajouter un flag `cancelled` dans le useEffect.

**4. `WorkoutScreen` — notification setup sans annulation**
- **Fichier** : `screens/WorkoutScreen.tsx:198-205`
- **Type** : State update after unmount (sévérité réduite : ref, pas setState)

### 🟡 Warnings

**5. `handleConfirmAbandon` — pas de feedback en cas d'erreur**
- **Fichier** : `screens/WorkoutScreen.tsx:246-253`

**6. `BadgeCelebration` — textes en dur non traduits**
- **Fichier** : `components/BadgeCelebration.tsx:28-31`
- **Description** : `"Nouveau badge !"` et `"Super !"` en dur.

**7. `HomeScreen` — accès `lastCompletedHistory.session.id` potentiellement dangereux**
- **Fichier** : `screens/HomeScreen.tsx:183,289`
- **Type** : Null safety

**8. `AnimatedSplash` — import statique de `colors` au lieu de `useColors()`**
- **Fichier** : `components/AnimatedSplash.tsx:12,68`
- **Type** : Theme non réactif

**9. `navigation/index.tsx` — `JSON.parse(reminderDays)` sans try/catch**
- **Fichier** : `navigation/index.tsx:249`
- **Type** : Crash potentiel au démarrage

### 🔵 Info

**10-14. `useStyles` pas mémoïsé** dans HistoryDetailScreen, MilestoneCelebration, BadgeCelebration, RestTimer (performance mineure).

## Résumé

| Sévérité | Nombre | Fichiers principaux |
|----------|--------|---------------------|
| 🔴 Critique | 4 | useProgramManager.ts, WorkoutScreen.tsx, HistoryDetailScreen.tsx |
| 🟡 Warning | 5 | BadgeCelebration.tsx, HomeScreen.tsx, AnimatedSplash.tsx, navigation/index.tsx |
| 🔵 Info | 5 | HistoryDetailScreen.tsx, MilestoneCelebration.tsx, BadgeCelebration.tsx, RestTimer.tsx |
