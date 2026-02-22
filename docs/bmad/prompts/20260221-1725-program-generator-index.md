<!-- v1.0 — 2026-02-21 -->
# Prompt — programGenerator service — 20260221-1725

## Demande originale
Créer un service TypeScript pur `programGenerator` qui génère un programme complet ou une
séance unique à partir du profil utilisateur (12 questions assistant IA). 100% offline,
déterministe, testable. Adapter au contexte WEGOGYM existant (ne pas casser l'offlineEngine
ni les types actuels).

## Analyse — ce qui existe déjà vs ce qui manque

### Déjà implémenté ✅
- `mobile/src/services/ai/types.ts` — AIFormData, GeneratedPlan, GeneratedSession, ExerciseMetadata
- `mobile/src/services/ai/exerciseMetadata.ts` — 100+ exercices avec metadata (type, minLevel, injuryRisk, etc.)
- `mobile/src/services/ai/offlineEngine.ts` — moteur offline complet (splits, volume, séances)
- `mobile/src/services/ai/aiService.ts` — orchestrateur (offline + cloud)
- `mobile/src/model/utils/databaseHelpers.ts` — `importGeneratedPlan()` + `importGeneratedSession()`
- `mobile/src/screens/AssistantScreen.tsx` — wizard UI multi-étapes
- MUSCLES_LIST (FR): 'Pecs', 'Dos', 'Quadriceps', 'Ischios', 'Mollets', 'Trapèzes', 'Epaules', 'Biceps', 'Triceps', 'Abdos'
- EQUIPMENT_LIST (FR): 'Poids libre', 'Machine', 'Poulies', 'Poids du corps'

### À créer 🆕 — module `mobile/src/services/ai/programGenerator/`
- `types.ts` — UserProfile, Equipment (EN), MuscleGroup (EN), BodyZone, SplitType, SetParams, GeneratedProgram + mappings FR↔EN
- `tables.ts` — tables de décision pures (WEEKLY_VOLUME_TABLE, PARAMS_TABLE, etc.)
- `splitStrategy.ts` — `determineSplit()` + `buildWeeklySchedule()`
- `volumeCalculator.ts` — `calcWeeklyVolumeByMuscle()` + `distributeVolumeToSessions()`
- `exerciseSelector.ts` — sélection depuis WatermelonDB (filtre injuries via injuryRisk existant)
- `sessionBuilder.ts` — construction d'une séance complète
- `index.ts` — point d'entrée + adapter vers format GeneratedPlan (pour importGeneratedPlan)

### Modifications 🔧
- `mobile/src/services/ai/aiService.ts` — brancher le nouveau module comme alternative à offlineEngine

## Décisions clés
1. **Pas de modification de exerciseMetadata.ts** — utiliser les champs existants (`type`, `injuryRisk`)
   et les mapper vers les nouveaux types dans exerciseSelector
2. **Mapping FR↔EN** dans `types.ts` (constantes exportées) — les noms DB restent en français
3. **Backward compat** — l'offlineEngine n'est pas supprimé, le programGenerator est une 2e option
4. **nervousDemand** dérivé de `type` : compound_heavy→3, compound→2, accessory/isolation→1
5. **movementPattern** dérivé de `primaryMuscle` dans exerciseSelector
6. **Output final** converti vers `GeneratedPlan` pour réutiliser `importGeneratedPlan()`

## Groupes générés
| Groupe | Rapport | Fichiers | Vague | Statut |
|--------|---------|----------|-------|--------|
| A | 20260221-1725-program-generator-A.md | types.ts, tables.ts (nouveaux) | 1 | ⏳ |
| B | 20260221-1725-program-generator-B.md | splitStrategy.ts, volumeCalculator.ts (nouveaux) | 2 | ⏳ |
| C | 20260221-1725-program-generator-C.md | exerciseSelector.ts, sessionBuilder.ts, index.ts (nouveaux) | 3 | ⏳ |
| D | 20260221-1725-program-generator-D.md | aiService.ts (modification) | 4 | ⏳ |

## Ordre d'exécution
- **Vague 1** : Groupe A — foundation (types + tables), aucune dépendance
- **Vague 2** : Groupe B — algorithmes purs, dépend des types de A
- **Vague 3** : Groupe C — couche DB + index, dépend de B
- **Vague 4** : Groupe D — intégration aiService, dépend de C

## Statut
✅ Résolu — 20260222-0000

## Résolution
Rapport do : docs/bmad/do/20260222-0000-feat-programGenerator-index.md
