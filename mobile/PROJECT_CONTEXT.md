# CONTEXTE PROJET : WEGOGYM (WatermelonDB + React Native)

## ⚡ DIRECTIVES IA (A LIRE EN PRIORITÉ)
- **STABILITÉ ANDROID** : Architecture Fabric activée. **NE JAMAIS** utiliser `<Modal>` natif. Utiliser des Overlays (Vues absolues) avec `isAlertVisible`.
- **DA SUPPRESSION** : Toujours utiliser l'overlay noir avec titre "Supprimer [Nom] ?", bouton Annuler (gris #3A3A3C) et bouton Supprimer (rouge #FF3B30).
- **SAISIE** : `keyboardType="numeric"` obligatoire pour les performances. Bloquer la validation si Séries/Reps/Poids <= 0 ou vide.
- **HAPTIQUE** : Utiliser `expo-haptics` pour chaque clic sur bouton d'option (•••), validation, roue crantée ou suppression.
- **NAVIGATION** : Le bouton retour matériel doit TOUJOURS ramener à l'onglet "Prog" (Home) avant de proposer de quitter (Double clic).

## 1. Architecture & Environnement
- **Stack** : Expo 52, WatermelonDB (v12), React Navigation 7.
- **Modèles** : Program, Session, Exercise, SessionExercise, PerformanceLog (Stats), History, Set, User.
- **Design** : Dark Mode intégral (#121212), animations fluides, zéro flash blanc (Configuré dans app.json).

## 2. Fonctionnalités Implémentées
- **Accueil (Prog)** : Titre "Liste des programmes :", bouton flottant bleu "+ Créer un Programme", accordéons fluides, réorganisation Drag & Drop.
- **Bibliothèque** : ~50 exercices de base, recherche 🔍, double filtrage (Muscle + Équipement), modification complète (Muscles/Equipement).
- **Planning (Séance)** : Indicateur de Record Personnel (PR) dynamique, poubelle 🗑️ directe avec confirmation, saisie sécurisée.
- **Stats** : Graphique LineChart réactif, historique formaté (n x m x o), suppression de points avec mise à jour instantanée.
- **Paramètres** : Roue crantée ⚙️, Réinitialisation totale avec rechargement automatique des exercices de base (Seed).

## 3. État du Projet
- **Navigation** : ✅ OK (Retour global universel via GlobalBackHandler).
- **Stabilité** : ✅ OK (Système de signaux HIDE/SHOW_TAB_BAR pour libérer l'espace visuel).
- **Sync** : ✅ OK (Modifications en bibliothèque répercutées instantanément partout).
