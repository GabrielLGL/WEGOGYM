# Passe 4 — Bugs silencieux
**Date:** 2026-03-07 00:51

| # | Sev | Fichier | Ligne | Probleme |
|---|-----|---------|-------|----------|
| B1 | WARN | `ProgramDetailScreen.tsx` | 257-260 | Dialog bloquee si onConfirm throw (= W3) |
| B2 | WARN | `ProgramsScreen.tsx` | 302-305 | Idem (= W4) |
| B3 | WARN | `HistoryDetailScreen.tsx` | 213,233,249,261 | 4x empty catch — erreurs DB invisibles |
| B4 | WARN | `StatsMeasurementsScreen.tsx` | 131,143 | 2x empty catch — save/delete silencieux |
| B5 | WARN | `WorkoutScreen.tsx` | 213-345 | handleConfirmEnd long async sans guard unmount |
| B6 | WARN | `useAssistantWizard.ts` | 371-400 | triggerGenerate async sans cancellation |

**Mutations DB:** Toutes dans database.write() ✅
**setTimeout/setInterval:** Tous avec cleanup ✅
**subscribe/observe:** Tous via withObservables (auto-managed) ✅

B1/B2 corriges (= W3/W4). B3-B6 non corriges : risque faible (empty catch = pattern existant, pas de crash, React 18 ignore setState after unmount).

**Score:** 18/20 (B3-B6 restants, faible severite)
