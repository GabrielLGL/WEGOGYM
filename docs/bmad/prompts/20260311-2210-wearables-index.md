<!-- v1.0 — 2026-03-11 -->
# Prompt — Intégration wearables — 20260311-2210

## Demande originale
`FINAL` Intégration wearables (Google Fit, Apple Health, Garmin)

## Scope retenu (MVP)
- ✅ **Health Connect** (Android — remplace Google Fit, API moderne)
- ✅ **HealthKit** (iOS — Apple Health)
- ⚠️ **Garmin** : hors scope MVP — requiert backend OAuth + webhooks serveur. À planifier séparément comme feature backend.

## Groupes générés
| Groupe | Rapport | Fichiers | Vague | Statut |
|--------|---------|----------|-------|--------|
| A | `20260311-2210-wearables-A.md` | schema.ts, migrations.ts, User.ts, WearableSyncLog.ts, model/index.ts | 1 | ⏳ |
| B | `20260311-2210-wearables-B.md` | package.json, wearableService.ts, healthConnectService.ts, healthKitService.ts | 1 | ⏳ |
| C | `20260311-2210-wearables-C.md` | SettingsScreen.tsx, fr.ts, en.ts | 2 | ⏳ |

## Ordre d'exécution

### Vague 1 — Parallèle
- **Groupe A** (Backend) : Schema v38 + User fields + WearableSyncLog
- **Groupe B** (Services) : Install packages + service abstraction + implementations Health Connect / HealthKit

A et B sont indépendants — aucun fichier en commun.

### Vague 2 — Séquentiel (après vague 1)
- **Groupe C** (UI) : Section Wearables dans SettingsScreen + traductions
  - Dépend de A (modèle User modifié + WearableSyncLog) et B (wearableService)

## Résumé technique
- **Schema** : v37 → v38 (3 nouveaux champs dans `users`, nouvelle table `wearable_sync_logs`)
- **Nouvelles dépendances** : `react-native-health-connect` (Android) + `react-native-health` (iOS)
- **Nouveaux fichiers** : WearableSyncLog.ts, wearableService.ts, healthConnectService.ts, healthKitService.ts
- **Fichiers modifiés** : schema.ts, migrations.ts, User.ts, model/index.ts, SettingsScreen.tsx, fr.ts, en.ts
- **Garmin** : TODO commenté dans wearableService.ts, feature backend à planifier à part
