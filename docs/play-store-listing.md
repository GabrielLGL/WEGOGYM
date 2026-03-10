# Kore — Play Store Listing (MVP)

> Document de référence pour la Google Play Console. Copy-paste ready.

---

## 1. Fiche principale (FR)

### Nom de l'application
```
Kore — Suivi Musculation
```
*(30 caractères max)*

### Description courte
```
Suivi muscu 100% offline : programmes, stats, gamification et IA.
```
*(66/80 caractères)*

### Description complète

```
Kore, c'est ton coach muscu dans la poche — sans internet, sans compte, sans pub.

PROGRAMMES SUR MESURE
Crée tes programmes d'entraînement avec autant de séances que tu veux. Organise tes exercices, ajoute des supersets et des circuits, duplique tes programmes en un tap. Tu gères tout, comme tu veux.

+873 EXERCICES
Une bibliothèque complète avec animations, filtrée par muscle et équipement. Tu ne trouves pas ton exo ? Crée-le. Chaque exercice garde son historique de performance et tes records personnels.

ENTRAÎNEMENT EN DIRECT
Lance ta séance et log chaque série en temps réel. Timer de repos configurable avec vibration et son. Détection automatique de tes records personnels (PR). Résumé post-séance avec volume, durée et comparaisons.

STATISTIQUES DÉTAILLÉES
Suis ta progression avec des graphiques clairs : durée par séance, volume par semaine/mois, calendrier d'activité, top exercices, et mesures corporelles (poids, tour de taille, hanches, bras, poitrine).

GAMIFICATION INTÉGRÉE
Gagne de l'XP à chaque séance, monte en niveau, maintiens ton streak hebdomadaire. Débloque 50 badges dans 7 catégories : sessions, tonnage, streak, niveau, records, volume et variété. Chaque entraînement compte.

ASSISTANT IA
Génère des programmes personnalisés grâce à un assistant intelligent. Choisis ton objectif, ton split, ta fréquence, tes priorités musculaires et tes contraintes. L'algorithme s'adapte à ton niveau.

100% OFFLINE & PRIVÉ
Toutes tes données restent sur ton téléphone. Aucun serveur, aucun tracking, aucune inscription obligatoire. Tu peux exporter tes données en JSON et les supprimer à tout moment. Conforme RGPD.

GRATUIT POUR COMMENCER
Plan gratuit : 3 programmes, historique 30 jours, suivi de performance complet.
Plan Pro : programmes illimités, historique illimité, stats avancées, export de données.
```
*(1 402/4 000 caractères)*

---

## 2. Fiche traduction (EN)

### App name
```
Kore — Workout Tracker
```

### Short description
```
100% offline gym tracker: programs, stats, gamification & AI coach.
```
*(67/80 characters)*

### Full description

```
Kore is your pocket gym coach — no internet, no account, no ads.

CUSTOM PROGRAMS
Build training programs with as many sessions as you need. Organize exercises, add supersets and circuits, duplicate programs in one tap. Full control, your way.

873+ EXERCISES
A complete library with animations, filtered by muscle and equipment. Can't find your exercise? Create it. Every exercise keeps its performance history and personal records.

LIVE WORKOUT TRACKING
Start your session and log every set in real time. Configurable rest timer with vibration and sound. Automatic personal record (PR) detection. Post-workout summary with volume, duration and comparisons.

DETAILED STATISTICS
Track your progress with clear charts: session duration, weekly/monthly volume, activity calendar, top exercises, and body measurements (weight, waist, hips, arms, chest).

BUILT-IN GAMIFICATION
Earn XP every session, level up, maintain your weekly streak. Unlock 50 badges across 7 categories: sessions, tonnage, streak, level, records, volume and variety. Every workout counts.

AI ASSISTANT
Generate personalized programs with an intelligent assistant. Choose your goal, split, frequency, muscle priorities and constraints. The algorithm adapts to your level.

100% OFFLINE & PRIVATE
All your data stays on your phone. No servers, no tracking, no mandatory sign-up. Export your data as JSON and delete it anytime. GDPR compliant.

FREE TO START
Free plan: 3 programs, 30-day history, full performance tracking.
Pro plan: unlimited programs, unlimited history, advanced stats, data export.
```

---

## 3. Graphiques — Checklist

### Feature Graphic (obligatoire)
- **Dimensions :** 1024 × 500 px
- **Format :** PNG ou JPEG, pas de transparence
- **Concept :** Fond dégradé purple (#6c5ce7) → cyan (#00cec9), logo Kore centré, tagline "FORGE TON CORPS" en blanc

### Screenshots (min 2, max 8)
- **Dimensions :** 1080 × 1920 px (portrait)
- **Format :** PNG ou JPEG

| # | Écran | Texte overlay suggéré |
|---|-------|----------------------|
| 1 | HomeScreen (dashboard complet) | "Ton tableau de bord" |
| 2 | Workout screen (séance en cours) | "Log chaque série en direct" |
| 3 | Stats — Volume (graphiques barres) | "Suis ta progression" |
| 4 | Exercices (bibliothèque + filtres) | "873+ exercices" |
| 5 | Assistant IA (wizard étape 1) | "Programmes générés par IA" |
| 6 | Badges (grille débloquée) | "Débloque 50 badges" |

### Icône
- **Dimensions :** 512 × 512 px
- **Fichier existant :** `mobile/assets/icon.png`

---

## 4. Content Rating (IARC)

| Question | Réponse |
|----------|---------|
| Violence | Non |
| Contenu sexuel | Non |
| Langage grossier | Non |
| Substances contrôlées | Non |
| Contenu généré par les utilisateurs | Non |
| Partage de localisation | Non |
| Achats numériques | Oui (abonnement Pro) |
| Publicités | Non |
| Jeux d'argent | Non |

**Classification attendue :** PEGI 3 / Everyone

---

## 5. Confidentialité & Data Safety

### Privacy Policy
```
https://kore-app.net/privacy
```

### Data Safety (formulaire Google Play)

| Question | Réponse |
|----------|---------|
| L'app collecte des données ? | Oui (stockage local uniquement) |
| L'app partage des données avec des tiers ? | Non |
| Données collectées | Informations de fitness (séances, exercices, mesures) — stockées sur l'appareil uniquement |
| Données chiffrées en transit ? | N/A (pas de transfert réseau) |
| Suppression des données possible ? | Oui (Paramètres → Supprimer mes données) |
| Compte obligatoire ? | Non |

---

## 6. Pricing & Distribution

| Champ | Valeur |
|-------|--------|
| Prix | Gratuit |
| Contient des achats intégrés | Oui |
| Contient des publicités | Non |
| Pays | Tous |
| Catégorie | Santé et remise en forme |
| Tags | workout tracker, musculation, fitness, offline, gym |

### Abonnements In-App

| SKU | Nom | Prix | Période |
|-----|-----|------|---------|
| `pro_monthly` | Kore Pro | 2,50 €/mois | Mensuel |
| `pro_annual` | Kore Pro Annuel | 19,99 €/an | Annuel |

---

## 7. Infos techniques

| Champ | Valeur |
|-------|--------|
| Package | `net.koreapp.mobile` |
| Version | 1.0.0 |
| SDK cible | Android 15 (API 35) |
| SDK minimum | Android 6.0 (API 23) |
| Architecture | arm64-v8a, armeabi-v7a, x86_64 |
| Orientation | Portrait uniquement |

---

## 8. Contact

| Champ | Valeur |
|-------|--------|
| Email développeur | contact@kore-app.net |
| Site web | https://kore-app.net |
| Politique de confidentialité | https://kore-app.net/privacy |
