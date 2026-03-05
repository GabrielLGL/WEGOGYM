# fix(settings) — Corrections review rappels
Date : 2026-03-05 23:40

## Instruction
/do docs/bmad/reviews/20260305-2330-review.md

## Rapport source
docs/bmad/reviews/20260305-2330-review.md

## Classification
Type : fix
Fichiers modifiés :
- mobile/src/screens/SettingsScreen.tsx (RGPD delete + import cancelAllReminders)
- mobile/src/services/notificationService.ts (fix commentaire trompeur)

## Ce qui a été fait
1. **RGPD handleDeleteAllData** : Ajout reset des 4 champs rappels (`remindersEnabled=false`, `reminderDays=null`, `reminderHour=18`, `reminderMinute=0`) + appel `cancelAllReminders()` avant `deleteApiKey()`
2. **Import cancelAllReminders** : Ajouté à l'import du notification service
3. **Commentaire trompeur** : Remplacé "Cancel all (both rest timer and reminders)" par "Cancel only reminder-channel notifications (preserves rest timer)"
4. **UIManager/Platform** : Imports conservés car utilisés par code ajouté en parallèle (`UIManager.setLayoutAnimationEnabledExperimental`)

## Vérification
- TypeScript : ✅ zéro erreur
- Tests : ✅ 51 passed (Settings + notificationService)
- Nouveau test créé : non

## Documentation mise à jour
aucune

## Statut
✅ Résolu — 20260305-2340
