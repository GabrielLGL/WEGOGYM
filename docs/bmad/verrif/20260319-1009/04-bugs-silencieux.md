# Passe 4/8 — Bugs silencieux — 20260319-1009

## Problemes trouves : 10

| # | Severite | Fichier | Ligne | Probleme |
|---|----------|---------|-------|----------|
| 1 | CRIT | weeklyGoalsHelpers.ts | 72-73 | Division par zero si sessionsTarget=0 ou volumeTarget=0 |
| 2 | CRIT | muscleRecoveryHelpers.ts | 147-148 | Couleurs hardcodees #10B981 et #F59E0B |
| 3 | WARN | volumeRecordsHelpers.ts | 35-41 | Calcul semaine ISO incorrect pres des limites d'annee |
| 4 | WARN | trainingDensityHelpers.ts | 34 | startTime futur → densite artificiellement enorme |
| 5 | WARN | workoutSummaryHelpers.ts | 58-67 | formatTimeAgo : diff negative si date future → "il y a -5min" |
| 6 | WARN | setQualityHelpers.ts | 44 | Population stdDev au lieu de sample stdDev (Bessel) |
| 7 | WARN | exerciseFrequencyHelpers.ts | 114-118 | Trend detection inutile si periode < 14j |
| 8 | WARN | muscleBalanceHelpers.ts | 69 | Ratio cap a 2 masque les desequilibres extremes |
| 9 | WARN | muscleRecoveryHelpers.ts | 94-106 | Volume accumulation depend de l'ordre des sets |
| 10 | WARN | streakMilestonesHelpers.ts | 82-93 | Semantique streak ambigue (jours entrainement vs calendrier) |
