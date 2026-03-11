<!-- v1.0 — 2026-03-11 -->
# Rapport — Photos de progression — Groupe B — 20260311-2145

## Objectif
Installer `expo-image-picker` et créer un service de gestion des photos de progression : capture, stockage local, suppression, listing. Ce service encapsule toute la logique fichier pour que l'UI n'ait qu'à appeler des méthodes simples.

## Fichiers concernés
- `mobile/package.json` — ajouter dépendance `expo-image-picker`
- `mobile/src/services/progressPhotoService.ts` — **nouveau fichier** : service de gestion photos

## Contexte technique

### Stack
- Expo 52 (New Architecture / Fabric)
- `expo-file-system` ~18.0.12 déjà installé — utiliser pour les opérations fichier
- `expo-image` ~2.0.7 déjà installé — utilisé ailleurs pour afficher des images
- `expo-image-picker` n'est PAS encore installé — doit être ajouté

### Stockage des photos
- Les photos sont stockées dans le **dossier local de l'app** via `expo-file-system`
- Dossier dédié : `${FileSystem.documentDirectory}progress-photos/`
- Nommage : `{timestamp}_{category}.jpg` (ex: `1710180000_front.jpg`)
- Les URIs stockées en DB (Groupe A) pointent vers ces fichiers locaux
- **Jamais** de stockage cloud / externe pour le MVP

### API expo-image-picker
```typescript
import * as ImagePicker from 'expo-image-picker'

// Depuis la galerie
const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ['images'],
  allowsEditing: true,
  aspect: [3, 4],  // format portrait
  quality: 0.8,
})

// Depuis la caméra
const result = await ImagePicker.launchCameraAsync({
  allowsEditing: true,
  aspect: [3, 4],
  quality: 0.8,
})
```

## Étapes

1. **Installer** `expo-image-picker`
   ```bash
   cd mobile && npx expo install expo-image-picker
   ```

2. **Créer** `mobile/src/services/progressPhotoService.ts` avec les fonctions :

   ```typescript
   // Assure que le dossier progress-photos/ existe
   ensurePhotoDirectory(): Promise<void>

   // Demande les permissions caméra/galerie
   requestCameraPermission(): Promise<boolean>
   requestGalleryPermission(): Promise<boolean>

   // Capture depuis caméra → copie dans le dossier app → retourne l'URI locale
   capturePhoto(category?: string): Promise<string | null>

   // Sélectionne depuis galerie → copie dans le dossier app → retourne l'URI locale
   pickPhotoFromGallery(category?: string): Promise<string | null>

   // Supprime un fichier photo par son URI
   deletePhoto(photoUri: string): Promise<void>

   // Vérifie si un fichier photo existe
   photoExists(photoUri: string): Promise<boolean>
   ```

3. **Points d'attention** :
   - Toujours copier le fichier dans le dossier app (ne pas garder l'URI temporaire)
   - Gérer les permissions proprement (retourner false si refusé, pas d'exception)
   - Nettoyage : quand une photo est supprimée de la DB, supprimer aussi le fichier

## Contraintes
- Pas de `any` TypeScript — typer toutes les fonctions
- Pas de `console.log` sans `__DEV__`
- Le service doit être **pur** (pas de dépendance à WatermelonDB) — il gère uniquement les fichiers
- Gestion d'erreurs robuste (fichier introuvable, permissions refusées, espace disque)
- Format portrait 3:4 pour les photos de progression (standard bodybuilding)

## Critères de validation
- `npx tsc --noEmit` → zéro erreur
- `npm test` → zéro fail
- `expo-image-picker` apparaît dans package.json
- Le service compile sans erreur
- Les fonctions sont correctement typées (pas de `any`)

## Dépendances
Aucune dépendance — peut être lancé en parallèle avec Groupe A.

## Statut
⏳ En attente
