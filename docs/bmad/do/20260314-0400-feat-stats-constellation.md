# feat(stats) — Constellation de Progression
Date : 2026-03-14 04:00

## Instruction
docs/bmad/prompts/20260314-0400-sprint7-D.md

## Rapport source
Description directe (prompt sprint7-D)

## Classification
Type : feat
Fichiers modifiés :
- `mobile/src/screens/StatsConstellationScreen.tsx` (NOUVEAU)
- `mobile/src/screens/__tests__/StatsConstellationScreen.test.tsx` (NOUVEAU)
- `mobile/src/navigation/index.tsx`
- `mobile/src/screens/StatsScreen.tsx`
- `mobile/src/i18n/fr.ts`
- `mobile/src/i18n/en.ts`

## Ce qui a été fait
- **StatsConstellationScreen** : nouvel écran SVG (react-native-svg) affichant chaque PR comme une étoile.
  - Axe X = date normalisée (plus ancien à gauche, plus récent à droite)
  - Axe Y = 1RM estimé normalisé (plus bas en bas, plus élevé en haut)
  - Taille (r=2–8) et opacité (0.4–1.0) selon importance relative
  - 50 étoiles de fond déterministes (distribution pseudo-aléatoire Fibonacci)
  - Top 5 PRs par 1RM listés en bas avec nom exercice, 1RM, date
  - Empty state si < 3 PRs
  - Max 200 étoiles (les plus récentes si dépassement)
- **Navigation** : import lazy + route `StatsConstellation: undefined` + `Stack.Screen`
- **StatsScreen** : bouton `star-outline` / Constellation ajouté en dernier dans STAT_BUTTONS
- **i18n fr/en** : clés `stats.constellation`, `navigation.statsConstellation`, section `constellation.*`
- Corrigé : `colors.textMuted` → `colors.textSecondary` (textMuted inexistant dans ThemeColors)

## Vérification
- TypeScript : ✅ zéro erreur (hors ExerciseCollectionScreen d'un autre groupe)
- Tests : ✅ 3 passed
- Nouveau test créé : oui (`StatsConstellationScreen.test.tsx`)

## Documentation mise à jour
aucune (écran standard, pas de nouveau pattern)

## Statut
✅ Résolu — 20260314-0400

## Commit
[sera rempli]
