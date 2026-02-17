# WEGOGYM 💪

[![CI Tests](https://github.com/GabrielLGL/WEGOGYM/actions/workflows/ci.yml/badge.svg)](https://github.com/GabrielLGL/WEGOGYM/actions/workflows/ci.yml)

Application mobile de suivi d'entraînement **offline-first** développée avec React Native, Expo et WatermelonDB.

## 🚀 Technologies

- **React Native** (Expo 52) + TypeScript
- **WatermelonDB** (SQLite/JSI) - Base de données locale réactive
- **React Navigation 7** (Native Stack + Bottom Tabs)
- **Jest + React Testing Library** - Tests unitaires
- **Architecture modulaire** avec hooks personnalisés et composants réutilisables

## 📱 Fonctionnalités

- ✅ Gestion de programmes d'entraînement personnalisés
- ✅ Création et suivi de séances
- ✅ Bibliothèque d'exercices avec filtres (muscles, équipement)
- ✅ Historique des performances avec PR (Personal Records)
- ✅ Statistiques et graphiques de progression
- ✅ Minuteur de repos configurable
- ✅ Mode sombre uniquement
- ✅ **100% offline** - Aucune connexion requise

## 🛠️ Installation

```bash
# Cloner le dépôt
git clone https://github.com/GabrielLGL/WEGOGYM.git
cd WEGOGYM/mobile

# Installer les dépendances
npm install

# Lancer l'application
npm start

# Lancer sur Android
npm run android

# Lancer les tests
npm test
```

## 📂 Structure du projet

```
mobile/src/
├── components/       # Composants réutilisables (AlertDialog, BottomSheet, Button, etc.)
├── hooks/            # Custom hooks (useHaptics, useModalState, etc.)
├── model/            # WatermelonDB (models, schema, utils)
├── navigation/       # React Navigation setup
├── screens/          # Écrans principaux (Home, SessionDetail, Exercises, etc.)
├── theme/            # Thème centralisé (colors, spacing, styles)
└── constants/        # Constantes (strings, muscles, équipements)
```

## 🧪 Tests

```bash
# Lancer tous les tests
npm test

# Avec coverage
npm test -- --coverage

# Mode watch
npm test -- --watch
```

**Coverage actuel** : ~95% sur les composants et hooks critiques

## 📖 Documentation

- **[CLAUDE.md](CLAUDE.md)** - Guidelines du projet et architecture
- **[mobile/MANUAL_TESTING_GUIDE.md](mobile/MANUAL_TESTING_GUIDE.md)** - Guide de tests manuels complet
- **[mobile/TESTING.md](mobile/TESTING.md)** - Documentation des tests Jest
- **[mobile/PHASE5_IMPROVEMENTS.md](mobile/PHASE5_IMPROVEMENTS.md)** - Historique des améliorations

## 🔧 Configuration CI/CD

GitHub Actions exécute automatiquement les tests à chaque push/PR sur `main` et `develop`.

Voir : [`.github/workflows/ci.yml`](.github/workflows/ci.yml)

## 📱 Build de production

```bash
# Build Android (EAS)
cd mobile
eas build --platform android --profile production
```

## 📄 Licence

Projet personnel - Gabriel LGL © 2026

---

**Développé avec ❤️ et React Native**
