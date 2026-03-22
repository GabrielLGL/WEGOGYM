# Plan de sortie Play Store — Kore v1.0.0

> Date : 2026-03-22

---

## Etat actuel

| Element | Status | Detail |
|---------|--------|--------|
| Code | ✅ Pret | 2047 tests, 0 erreur TS, score 95/100 |
| Version | ✅ 1.0.0 | app.json + build.gradle sync |
| Package ID | ✅ `net.koreapp.mobile` | app.json + build.gradle |
| EAS Project | ✅ Configure | ID: `953438a0-...` |
| Icone 512px | ✅ Presente | `assets/kore_icon_512.png` |
| Adaptive icon | ✅ Configure | `kore_adaptive_fg.png` + bg `#181b21` |
| Feature graphic | ✅ Presente | `kore_feature_graphic.png` |
| Screenshots | ⚠️ 4 presentes | Play Store en demande 4-8 (minimum atteint) |
| Privacy policy | ✅ Publiee | `https://kore-app.net/privacy` |
| CGU | ✅ Publiees | `https://kore-app.net/cgu` |
| Mentions legales | ✅ Publiees | `https://kore-app.net/mentions-legales` |
| Sentry | ✅ Configure | Plugin dans app.json |
| Signing release | ❌ Manquant | build.gradle utilise `debug.keystore` pour release |
| Service account | ❌ Manquant | `google-service-account.json` requis pour `eas submit` |
| Compte dev Google | ❓ A verifier | $25 one-time fee, requis pour publier |
| Test device reel | ❌ Non fait | Jamais teste hors emulateur |

---

## Checklist complete — 4 phases

### Phase A — Prerequis Google (toi, hors code) ⏱️ 1-2h

Ces etapes se font dans le navigateur, pas dans le code.

- [ ] **A1. Compte Google Play Developer**
  - Va sur https://play.google.com/console
  - Si pas deja fait : inscription ($25 USD, paiement unique)
  - Remplit les infos developpeur (nom, adresse, email contact)
  - Delai : validation quasi-immediate pour un compte personnel

- [ ] **A2. Creer l'application dans la Play Console**
  - Play Console → "Creer une application"
  - Nom : "Kore — Suivi Musculation"
  - Langue par defaut : Francais
  - Type : Application (pas jeu)
  - Gratuite

- [ ] **A3. Remplir la Data Safety (obligatoire)**
  - Play Console → Contenu de l'appli → Securite des donnees
  - Kore est offline-first, pas de collecte de donnees → cocher :
    - "L'application ne collecte ni ne partage aucune donnee utilisateur"
  - Si Health Connect est active : declarer les types de donnees sante (lecture seule)
  - Lier ta politique de confidentialite : `https://kore-app.net/privacy`

