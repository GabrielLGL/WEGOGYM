# Passe 3/8 — Code Review

**Run :** 20260311-1130

## Résultat : 2 CRIT, 5 WARN, 3 SUGG

| # | Sev | Fichier | Problème |
|---|-----|---------|----------|
| 1 | 🔴 | `StatsVolumeScreen.tsx:108,120` | `muscleLabel` state initialisé depuis string traduite — casse silencieusement au changement de langue |
| 2 | 🔴 | `useWorkoutCompletion.ts:148-150` | `getTotalSessionCount() - 1` race condition — baseline "before" incorrecte pour milestones |
| 3 | 🟡 | `claudeProvider.ts:5` | Modèle snapshot daté `claude-haiku-4-5-20251001` — risque de deprecation |
| 4 | 🟡 | `statsVolume.ts:157-167` | `buildWeeklyActivity` fait O(H*S) scans dans une boucle 7 itérations — pas de pré-indexation |
| 5 | 🟡 | `statsMuscle.ts:195` | Mois anglais hardcodés comme default — bug i18n latent pour futurs callers |
| 6 | 🟡 | `useWorkoutCompletion.ts:158-165` | `unsafeFetchRaw` avec cast nom de colonne — retourne silencieusement 0 si mismatch |
| 7 | 🟡 | `BadgeCard.tsx:12` | Prop `unlockedAt` déclarée dans l'interface mais jamais lue dans le composant |
| 8 | 🔵 | `StatsVolumeScreen.tsx:52` | `WEEK_MS` dupliqué localement, devrait importer de `model/constants` |
| 9 | 🔵 | `ExercisePickerModal.tsx:109` | `handleAdd` pas wrappé dans `useCallback` — inconsistant |
| 10 | 🔵 | `statsKPIs.ts:40-63` | `computeCurrentStreak` fragile si `STREAK_LOOKUP_DAYS` très petit |

### Détails

**C1 — StatsVolumeScreen muscleLabel (CRIT)**
`useState(t.statsVolume.total)` capture la valeur traduite au mount. Si l'utilisateur change de langue, `muscleLabel` garde l'ancien texte. Le filtre `muscleLabel === t.statsVolume.total` retourne false → le screen filtre par un muscle fantôme.
Fix: Utiliser une clé sentinelle `'__all__'` au lieu de la string traduite.

**C2 — useWorkoutCompletion race condition (CRIT)**
`getTotalSessionCount()` est appelé APRÈS `completeWorkoutHistory()`, donc la session en cours est déjà comptée. Le `- 1` est un hack fragile. Si un autre workout est complété en parallèle ou si la DB write n'est pas encore visible, le compte est faux.
Fix: Capturer le count AVANT `completeWorkoutHistory()`.

**W3 — claudeProvider model ID daté**
`claude-haiku-4-5-20251001` est un snapshot daté. Le même pattern (modèle supprimé) a causé des failures avec Gemini. Risk: deprecation API.
Fix: Utiliser l'alias stable `claude-haiku-4-5` ou mettre à jour.

**W4 — buildWeeklyActivity perf**
Boucle de 7 jours × filter complet de histories + sets. O(7*H + H_week*S) par render.
Fix: Pré-indexer histories par dateKey et sets par historyId.

**W5 — computeMonthlySetsChart English defaults**
`monthLabels` optionnel avec default anglais. Le seul caller actuel passe le param, mais tout futur caller héritera l'anglais silencieusement.
Fix: Rendre `monthLabels` requis.

**W6 — unsafeFetchRaw column cast**
Le cast `as Record<string, unknown>` puis accès `.count` est fragile si SQLite change le naming des colonnes.
Fix: Ajouter un `__DEV__` assert.

**W7 — BadgeCard dead prop**
`unlockedAt` est passé par `BadgesScreen` mais jamais destructuré/lu dans `BadgeCard`.
Fix: Supprimer la prop ou l'utiliser pour afficher la date.
