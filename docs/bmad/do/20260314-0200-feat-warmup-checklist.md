# feat(workout) — Checklist échauffement adaptée aux muscles

Date : 2026-03-14 02:00

## Instruction
Groupe E — Checklist échauffement (#62) : Bouton "Échauffement" dans le header de WorkoutScreen → BottomSheet avec checklist adaptée aux muscles de la séance.

## Rapport source
docs/bmad/prompts/20260314-0200-sprint6-E.md

## Classification
Type : feat
Fichiers modifiés :
- `mobile/src/components/WarmupChecklistSheet.tsx` (NOUVEAU)
- `mobile/src/screens/WorkoutScreen.tsx`
- `mobile/src/i18n/fr.ts`
- `mobile/src/i18n/en.ts`

## Ce qui a été fait
1. **WarmupChecklistSheet.tsx** — Nouveau composant :
   - Mapping `WARMUP_SUGGESTIONS` : 11 groupes musculaires → exercices de mobilité/séries légères
   - `generateSuggestions(muscles)` : déduplique, limite à 8, fallback générique
   - Chips visuels des muscles ciblés
   - Items cochables avec `Ionicons` checkbox + strikethrough
   - Compteur de progression (N/M faits)
   - Reset automatique à chaque ouverture via `useEffect` sur `visible`

2. **WorkoutScreen.tsx** — Intégration :
   - Import `WarmupChecklistSheet`, `TouchableOpacity`, `Ionicons`
   - `warmupModal` via `useModalState()`
   - `sessionMuscles` : fetch async des exercises pour collecter les muscles uniques
   - `headerRight` avec icône `body-outline` dans `navigation.setOptions`
   - Composant `<WarmupChecklistSheet>` ajouté dans le JSX

3. **Traductions fr.ts / en.ts** — Section `warmup` ajoutée (title, subtitle, done, noMuscles)

## Vérification
- TypeScript : ✅ (zéro erreur dans les fichiers modifiés)
- Tests : ✅ 1733 passed (1 fail pré-existant non lié)
- Nouveau test créé : non

## Documentation mise à jour
aucune

## Statut
✅ Résolu — 20260314-0200

## Commit
263c34b feat(workout): warmup checklist sheet — muscle-adaptive warmup suggestions
