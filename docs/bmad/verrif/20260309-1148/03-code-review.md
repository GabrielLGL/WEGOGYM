# Passe 3/8 — Code Review

## Résultat : 3 🟡 WARN, 2 🔵 INFO

| # | Fichier | Ligne | Sévérité | Problème |
|---|---------|-------|----------|----------|
| 1 | CoachMarks.tsx | 142 | 🟡 WARN | useEffect dep array omet fadeAnim, measureTarget, tooltipAnim (stables mais non listés) |
| 2 | CoachMarks.tsx | 172 | 🟡 WARN | useEffect dep array omet measureTarget, tooltipAnim |
| 3 | CoachMarks.tsx | 186 | 🟡 WARN | Dimensions.get('window') dans le rendu au lieu de useWindowDimensions() |
| 4 | CoachMarks.tsx | 66-67 | 🔵 INFO | MAX_MEASURE_RETRIES et MEASURE_RETRY_DELAY à l'intérieur du composant au lieu du module |
| 5 | ProgramDetailBottomSheet.tsx | 18 | 🟡 WARN | Dimensions.get('window') au niveau module — figé au chargement |

## Aucun 🔴 CRIT détecté.
