# Passe 4/8 — Bugs silencieux

## Résultat : 0 🔴 CRIT, 2 🟡 WARN

| # | Fichier | Ligne | Sévérité | Problème |
|---|---------|-------|----------|----------|
| 1 | WorkoutScreen.tsx | 253-260 | 🟡 WARN | handleConfirmAbandon: abandonModal.close() et navigation.reset() hors try/catch (risque faible — navigation.reset ne throw pas en pratique) |
| 2 | workoutSetUtils.ts | 159 | 🟡 WARN | h.startTime.getTime() pourrait crasher si start_time est null (schema NOT NULL, risque faible) |

## Catégories clean
- WatermelonDB mutations outside write() : ✅ 0
- Timer leaks : ✅ 0
- Subscription leaks : ✅ 0
- console.log sans __DEV__ : ✅ 0
