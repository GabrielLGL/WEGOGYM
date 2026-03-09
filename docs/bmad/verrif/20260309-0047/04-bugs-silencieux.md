# Passe 4/8 — Bugs silencieux
**Date:** 2026-03-09 00:47

## Critiques (0)
Aucun risque critique. Code bien protege : mutations DB dans write(), timers avec cleanup, isMountedRef pour async, race conditions gerees avec flags cancelled.

## Warnings (5)
1. **BottomSheet.tsx l.100** — `screenHeight` non dans les deps useEffect. Risque faible (rotation ecran rare).
2. **CoachMarks.tsx l.135, 161** — deps ESLint manquantes (`measureTarget`, `tooltipAnim`). Fonctionnellement correct.
3. **RestTimer.tsx l.126** — `finishTimer()` peut appeler `onClose()` apres demontage. Risque faible.
4. **MUSCLES_FOCUS_OPTIONS non traduit** dans useAssistantWizard.ts l.58 — labels en francais hardcodes.
5. **PROVIDER_LABELS non traduit** dans useAssistantWizard.ts l.60-65.

## Suggestions
- Ajouter flags `cancelled` aux 2 useEffect de navigation/index.tsx (l.157, 243).
- Traduire MUSCLES_FOCUS_OPTIONS et PROVIDER_LABELS via i18n.
