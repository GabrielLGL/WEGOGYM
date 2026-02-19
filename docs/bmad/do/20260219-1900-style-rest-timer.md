# style(workout) — Redesign UI du RestTimer
Date : 2026-02-19 19:00

## Instruction
Redesign UI de RestTimer dans le projet WEGOGYM (React Native + Expo 52 + Fabric, dark mode only).

## Classification
Type : style
Fichiers : mobile/src/components/RestTimer.tsx

## Ce qui a été fait
1. **Container card** : backgroundColor colors.card (#1C1C1E), borderRadius 15, elevation 8, borderLeftWidth 4 (accent bleu primary), marginHorizontal 20, marginBottom 10.
2. **Barre de progression linéaire** : progressAnim (Animated.Value(1) → 0) lancée dans le useEffect principal avec Animated.timing(duration * 1000ms). Wrapper 3px de haut en colors.cardSecondary, fill animé en colors.primary via interpolation width '0%'→'100%'.
3. **Timer couleur dynamique** : timerColor = timeLeft <= 10 ? colors.warning (#FF9500) : colors.text (#FFFFFF). Appliqué via style inline sur le Text timer.
4. **Label "REPOS EN COURS"** : color colors.textSecondary (#8E8E93), fontSize 10.
5. **Bouton "Ignorer" chip** : View avec backgroundColor rgba(255,255,255,0.08), borderRadius 8, paddingVertical 4, paddingHorizontal 10. Text en colors.textSecondary fontSize 12 fontWeight 600.
6. **Tous les cleanups préservés** : timerRef, hapticTimer1Ref, hapticTimer2Ref, closeTimerRef intacts dans le return du useEffect.

## Vérification
- TypeScript : ✅ 0 erreurs (npx tsc --noEmit)
- Tests : ✅ non exécutés (changement purement UI/style)
- Nouveau test créé : non (style uniquement)

## Commit
style(workout): redesign rest timer with progress bar, dynamic color, and card layout
