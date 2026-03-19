# Tache H — Split ExerciseHistoryScreen (952 lignes) — 20260319-1900

## Objectif
Decouper `ExerciseHistoryScreen.tsx` (952 lignes, le plus gros fichier ecran) en sous-composants pour ameliorer la maintenabilite. Objectif : ramener le fichier principal a ~400 lignes.

## Fichier source
- `mobile/src/screens/ExerciseHistoryScreen.tsx` (952 lignes)

## Fichiers a creer
- `mobile/src/components/exercise-history/ExerciseHistoryChart.tsx` — graphique de performance
- `mobile/src/components/exercise-history/ExerciseHistoryStats.tsx` — cartes de statistiques
- `mobile/src/components/exercise-history/ExerciseHistoryInsights.tsx` — predictions, plateaux, alternatives

## Contexte technique

### Patterns obligatoires (CLAUDE.md)
- `useColors()` hook pour les couleurs dynamiques
- `useLanguage()` hook pour les textes
- Composants fonctionnels, TypeScript strict
- `useMemo` pour les styles (pattern `useStyles(colors)`)
- Pas de `any`, pas de couleurs hardcodees

### Structure actuelle du fichier (a verifier en le lisant)
Le fichier contient typiquement :
1. **Imports** (~30 lignes)
2. **Types/Interfaces** (~20 lignes)
3. **Composant principal** avec :
   - Hooks (colors, language, navigation)
   - Data fetching / computation (useMemo pour stats)
   - Chart rendering (graphique historique)
   - Stats cards (metriques par exercice)
   - Insights panels (PR prediction, plateau, alternatives, overload)
4. **Styles** (~100 lignes)

### Plan de decoupage

**ExerciseHistoryChart.tsx** (~150 lignes) :
- Le graphique de performance (poids/volume au fil du temps)
- Les controles de metrique (toggle entre weight/volume/reps)
- Les styles associes au graphique
- Props : donnees mappees, metrique selectionnee, callbacks

**ExerciseHistoryStats.tsx** (~150 lignes) :
- Les cartes de statistiques (max weight, total volume, PR count, etc.)
- Les KPIs calcules
- Props : donnees pre-calculees

**ExerciseHistoryInsights.tsx** (~150 lignes) :
- Les panels d'insights (PR prediction, plateau detection, overload trends)
- Les recommandations d'alternatives
- Les suggestions de variantes
- Props : donnees pre-calculees

**ExerciseHistoryScreen.tsx** (~400 lignes restantes) :
- Orchestration : hooks, data fetching, state
- Layout principal (ScrollView avec les 3 sous-composants)
- withObservables HOC

## Etapes
1. Lire `ExerciseHistoryScreen.tsx` en entier pour comprendre la structure
2. Identifier les blocs JSX decoupables (chart, stats, insights)
3. Creer le dossier `components/exercise-history/`
4. Extraire `ExerciseHistoryChart.tsx` avec ses types et styles
5. Extraire `ExerciseHistoryStats.tsx` avec ses types et styles
6. Extraire `ExerciseHistoryInsights.tsx` avec ses types et styles
7. Mettre a jour `ExerciseHistoryScreen.tsx` pour utiliser les nouveaux composants
8. `npx tsc --noEmit` → 0 erreur
9. `npm test` → 0 fail

## Contraintes
- NE PAS changer le comportement visible de l'ecran
- NE PAS modifier d'autres ecrans
- NE PAS modifier les helpers/utils (juste les importer dans les nouveaux composants)
- Les props des sous-composants doivent etre typees (interfaces)
- Les styles restent dans chaque fichier (pattern `useStyles`)
- Le withObservables HOC reste dans ExerciseHistoryScreen.tsx

## Criteres de validation
- `npx tsc --noEmit` → 0 erreur
- `npm test` → 2231+ passed
- ExerciseHistoryScreen.tsx < 500 lignes
- 3 nouveaux composants crees et fonctionnels
- Aucun changement visuel

## Dependances
Aucune — independant.

## Statut
⏳ En attente
