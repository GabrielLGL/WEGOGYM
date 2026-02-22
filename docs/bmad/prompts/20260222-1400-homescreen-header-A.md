<!-- v1.0 — 2026-02-22 -->
# Rapport — HomeScreen Header — Groupe A — 20260222-1400

## Objectif
Deux corrections sur le header du HomeScreen :
1. **Supprimer le titre "WEGOGYM"** affiché en haut de l'écran
2. **Corriger le bouton Settings (⚙️)** qui ne répond pas au tap

## Fichiers concernés
- `mobile/src/navigation/index.tsx` (lignes 129-145)

## Contexte technique

### Suppression du titre
- Ligne 133 : `headerTitle: 'WEGOGYM'` → le remplacer par une chaîne vide `''`
- Conserver le reste des options header (headerRight, styles, etc.)

### Bouton Settings cassé
- Le bouton utilise `TouchableOpacity` importé de `react-native` (ligne 4)
- La route `Settings` existe bien (ligne 153, `SettingsScreen` importé ligne 15)
- **Cause probable** : avec `@react-navigation/native-stack` sur Android (Fabric/New Arch), les `TouchableOpacity` de `react-native` dans le `headerRight` ont des problèmes de détection de touch
- **Solution** : remplacer par `Pressable` de `react-native` (fonctionne mieux avec native-stack) et ajouter un `hitSlop` pour agrandir la zone tactile

## Étapes

1. Lire `mobile/src/navigation/index.tsx`
2. Ligne 133 : remplacer `headerTitle: 'WEGOGYM'` par `headerTitle: ''`
3. Ligne 4 : ajouter `Pressable` aux imports de `react-native` (si pas déjà importé)
4. Lignes 136-143 : remplacer le `TouchableOpacity` du `headerRight` par un `Pressable` avec :
   - `hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}`
   - Style identique : `{ marginRight: 20, padding: 5 }`
   - Même `onPress` : `() => { nav.navigate('Settings'); }`
5. Si `TouchableOpacity` n'est plus utilisé ailleurs dans ce fichier, le retirer des imports
6. Vérifier : `npx tsc --noEmit` depuis `mobile/`
7. Tester manuellement : le header ne doit plus afficher "WEGOGYM" et le bouton ⚙️ doit naviguer vers l'écran Paramètres

## Contraintes
- Ne pas casser : la navigation vers Settings, le header des autres écrans
- Respecter : dark theme (`colors.*` du theme), patterns CLAUDE.md
- Ne PAS utiliser `<Modal>` natif (interdit par CLAUDE.md §3)
- Garder le bouton ⚙️ visible et accessible

## Critères de validation
- `npx tsc --noEmit` → zéro erreur
- `npm test` → zéro fail
- Le titre "WEGOGYM" n'apparaît plus en haut du HomeScreen
- Le bouton ⚙️ navigue correctement vers l'écran Paramètres

## Dépendances
Aucune dépendance

## Statut
⏳ En attente
