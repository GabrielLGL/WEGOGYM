# feat(settings) — Section Wearables dans SettingsScreen
Date : 2026-03-11 21:30

## Instruction
docs/bmad/prompts/20260311-2210-wearables-C.md

## Rapport source
docs/bmad/prompts/20260311-2210-wearables-C.md

## Classification
Type : feat
Fichiers modifiés :
- `mobile/src/components/settings/SettingsWearableSection.tsx` (nouveau)
- `mobile/src/components/settings/index.ts`
- `mobile/src/screens/SettingsScreen.tsx`
- `mobile/src/i18n/fr.ts`
- `mobile/src/i18n/en.ts`

## Ce qui a été fait
- Créé `SettingsWearableSection` : composant complet pour la gestion wearables dans Settings
  - État de connexion (connecté/déconnecté) avec provider affiché
  - Bouton Connecter (demande permissions + première synchro) / Déconnecter (AlertDialog confirmation)
  - Toggle synchro automatique du poids (Switch persisté en DB)
  - Bouton "Synchroniser maintenant" : importe les pesées vers BodyMeasurement, crée WearableSyncLog, met à jour lastSyncAt
  - Historique des synchros en BottomSheet (10 dernières, avec icônes statut)
  - Déduplique les mesures par jour (ne crée pas de doublon)
  - "Dernière synchro : il y a X" avec formatage relatif
  - Section masquée si WEARABLE_PROVIDER === null (ni Android ni iOS)
- Ajouté traductions FR et EN (wearable.*, settings.groups.wearable)
- Exporté via settings/index.ts
- Intégré dans SettingsScreen entre AI et System

## Vérification
- TypeScript : ✅
- Tests : ✅ 1734 passed
- Nouveau test créé : non

## Documentation mise à jour
aucune

## Statut
✅ Résolu — 20260311-2130

## Commit
40bd152 feat(settings): wearable section — connect, sync, history UI
