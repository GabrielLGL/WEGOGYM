# feat(settings) — Timer son/vibration — Groupe C
Date : 2026-02-27 10:30

## Instruction
docs/bmad/prompts/20260227-1030-timer-son-C.md

## Rapport source
docs/bmad/prompts/20260227-1030-timer-son-C.md

## Classification
Type : feat
Fichiers modifiés :
- mobile/src/screens/SettingsScreen.tsx
- mobile/src/screens/WorkoutScreen.tsx

## Ce qui a été fait

### SettingsScreen.tsx
1. **2 nouveaux useState** (après `timerEnabled`) :
   - `vibrationEnabled` initialisé à `user?.vibrationEnabled ?? true`
   - `timerSoundEnabled` initialisé à `user?.timerSoundEnabled ?? true`

2. **useEffect sync** — 2 lignes ajoutées pour synchroniser les états depuis `user` :
   - `setVibrationEnabled(user.vibrationEnabled ?? true)`
   - `setTimerSoundEnabled(user.timerSoundEnabled ?? true)`

3. **2 nouveaux handlers async** (après `handleToggleTimer`) :
   - `handleToggleVibration` — mutation DB dans `database.write()`, revert on error
   - `handleToggleTimerSound` — mutation DB dans `database.write()`, revert on error

4. **2 nouvelles rows JSX** dans la section "Minuteur de repos" (après la durée de repos) :
   - "Vibration fin de repos" → Switch `value={vibrationEnabled}`
   - "Son fin de repos" → Switch `value={timerSoundEnabled}`

### WorkoutScreen.tsx
5. **2 nouvelles props** passées à `<RestTimer>` :
   - `vibrationEnabled={user?.vibrationEnabled ?? true}`
   - `soundEnabled={user?.timerSoundEnabled ?? true}`

## Vérification
- TypeScript : ✅ 0 erreur
- Tests : ✅ 1260 passed (7 échecs préexistants dans ExercisePickerModal.test.tsx — non liés à ce changement)
- Nouveau test créé : non (UI toggle, pas de logique métier nouvelle)

## Documentation mise à jour
aucune

## Statut
✅ Résolu — 20260227-1030

## Commit
88ebf3a feat(settings): add vibration/sound toggles in rest timer section
