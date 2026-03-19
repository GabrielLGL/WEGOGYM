# Passe 3/8 — Code Review — 20260319-1009

## Problemes trouves : 8

| # | Severite | Fichier | Probleme |
|---|----------|---------|----------|
| 1 | CRIT | HomeScreen.tsx:2054-2073 | Sets query limite a 30j mais flashback 3m et deload ont besoin de 90j de data → donnees tronquees |
| 2 | WARN | HomeScreen.tsx (multiples) | 13 couleurs hex en dur non issues du theme |
| 3 | WARN | WorkoutScreen.tsx:420 | #10B981 en dur dans badge densite |
| 4 | WARN | HomeScreen.tsx | Composant monolithique 2082 lignes, 15 useMemo, 10 useState |
| 5 | WARN | 5 fichiers helpers | 5 implementations differentes de getMondayOfWeek |
| 6 | WARN | HomeScreen.tsx:476-488 | Non-null assertion ! sur motivationData.context |
| 7 | WARN | HomeScreen.tsx:567-574 | Fetch imperatif programs au lieu de withObservables |
| 8 | SUGG | StatsScreen.tsx:104-107 | handleNavigate non enveloppe dans useCallback |
