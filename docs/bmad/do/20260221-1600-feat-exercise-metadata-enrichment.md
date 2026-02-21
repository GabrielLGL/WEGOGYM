# FEAT(exerciseMetadata) — Enrichissement métadonnées exercices (Groupe B)
Date : 2026-02-21 16:00

## Instruction
docs/bmad/prompts/20260221-1559-algo-programme-B.md

## Rapport source
docs/bmad/prompts/20260221-1559-algo-programme-B.md (description directe)

## Classification
Type : feat
Fichiers modifiés :
- mobile/src/services/ai/types.ts
- mobile/src/services/ai/exerciseMetadata.ts

## Ce qui a été fait
1. **types.ts** — Ajout de 3 nouveaux types exportés :
   - `SFRLevel = 'high' | 'medium' | 'low'`
   - `InjuryZone = 'epaules' | 'genoux' | 'bas_dos' | 'poignets' | 'nuque' | 'none'`
   - `ProgressionType = 'linear' | 'wave' | 'auto'`
   - Extension de l'interface `ExerciseMetadata` avec 4 nouvelles propriétés optionnelles :
     `sfr`, `stretchFocus`, `injuryRisk`, `progressionType`
     (rendues optionnelles `?` par le linter pour compatibilité ascendante)

2. **exerciseMetadata.ts** — 115 exercices tous enrichis avec les 4 nouvelles propriétés :
   - **PECS (15)** : bench plat/incliné/décliné (sfr medium/linear), flys/pec deck (sfr high, stretchFocus true)
   - **DOS (14)** : deadlift (sfr low), tractions/lat pull (stretchFocus true), rows (bas_dos risk)
   - **QUADRICEPS (13)** : squat arrière/avant (sfr low), hack squat/fentes (stretchFocus true)
   - **ISCHIOS (7)** : RDL/leg curl allongé (stretchFocus true), hip thrust (sfr high)
   - **MOLLETS (5)** : tous isolation sfr high, stretchFocus true
   - **ÉPAULES (11)** : OHP/militaire (sfr medium, linear), isolations (sfr high)
   - **TRAPÈZES (5)** : shrugs (stretchFocus true, nuque risk), upright rows (epaules+nuque risk)
   - **BICEPS (10)** : curl incliné (sfr high, stretchFocus true, wave), curl debout (stretchFocus false)
   - **TRICEPS (9)** : overhead extensions (stretchFocus true), pushdowns (stretchFocus false)
   - **ABDOS (13)** : tous sfr high, risques nuque/bas_dos selon exercice
   - **CARDIO (12)** : tous sfr medium, risques spécifiques (genoux pour course/jumping)

Règles métier appliquées :
- SFR low → deadlift, squat arrière/avant (très demandants systémiquement)
- SFR medium → compounds classiques (bench, row, OHP)
- SFR high → isolations + accessoires faible fatigue systémique
- stretchFocus true → muscle en étirement maximal (curl incliné, leg curl allongé, flys, dips, pull-over)
- progressionType linear → compound_heavy uniquement
- progressionType wave → compounds accessoires
- progressionType auto → isolations et accessoires

## Vérification
- TypeScript : ✅ zéro erreur (npx tsc --noEmit)
- Tests : ✅ 128 passed (6 suites : offlineEngine, providerUtils, providers + 3 autres)
- Nouveau test créé : non (enrichissement de données, logique couverte par tests existants)

## Documentation mise à jour
aucune (pas de nouveau composant/hook/pattern)

## Statut
✅ Résolu — 20260221-1600

## Commit
edd5cc0 feat(wizard): add 4 new program questions + extend AIFormData
(inclus dans le commit du Groupe A — parallélisme de travail)
