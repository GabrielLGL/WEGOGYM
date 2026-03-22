# Passe 4/8 — Bugs silencieux

**Date :** 2026-03-22

## Résultat

### 🔴 CRIT-1 — Boucle infinie useEffect (HistoryDetailScreen)
- **Cause racine :** Mock `UnitContextMock.ts` retourne des fonctions instables → useEffect dep change → setState → re-render → boucle infinie.
- **Impact :** OOM en test. Pas d'impact en production (UnitContext.useMemo stabilise les refs).
- **Fix :** Constantes stables extraites hors de `useUnits()` dans le mock.

### 🟡 WARN-2 — Non-null assertion WEARABLE_PROVIDER
- **Fichier :** `services/wearableSyncService.ts:192,212`
- **Description :** `WEARABLE_PROVIDER!` pourrait écrire `null` en DB si le provider n'est pas défini.
- **Fix :** Remplacé par `WEARABLE_PROVIDER ?? 'unknown'`

### 🟡 WARN-3 — Async handlers sans try/catch (SettingsNotifications)
- **Fichier :** `components/settings/SettingsNotificationsSection.tsx:66,122`
- **Description :** `handleToggleStreakAlerts` et `handleToggleReminders` sans try/catch.
- **Fix :** Ajouté try/catch avec log `__DEV__`

### 🟡 WARN-4 — PR date calcul avec createdAt null
- **Fichier :** `screens/ExerciseCardScreen.tsx:156`
- **Description :** `s.createdAt?.getTime() ?? 0` pour Math.max — un set avec createdAt null serait traité comme epoch 0.
- **Fix :** Filtre `prSets.filter(s => s.createdAt != null)` avant calcul

## Scans effectués
- ✅ Mutations WDB hors write() — Toutes les mutations sont dans database.write()
- ✅ Fuites mémoire — Tous les setTimeout/setInterval ont des cleanups
- ✅ Race conditions — Pas de setState après unmount détecté
