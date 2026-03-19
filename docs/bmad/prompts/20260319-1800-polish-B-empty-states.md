# Tache B — Empty States avec CTA — 20260319-1800

## Objectif
Creer un composant `<EmptyState>` reutilisable et l'integrer dans les ecrans qui affichent des listes vides sans feedback. L'utilisateur doit comprendre pourquoi c'est vide et quoi faire.

## Fichiers a creer
- `mobile/src/components/EmptyState.tsx`

## Fichiers a modifier
- `mobile/src/screens/ProgramsScreen.tsx` — ajouter empty state quand 0 programmes
- `mobile/src/screens/ProgressPhotosScreen.tsx` — ajouter empty state quand 0 photos
- `mobile/src/screens/SelfLeaguesScreen.tsx` — ajouter empty state quand pas assez de donnees
- `mobile/src/screens/ChartsScreen.tsx` — ajouter empty state quand pas de donnees
- `mobile/src/screens/ExerciseCollectionScreen.tsx` — ajouter empty state quand collection vide

## Contexte technique

### Design system (theme/index.ts)
- Couleurs : `colors.text`, `colors.textSecondary`, `colors.placeholder`, `colors.primary`, `colors.card`
- Spacing : `spacing.md` (16), `spacing.lg` (24), `spacing.xl` (32), `spacing.xxl` (40)
- BorderRadius : `borderRadius.md` (14)
- FontSize : `fontSize.md` (16), `fontSize.lg` (18), `fontSize.xl` (20)

### Patterns obligatoires (CLAUDE.md)
- `useColors()` hook pour les couleurs dynamiques
- `useLanguage()` hook pour les textes — `{ t }` contient les traductions
- Composants fonctionnels, TypeScript strict, pas de `any`
- Pas de couleurs hardcodees

### i18n
- Les textes doivent etre ajoutes dans `mobile/src/i18n/fr.ts` et `mobile/src/i18n/en.ts`
- Section suggeree : `emptyStates: { ... }` dans l'objet de traduction
- **IMPORTANT** : `fr.ts` ne doit PAS avoir `as const` (sinon incompatibilite de types avec en.ts)

### Spec du composant EmptyState

```tsx
interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap  // ex: 'barbell-outline'
  title: string                          // ex: 'Aucun programme'
  message: string                        // ex: 'Cree ton premier programme...'
  actionLabel?: string                   // ex: 'Creer un programme'
  onAction?: () => void                  // callback du bouton CTA
}
```

### Spec visuelle
- Centre vertical et horizontal dans le conteneur
- Icone Ionicons 48px, couleur `colors.placeholder`
- Titre en `fontSize.lg`, fontWeight 600, couleur `colors.text`
- Message en `fontSize.sm`, couleur `colors.textSecondary`, textAlign center, maxWidth 280
- Bouton CTA optionnel : utiliser le composant `<Button variant="primary">` existant (import depuis `../components/Button`)
- Gap vertical `spacing.md` entre les elements

### Integration par ecran

**ProgramsScreen.tsx :**
- Condition : quand la liste `programs` est vide (length === 0)
- Icone : `library-outline`
- Texte FR : "Aucun programme" / "Cree ton premier programme pour commencer"
- CTA : "Creer un programme" → ouvrir le bottom sheet de creation (meme action que le FAB)
- Note : ProgramsScreen utilise un `DraggableFlatList`, pas un `FlatList` standard. Le empty state peut etre rendu conditionnellement AVANT la liste, ou via `ListEmptyComponent` si DraggableFlatList le supporte.

**ProgressPhotosScreen.tsx :**
- Condition : quand `photos` est vide
- Icone : `camera-outline`
- Texte FR : "Aucune photo" / "Prends ta premiere photo pour suivre ta progression"
- CTA : "Ajouter une photo" → action camera/gallery existante

**SelfLeaguesScreen.tsx :**
- Condition : quand `ranking.length < 2`
- Icone : `trophy-outline`
- Texte FR : "Pas encore de classement" / "Fais quelques seances pour voir ton classement"
- Pas de CTA

**ChartsScreen.tsx :**
- Condition : quand `chartData` est null ou vide
- Icone : `stats-chart-outline`
- Texte FR : "Pas de donnees" / "Les graphiques apparaitront apres tes premieres seances"
- Pas de CTA

**ExerciseCollectionScreen.tsx :**
- Condition : quand les exercices filtres sont vides
- Icone : `barbell-outline`
- Texte FR : "Aucun exercice dans cette collection" / "Ajoute des exercices avec le bon groupe musculaire"
- Pas de CTA

## Etapes
1. Creer `EmptyState.tsx` (composant pur, avec styles via `useStyles`)
2. Ajouter les textes FR dans `fr.ts` section `emptyStates`
3. Ajouter les textes EN dans `en.ts` section `emptyStates`
4. Integrer dans chaque ecran liste ci-dessus
5. Verifier : `npx tsc --noEmit` → 0 erreur
6. Verifier : `npm test` → 0 fail

## Contraintes
- NE PAS modifier les ecrans qui ont DEJA un empty state (WorkoutScreen, SessionDetailScreen, ExercisesScreen, ActivityFeedScreen, ProgramDetailScreen, ExerciseCatalogScreen, StatsHallOfFameScreen)
- NE PAS casser le layout existant des ecrans
- Utiliser `<Button>` existant pour les CTA, pas un TouchableOpacity custom
- Les textes DOIVENT etre dans les fichiers i18n, pas hardcodes

## Criteres de validation
- `npx tsc --noEmit` → 0 erreur
- `npm test` → 2231+ passed
- Chaque ecran modifie affiche un empty state coherent quand les donnees sont vides
- Dark/Light mode supporte

## Dependances
Aucune — ce groupe est independant.

## Statut
⏳ En attente
