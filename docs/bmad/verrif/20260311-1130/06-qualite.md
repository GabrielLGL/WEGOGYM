# Passe 6/8 — Code mort & qualité

**Run :** 20260311-1130

## Résultat : 0 CRIT, 4 WARN, 8 SUGG

| # | Sev | Fichier | Problème |
|---|-----|---------|----------|
| Q1 | 🟡 | `BadgeCard.tsx:13` | Prop `unlockedAt` déclarée mais jamais lue |
| Q2 | 🟡 | `StatsVolumeScreen.tsx:52` | `WEEK_MS` dupliqué localement au lieu d'importer |
| Q3 | 🟡 | `HomeScreen.tsx:61` | `DAY_CHIP_MIN_HEIGHT` potentiellement inutilisé |
| Q4 | 🟡 | `statsMuscle.ts:195` | Mois anglais hardcodés comme default |
| Q5 | 🔵 | `claudeProvider.ts:10,46` | Timeouts 30000/10000 hardcodés — constantes nommées manquantes |
| Q6 | 🔵 | `AnimatedSplash.tsx:20-21` | Couleurs hardcodées splash (documenté comme intentionnel) |
| Q7 | 🔵 | `i18n/fr.ts:108-109` | Hex colors dans descriptions i18n (strings display) |
| Q8 | 🔵 | `workoutSetUtils.ts:25-30` | SQL brut — safe mais non documenté |
| Q9 | 🔵 | `useWorkoutCompletion.ts:159` | SQL brut — safe mais non documenté |
| Q10 | 🔵 | `aiService.ts:49` | `equipmentMap` pourrait être `const satisfies` |
| Q11 | 🔵 | `exerciseStatsUtils.ts:298` | Non-null assertion `!` au lieu d'optional chaining |
| Q12 | 🔵 | `workoutSetUtils.ts:33` | Type assertion sans guard explicite |

### Résumé
- **Aucun `any`** en code production
- **Tous les `console.*`** sont guardés par `__DEV__`
- **Pas de couleurs hardcodées** en dehors du splash (documenté)
- Principaux issues : props/variables inutilisées, magic numbers, timeouts non nommés