- [ ] **A4. Remplir le questionnaire de classification du contenu**
  - Play Console → Contenu de l'appli → Classification du contenu
  - Remplir le questionnaire IARC (2min, reponses : pas de violence, pas de contenu sexuel, pas de drogue, pas de jeu d'argent)
  - Resultat attendu : "Tout public" ou "3+"

- [ ] **A5. Configurer la fiche Store**
  - Titre court (30 car) : "Kore — Suivi Musculation"
  - Description courte (80 car) : "Tracker d'entrainement gratuit. Programmes, stats, gamification. 100% offline."
  - Description longue (4000 car max) — voici un draft :

```
Kore est un tracker de musculation complet, gratuit et 100% hors-ligne.

PROGRAMMES & SEANCES
• Cree tes programmes personnalises (Full Body, PPL, Arnold, PHUL...)
• 873 exercices illustres avec filtres par muscle et equipement
• Supersets et circuits integres
• Timer de repos configurable par exercice
• Progression automatique : Kore prefill tes poids et reps

SUIVI & STATS
• Historique complet de chaque seance
• Graphiques de volume, duree, PRs
• Calendrier d'entrainement colore par intensite
• Heatmap musculaire
• Hall of Fame de tes records personnels
• Mensurations corporelles (poids, tour de taille, bras...)

GAMIFICATION
• XP et niveaux (1 a 100)
• 50+ badges a debloquer
• Streaks hebdomadaires
• Celebrations animees pour tes PRs et milestones

ASSISTANT IA GRATUIT
• Genere des programmes adaptes a ton niveau et objectif
• 10 types de split, 4 objectifs (force, hypertrophie, renforcement, cardio)
• Gere les blessures et priorites musculaires
• 100% offline — aucun abonnement, aucun compte requis

SANTE & RECUPERATION
• Score de readiness quotidien
• Index de fatigue (ACWR)
• Suggestions de repos personnalisees
• Compatible Health Connect (pesees, sommeil, frequence cardiaque)

CONFIDENTIALITE
• Tes donnees restent sur ton telephone
• Aucun compte requis
• Aucun tracking, aucune pub
• Export JSON complet de tes donnees

Kore est gratuit, sans pub, et respecte ta vie privee.
```

  - Screenshots : uploader les 4 existantes (`kore_screenshot_1.png` a `4.png`)
  - Feature graphic : `kore_feature_graphic.png`
  - Icone : `kore_icon_512.png`

- [ ] **A6. Creer un Google Cloud Service Account**
  - Google Cloud Console → IAM → Comptes de service
  - Creer un compte de service pour EAS Submit
  - Donner le role "Utilisateur de compte de service" + lier a la Play Console
  - Telecharger la cle JSON → sauvegarder en `mobile/google-service-account.json`
  - **NE PAS COMMITER ce fichier** (deja dans .gitignore normalement)
  - Guide : https://expo.dev/blog/automating-submissions-with-eas-submit

---

### Phase B — Signing & Build (code/terminal) ⏱️ 30min

- [ ] **B1. Generer un upload keystore de production**

```bash
# EAS genere et gere le keystore automatiquement avec ce profil
# Rien a faire manuellement si tu utilises EAS Build
# EAS cree le keystore au premier build production et le stocke sur ses serveurs
```

> **Note :** Avec EAS Build, tu n'as PAS besoin de generer un keystore manuellement. EAS le fait pour toi au premier build `production`. Il est stocke sur les serveurs Expo et reutilise automatiquement. Tu peux le telecharger plus tard avec `eas credentials`.

- [ ] **B2. Verifier la config Sentry DSN**
  - `app.json` → `extra.sentryDsn` est actuellement `null`
  - Si tu veux du crash reporting en prod, ajoute ton DSN Sentry
  - Sinon, Sentry est desactive silencieusement (pas bloquant)

- [ ] **B3. Verifier les variables d'environnement**
  - Copier `.env.example` → `.env` avec les bonnes valeurs
  - Le `EXPO_PUBLIC_SENTRY_DSN` doit pointer vers ton projet Sentry
  - Supabase est uniquement pour le site web (waitlist), pas bloquant pour l'app

- [ ] **B4. Lancer le build production**

```bash
cd mobile
eas build --platform android --profile production
```

  - Premiere fois : EAS te demandera de creer ou importer un keystore
  - Choisis "Generate a new keystore" → EAS le stocke securise
  - Le build prend ~10-20 minutes sur les serveurs EAS
  - Resultat : un `.aab` (Android App Bundle) pret pour le Play Store

- [ ] **B5. Tester le build sur un device reel**

```bash
# Telecharge l'APK/AAB depuis le dashboard EAS ou :
eas build:list --platform android --status finished
# Installe sur ton telephone Android pour verifier :
# - Splash screen
# - Onboarding flow complet
# - Creer un programme + lancer un workout
# - Timer de repos (vibration + son)
# - Haptics
# - Notifications
# - Dark/Light mode toggle
# - Export/Import JSON
# - Performance scroll sur listes longues (873 exercices)
```

---

### Phase C — Soumission (terminal + Play Console) ⏱️ 15min

- [ ] **C1. Soumettre via EAS**

```bash
cd mobile
eas submit --platform android --profile production
```

  - EAS utilise le `google-service-account.json` pour uploader le `.aab`
  - Track actuel : `internal` (test interne) → parfait pour commencer

- [ ] **C2. Tester en internal testing**
  - Play Console → Tests → Tests internes
  - Ajouter ton email comme testeur
  - Installer via le lien de test interne
  - Verifier que tout fonctionne sur le store (installation, mise a jour)

- [ ] **C3. Passer en production (quand pret)**
  - Option 1 : Promouvoir le build internal → production dans la Play Console
  - Option 2 : Modifier `eas.json` submit track de `internal` → `production` et re-submit
  - Choisir "Deploiement progressif" (10% → 50% → 100%) recommande pour la v1

---

### Phase D — Post-soumission ⏱️ Variable

- [ ] **D1. Attendre la review Google**
  - Premier app : review manuelle, 1-7 jours
  - Verifier la Play Console quotidiennement pour les rejets eventuels
  - Causes de rejet courantes :
    - Data Safety mal remplie
    - Privacy policy non accessible (verifier que `kore-app.net/privacy` est up)
    - Permissions non justifiees (deja gere avec `blockedPermissions` dans app.json)
    - Contenu medical/sante sans disclaimer (le CGU a deja un health warning)

- [ ] **D2. Mettre a jour la roadmap**
  - Marquer Phase 3 comme terminee
  - Ajouter le lien Play Store dans le README / site web
  - Mettre a jour le tag : `v1.0.0-release`

- [ ] **D3. Monitoring post-launch**
  - Sentry : surveiller les crashes (si DSN configure)
  - Play Console : ANR rate, crash rate, ratings
  - Objectif : <1% crash rate, 0 ANR

---

## Resume : l'ordre exact

```
1. Compte Google Play Developer ($25)         ← si pas deja fait
2. Creer l'app dans la Play Console            ← 10min formulaire
3. Data Safety + Classification + Fiche Store  ← 30min formulaire
4. Service Account JSON                        ← 15min Google Cloud
5. eas build --platform android --production   ← 15-20min build
6. Tester sur device reel                      ← 30min test manuel
7. eas submit --platform android               ← 2min
8. Test internal → Promouvoir en production    ← Play Console
9. Attendre review Google                      ← 1-7 jours
```

**Temps total estime : ~3h de travail actif + 1-7j d'attente review**

---

## Risques et mitigations

| Risque | Impact | Mitigation |
|--------|--------|------------|
| Rejet pour Data Safety | Bloquant | Declarer "aucune collecte" + lier privacy policy |
| Rejet pour Health Connect | Moyen | Declarer les permissions sante en lecture seule |
| Crash sur device reel (non teste) | Haut | Phase B5 obligatoire avant soumission |
| Bundle size trop gros | Faible | AAB gere le split par architecture |
| Keystore perdu | Critique | EAS stocke le keystore, recuperable via `eas credentials` |
| Privacy policy inaccessible | Bloquant | Verifier `kore-app.net` uptime avant submit |

---

## Ce qui est deja pret (rien a faire)

- ✅ Package ID unique (`net.koreapp.mobile`)
- ✅ Version 1.0.0 (versionCode 1)
- ✅ Icones (adaptive, 512px, vector)
- ✅ Splash screen
- ✅ Feature graphic
- ✅ 4 screenshots
- ✅ Privacy policy + CGU + Mentions legales publiees sur `kore-app.net`
- ✅ Permissions bloquees (camera, micro, contacts, location, phone, calendar)
- ✅ Offline-first (pas de backend requis)
- ✅ Proguard active pour release
- ✅ EAS project configure
- ✅ Sentry plugin integre
- ✅ Health disclaimer dans les CGU
