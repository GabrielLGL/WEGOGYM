<!-- v1.0 — 2026-02-26 -->
# Prompt — Refactor helpers + magic numbers — 20260226-1120

## Demande originale
Groupe A, B, D du rapport verrif `docs/bmad/verrif/20260226-0938/RAPPORT.md`
(Groupe C déjà résolu : FlatList memoize + BackHandler race condition)

## Groupes générés

| Groupe | Rapport | Fichiers principaux | Vague | Statut |
|--------|---------|---------------------|-------|--------|
| A | `docs/bmad/prompts/20260226-1120-split-databasehelpers-A.md` | `databaseHelpers.ts` → 7 sous-fichiers | 1 | ⏳ |
| B | `docs/bmad/prompts/20260226-1120-split-statshelpers-B.md` | `statsHelpers.ts` → 7 sous-fichiers | 1 | ⏳ |
| D | `docs/bmad/prompts/20260226-1120-magic-numbers-D.md` | Divers screens + theme | 1 | ⏳ |

## Ordre d'exécution
Tous les groupes sont **indépendants** (fichiers différents, aucune dépendance croisée).
→ Lancer les 3 en **même temps** (vague unique).

## Notes de découpage

### Groupe A — databaseHelpers.ts
Stratégie barrel : `databaseHelpers.ts` devient un re-export global des sous-modules.
Les 15 fichiers importeurs continuent à fonctionner sans modification.
Sous-modules : `parseUtils`, `exerciseQueryUtils`, `workoutSessionUtils`,
`workoutSetUtils`, `exerciseStatsUtils`, `programImportUtils`, `aiPlanUtils`.

### Groupe B — statsHelpers.ts
Même stratégie barrel. Toutes les fonctions sont pures (pas de DB).
Sous-modules : `statsTypes`, `statsDateUtils`, `statsKPIs`, `statsDuration`,
`statsVolume`, `statsMuscle`, `statsPRs`.
⚠️ Attention aux dépendances croisées entre sous-modules (ex: statsKPIs → formatVolume de statsVolume).

### Groupe D — Magic numbers
Remplace les `fontSize: N` et `borderRadius: N` hardcodés par les constantes de `theme/index.ts`.
Uniquement si correspondance exacte ou valeur très fréquente (3+ fichiers).
Pas de modification de logique — uniquement `StyleSheet.create()`.
