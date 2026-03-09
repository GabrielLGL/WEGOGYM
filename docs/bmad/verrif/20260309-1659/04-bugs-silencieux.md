# Passe 4/8 — Bugs silencieux

**Date :** 2026-03-09 16:59

## Résultat : 12 problèmes trouvés (3 CRITICAL, 9 WARNING)

### CRITICAL

| # | Fichier | Lignes | Description |
|---|---------|--------|-------------|
| B1 | `AnimatedSplash.tsx` | 11, 68, 77 | Import statique `colors` depuis theme → ignore le toggle dark/light |
| B2 | `AssistantPreviewScreen.tsx` | 54-56 | Erreur dans handleValidate swallowed silencieusement, aucun feedback utilisateur |
| B3 | `ProgramDetailScreen.tsx` | 91-96, 104-112 | 3 async handlers sans try/catch (handleSaveSession, handleDuplicateSession, handleMoveSession) |

### WARNING

| # | Fichier | Lignes | Description |
|---|---------|--------|-------------|
| B4 | `ProgramsScreen.tsx` | 146-156 | handleSaveProgram et handleDuplicateProgram sans try/catch |
| B5 | `ExercisesScreen.tsx` | 145-159 | handleUpdateExercise et handleDeleteExercise sans try/catch |
| B6 | `CreateExerciseScreen.tsx` | 151 | Appel async `handleCreate()` sans await |
| B7 | `CoachMarks.tsx` | 142, 172 | useEffect deps manquantes (measureTarget) |
| B8 | `CustomModal.tsx` | 52, 57 | Spacing hardcodé (marginBottom: 20, gap: 10) |
| B9 | `OnboardingSheet.tsx` | 31-41 | handleSelectProgram : erreur non surfacée à l'utilisateur |
| B10 | `StatsDurationScreen.tsx` | 140-179 | `t` manquant dans deps de useCallback `toggleExpand` |
| B11 | `ChartsScreen.tsx` | 305-316 | Constantes numériques hardcodées au lieu de tokens theme |
| B12 | `ExerciseCatalogScreen.tsx` | 200-272 | useDetailStyles non memoized |

### Patterns confirmés propres
- Toutes les mutations WatermelonDB dans `database.write()`
- Timer/interval cleanup OK partout
- Subscription cleanup OK partout
- Race condition guards (isMountedRef, cancelled) OK
- Portal pattern : aucun `<Modal>` natif
