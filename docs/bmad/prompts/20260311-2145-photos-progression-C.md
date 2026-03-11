<!-- v1.0 — 2026-03-11 -->
# Rapport — Photos de progression — Groupe C — 20260311-2145

## Objectif
Créer l'écran `ProgressPhotosScreen` avec prise de photo, galerie de progression, comparaison before/after, et intégration dans la navigation. C'est le coeur visible de la feature.

## Fichiers concernés
- `mobile/src/screens/ProgressPhotosScreen.tsx` — **nouveau fichier** : écran principal
- `mobile/src/navigation/index.tsx` — ajouter route + type params
- `mobile/src/screens/HomeScreen.tsx` — ajouter tuile de navigation vers ProgressPhotosScreen

## Contexte technique

### Stack & patterns obligatoires
- React Native + Expo 52 (Fabric / New Architecture)
- `withObservables` HOC pour les données réactives depuis WatermelonDB
- `useColors()` hook pour le thème dynamique (dark/light)
- `useLanguage()` hook pour i18n (FR/EN)
- `useHaptics()` hook pour le feedback haptique
- `<Portal>` pattern pour les modals — JAMAIS `<Modal>` natif
- `<AlertDialog>` pour les confirmations de suppression
- `<BottomSheet>` pour les options/menus
- `<Button>` composant unifié (variants: primary/danger/secondary/ghost)
- Couleurs depuis `theme/index.ts` — jamais hardcodées
- Spacing/borderRadius depuis le thème

### Modèle ProgressPhoto (créé par Groupe A)
```typescript
class ProgressPhoto extends Model {
  static table = 'progress_photos'
  date: number
  photo_uri: string
  category: string | null    // 'front' | 'side' | 'back' | null
  note: string | null
  body_measurement_id: string | null
  createdAt: Date
  updatedAt: Date
}
```

### Service progressPhotoService (créé par Groupe B)
```typescript
capturePhoto(category?: string): Promise<string | null>
pickPhotoFromGallery(category?: string): Promise<string | null>
deletePhoto(photoUri: string): Promise<void>
photoExists(photoUri: string): Promise<boolean>
```

### Écran de référence : StatsMeasurementsScreen
Voir `mobile/src/screens/StatsMeasurementsScreen.tsx` pour le pattern complet :
- HOC `withObservables` + enhance
- BottomSheet pour ajout
- Suppression avec AlertDialog
- Chart + liste historique

### Navigation existante
Voir `mobile/src/navigation/index.tsx` :
- Type `RootStackParamList` pour les params
- `React.lazy()` pour le lazy loading
- `<Stack.Screen>` avec `headerShown: false`

### i18n
Ajouter les traductions dans `mobile/src/i18n/fr.ts` et `mobile/src/i18n/en.ts` :
- Clés sous un namespace `progressPhotos` (ou nom cohérent avec l'existant)
- Vérifier le pattern existant dans ces fichiers

## Étapes

### 1. Ajouter les traductions i18n
Dans `fr.ts` et `en.ts`, ajouter les clés nécessaires (titres, boutons, labels).

### 2. Créer `ProgressPhotosScreen.tsx`

**Layout principal :**
```
┌─────────────────────────┐
│  ← Photos de progression│  (header avec back)
├─────────────────────────┤
│  [Front] [Side] [Back]  │  (filtres catégorie — ChipSelector)
├─────────────────────────┤
│                         │
│  ┌─────────┬─────────┐  │
│  │  Avant  │  Après  │  │  (comparaison before/after)
│  │  📷     │  📷     │  │  (deux photos côte à côte)
│  │  12 jan │  11 mar │  │  (dates en dessous)
│  └─────────┴─────────┘  │
│                         │
├─────────────────────────┤
│  📅 Historique          │
│  ┌─────┐┌─────┐┌─────┐ │  (grille scrollable de miniatures)
│  │ img ││ img ││ img │ │  (tap = sélectionner pour comparaison)
│  │ date││ date││ date│ │
│  └─────┘└─────┘└─────┘ │
├─────────────────────────┤
│  [📷 Prendre une photo] │  (bouton principal en bas)
│  [🖼️ Depuis la galerie] │  (bouton secondaire)
└─────────────────────────┘
```

**Fonctionnalités :**
- **Filtrage par catégorie** : chips "Tous", "Face", "Côté", "Dos"
- **Comparaison before/after** : sélectionner 2 photos → affichage côte à côte
  - Par défaut : la plus ancienne vs la plus récente (même catégorie)
  - L'utilisateur peut taper sur une miniature pour la mettre en "avant" ou "après"
- **Grille de miniatures** : toutes les photos, triées par date décroissante
- **Ajout** : BottomSheet avec choix "Caméra" / "Galerie" + sélection catégorie
- **Suppression** : long-press sur miniature → AlertDialog de confirmation → supprimer fichier + record DB
- **État vide** : message d'encouragement + bouton d'ajout quand aucune photo

**Gestion des données :**
- `withObservables` pour observer `progress_photos` (triées par date desc)
- Mutations dans `database.write()` :
  - Créer : après capture/sélection photo, créer un `ProgressPhoto` record
  - Supprimer : `destroyPermanently()` + `deletePhoto(uri)` du service

### 3. Ajouter la route dans navigation
- Ajouter `ProgressPhotos: undefined` dans `RootStackParamList`
- Lazy import du screen
- `<Stack.Screen>` avec `headerShown: false`

### 4. Ajouter la tuile dans HomeScreen
- Nouvelle tuile dans la grille de navigation du HomeScreen
- Icône appropriée (ex: `camera` ou `image` de la lib d'icônes utilisée)
- Navigation vers `'ProgressPhotos'`

## Contraintes
- **JAMAIS** de `<Modal>` natif — Portal pattern uniquement
- Pas de couleurs hardcodées — `useColors()` partout
- Pas de texte hardcodé — `useLanguage()` + i18n
- Pas de `any` TypeScript
- Pas de `console.log` sans `__DEV__`
- Respecter le neumorphisme épuré du design existant
- Photos en format portrait 3:4
- Toutes les mutations DB dans `database.write()`
- Image affichée avec `expo-image` (`<Image>` de `expo-image`, pas de `<Image>` RN)

## Critères de validation
- `npx tsc --noEmit` → zéro erreur
- `npm test` → zéro fail
- L'écran s'affiche correctement en dark et light mode
- La prise de photo fonctionne (caméra + galerie)
- La comparaison before/after affiche bien 2 photos côte à côte
- La suppression supprime le fichier ET le record DB
- La navigation depuis HomeScreen fonctionne
- Les textes sont en FR et EN

## Dépendances
**Dépend de Groupe A** (modèle ProgressPhoto + schema v36) ET **Groupe B** (service photos).
Lancer uniquement APRÈS validation des groupes A et B.

## Statut
✅ Résolu — 20260311-1909

## Résolution
Rapport do : docs/bmad/do/20260311-1909-feat-progress-photos-screen.md
