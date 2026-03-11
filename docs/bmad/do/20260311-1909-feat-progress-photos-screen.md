# feat(progress-photos) — Écran ProgressPhotosScreen avec comparaison before/after
Date : 2026-03-11 19:09

## Instruction
docs/bmad/prompts/20260311-2145-photos-progression-C.md

## Rapport source
docs/bmad/prompts/20260311-2145-photos-progression-C.md

## Classification
Type : feat
Fichiers modifiés :
- `mobile/src/screens/ProgressPhotosScreen.tsx` (nouveau)
- `mobile/src/navigation/index.tsx`
- `mobile/src/screens/HomeScreen.tsx`
- `mobile/src/i18n/fr.ts`
- `mobile/src/i18n/en.ts`

## Ce qui a été fait
1. **Traductions i18n** : Ajouté namespace `progressPhotos` dans fr.ts et en.ts (titres, boutons, filtres, messages vides, confirmations). Ajouté clé `navigation.progressPhotos` et `home.tiles.photos`.

2. **ProgressPhotosScreen.tsx** : Écran complet avec :
   - Filtres par catégorie (Toutes/Face/Côté/Dos) via chips
   - Comparaison before/after automatique (plus ancienne vs plus récente de la catégorie filtrée)
   - Sélection manuelle de 2 photos pour comparaison (tap pour sélectionner)
   - Grille de miniatures (3 colonnes, format portrait 3:4)
   - Ajout via BottomSheet (choix caméra/galerie puis catégorie)
   - Suppression via long-press + AlertDialog de confirmation
   - État vide avec message d'encouragement
   - Pattern withObservables + useDeferredMount (comme StatsMeasurementsScreen)
   - Toutes les couleurs via useColors(), textes via useLanguage()
   - expo-image pour l'affichage, Portal pattern pour modals

3. **Navigation** : Route `ProgressPhotos` ajoutée dans RootStackParamList + Stack.Screen lazy.

4. **HomeScreen** : Tuile "Photos" ajoutée dans la section Statistiques avec icône camera-outline.

## Vérification
- TypeScript : ✅ zéro erreur
- Tests : ✅ 1734 passed, 112 suites
- Nouveau test créé : non

## Documentation mise à jour
aucune

## Statut
✅ Résolu — 20260311-1909

## Commit
c66ec4e feat(progress-photos): add ProgressPhotosScreen with before/after comparison
