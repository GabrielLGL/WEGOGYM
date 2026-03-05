# Kore — Liste des fonctionnalités

> [x] = Done | MVP = a faire pour le lancement | FINAL = roadmap long terme

---

## ENTRAINEMENT

- [x] Créer des programmes d'entraînement personnalisés
- [x] Organiser les séances par programme (drag & drop)
- [x] Dupliquer un programme ou une séance en un tap
- [x] Déplacer une séance d'un programme à un autre
- [x] Ajouter des exercices avec cibles (séries × reps × poids)
- [x] Lancer un entraînement live avec saisie en temps réel
- [x] Timer de repos configurable (durée, vibration, son)
- [x] Notification quand le repos est terminé
- [x] Détection automatique des records personnels (PRs)
- [x] Résumé post-entraînement (volume, durée, PRs, comparaison)
- [x] Ajouter une note après chaque séance
- [x] Supersets / Circuits
- [x] Relancer la dernière séance en 1 tap
- [x] Édition d'un historique post-workout
- [ ] `MVP` Timer par exercice (repos différent par exo)
- [ ] `MVP` Notes par exercice pendant le workout
- [ ] `FINAL` Progression automatique (suggestion poids/reps)

---

## EXERCICES

- [x] Bibliothèque de 873 exercices (catalogue cloud avec animations, ~29 animations locales)
- [x] Créer ses propres exercices (nom, muscles, équipement, description)
- [x] Filtrer par muscle (11 groupes) ou par équipement (4 types)
- [x] Recherche textuelle instantanée
- [x] Fiche détaillée par exercice (animation, description, notes perso en lecture)
- [x] Historique de performance par exercice avec graphique
- [x] Catalogue global importable depuis le cloud

---

## GAMIFICATION

- [x] Système XP et niveaux (1 à 100)
- [x] Streaks hebdomadaires avec objectif personnalisable
- [x] 50 badges à débloquer en 7 catégories
- [x] Tonnage cumulé lifetime avec milestones
- [x] Célébrations animées (badges, level up, milestones)
- [x] Catégories de badges : Sessions, Tonnage, Streak, Niveau, PRs, Volume, Exercices
- [ ] `FINAL` Thèmes débloquables (récompenses cosmétiques)

---

## STATISTIQUES

- [x] Durée : graphique évolution, moyenne, total, min/max
- [x] Volume : bar chart hebdo/mensuel, KPIs par période
- [x] Calendrier : grille mensuelle colorée par intensité
- [x] Exercices : Top 5 fréquence, PRs par exercice
- [x] Mensurations : poids, tour de taille, hanches, bras, poitrine (graphiques tendance)
- [x] Historique par exercice
- [ ] `FINAL` Rapports hebdo/mensuels automatiques
- [ ] `FINAL` Analytics avancées (balance musculaire, fatigue, volume optimal)

---

## ASSISTANT IA

- [x] Wizard intelligent en 9 étapes (programme) / 4 étapes (séance)
- [x] 10 types de split (Full Body, PPL, Arnold, PHUL…)
- [x] 4 objectifs (Bodybuilding, Power, Renfo, Cardio)
- [x] Gestion des blessures et priorités musculaires
- [x] Moteur offline (gratuit, toujours disponible)
- [x] Providers cloud (Claude, OpenAI, Gemini)
- [x] Prévisualisation du programme avant import
- [x] Génération de programme complet ou séance unique
- [ ] `FINAL` Deload / périodisation (recommandations repos)

---

## PERSONNALISATION

- [x] Mode sombre / mode clair
- [x] Design neumorphique
- [x] Langue : Français / English
- [x] Profil utilisateur (nom, niveau, objectif)
- [x] Timer repos personnalisable (durée, vibration, son)
- [x] Objectif hebdomadaire (1 à 7 séances/semaine)
- [x] Splash screen animé
- [ ] `MVP` Rappels d'entraînement (notifications planifiées)
- [ ] `FINAL` Widget Android (streak, prochain workout)

---

## DONNEES

- [x] 100% offline — fonctionne sans internet
- [x] Export complet en JSON
- [x] Import avec confirmation
- [x] Données sensibles chiffrées (Secure Store)
- [x] Onboarding guidé au premier lancement
- [x] Suppression de compte / données (RGPD)
- [ ] `FINAL` Cloud sync multi-device
- [ ] `FINAL` Photos de progression (before/after)

---

## SOCIAL & MONETISATION

- [ ] `FINAL` Partage de workout / PR / badge
- [ ] `FINAL` Leaderboard entre amis
- [ ] `FINAL` Mode coach (créer et partager des programmes)
- [ ] `FINAL` Premium / abonnement
- [ ] `FINAL` Communauté / feed
- [ ] `FINAL` Programme marketplace

---

## TECHNIQUE

- [x] React Native + Expo (performance native)
- [x] Nouvelle architecture (Fabric)
- [x] Base de données locale SQLite
- [x] Mise à jour réactive automatique de l'interface
- [x] Crash reporting (Sentry)
- [x] Notifications locales (timer de repos)
- [ ] `MVP` Deep testing Android (5+ appareils)
- [ ] `MVP` Performance audit (listes longues, mémoire, startup)
- [ ] `MVP` Play Store listing
- [ ] `FINAL` iOS (App Store)
- [ ] `FINAL` Intégration wearables (Google Fit, Apple Health, Garmin)
- [ ] `FINAL` Wear OS companion app
- [ ] `FINAL` Internationalisation (ES, DE, PT…)
