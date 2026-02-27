# feat(workout) — célébrations post-séance affichées sur HomeScreen
Date : 2026-02-28 00:55

## Instruction
docs/bmad/prompts/20260228-0047-post-action-navigation-B.md

## Rapport source
docs/bmad/prompts/20260228-0047-post-action-navigation-B.md

## Classification
Type : feat
Fichiers modifiés :
- `mobile/src/navigation/index.tsx`
- `mobile/src/screens/WorkoutScreen.tsx`
- `mobile/src/screens/HomeScreen.tsx`
- `mobile/src/screens/__tests__/HomeScreen.test.tsx`
- `mobile/src/screens/__tests__/WorkoutScreen.test.tsx`

## Ce qui a été fait

### navigation/index.tsx
- Ajout des imports `MilestoneEvent` et `BadgeDefinition` (type-only)
- `Home: undefined` → `Home: { celebrations?: { milestones: MilestoneEvent[]; badges: BadgeDefinition[] } } | undefined` pour permettre le passage des données de célébration via navigation params

### WorkoutScreen.tsx
- Suppression des imports `MilestoneCelebration` et `BadgeCelebration`
- Suppression des states `milestoneVisible`, `badgeCelebrationVisible`, `badgeCelebrationWasOpenRef`
- Remplacement des 3 useEffects de célébration par UN SEUL : quand le résumé se ferme, `navigation.reset()` vers Home avec `params.celebrations` contenant les milestones et badges (ou undefined s'il n'y en a pas)
- Suppression du JSX `<MilestoneCelebration>` et `<BadgeCelebration>`

### HomeScreen.tsx
- Ajout des imports : `useState`, `useEffect`, `useRoute`, `RouteProp`, `MilestoneEvent`, `BadgeDefinition`, `MilestoneCelebration`, `BadgeCelebration`
- Ajout du type `HomeRoute` et du type union `CelebrationItem`
- Dans `HomeScreenBase` : `useRoute()` pour lire les params, state `celebrationQueue` + `currentCelebration`
- useEffect qui lit `route.params?.celebrations`, construit la queue (milestones en premier, puis badges), initialise `currentCelebration`, puis efface les params via `navigation.setParams`
- `handleCloseCelebration` qui avance dans la queue (affiche le suivant ou null)
- JSX : `<MilestoneCelebration>` et `<BadgeCelebration>` rendus conditionnellement selon le type de `currentCelebration`

### Tests corrigés
- `HomeScreen.test.tsx` : ajout de `useRoute: () => ({ params: undefined })` et `setParams` dans le mock `@react-navigation/native`
- `WorkoutScreen.test.tsx` : assertion `routes: [{ name: 'Home' }]` → `routes: [expect.objectContaining({ name: 'Home' })]` (le route contient maintenant aussi `params`)

## Vérification
- TypeScript : ✅ zéro erreur
- Tests : ✅ 1301 passed (75 suites)
- Nouveau test créé : non

## Documentation mise à jour
Aucune

## Statut
✅ Résolu — 20260228-0055

## Commit
[à remplir]
