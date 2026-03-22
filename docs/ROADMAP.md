# Kore — Roadmap & Avancement
> Derniere MAJ : 2026-03-21

---

## Resume executif

L'app est **feature-complete pour un MVP** et a ete taguee `v0.1.0-mvp-20260319`. 120+ features implementees sur 14 sprints, 0 erreur TypeScript, score de sante 100/100, ship score 100/100. **Phase 2 Polish terminee** (4 rounds, 19 taches). Le MVP est pret a shipper sur le Play Store.

---

## Metriques

| Metrique | Valeur |
|----------|--------|
| Tests | 2047 (156 suites) |
| Erreurs TS | 0 |
| Score sante | 95/100 ([HEALTH.md](bmad/verrif/HEALTH.md)) |
| Ship score | 100/100 SHIP IT (20260321-1010) |
| Tag MVP | `v0.1.0-mvp-20260321` |
| Ecrans | ~30 (post-audit critique) |
| Helpers | ~40 (post-audit critique) |
| Routes | ~30 (post-audit critique) |
| Services | 7 (cloud AI providers retires) |
| Tables DB | 15 (schema v42) |
| Badges | 50+ |
| Features | #1 → #120 |
| Sprints | 14 completes |
| Audit critique | 20260320: -21 ecrans, -13K LOC, -3 providers |

---

## Features — Training

- [x] Programmes, seances, exercices personnalises — Sprint 1-3
- [x] Supersets / Circuits (groupement, header visuel) — Sprint 1-3
- [x] Workout tracker temps reel avec rest timer — Sprint 1-3
- [x] Timer de repos configurable (duree, vibration, son) — Sprint 1-3
- [x] Timer par exercice (repos different par exo) — Sprint 1-3
- [x] Notes par exercice pendant le workout — Sprint 1-3
- [x] Detection automatique des PRs — Sprint 1-3
- [x] Resume post-entrainement anime (XP, confetti) — Sprint 3
- [x] Relancer la derniere seance en 1 tap — Sprint 1-3
- [x] Edition d'un historique post-workout — Sprint 1-3
- [x] Dupliquer programme / seance — Sprint 1-3
- [x] Historique avec soft-delete — Sprint 1-3
- [x] Progression automatique (prefill poids/reps) — Sprint 14
- [x] Deload / periodisation (recommandations repos) — Sprint 12

## Features — Exercises

- [x] Bibliotheque de 873 exercices (catalogue cloud + animations) — Sprint 1-3
- [x] Creer ses propres exercices (nom, muscles, equipement) — Sprint 1-3
- [x] Filtrer par muscle (11 groupes) / equipement (4 types) — Sprint 1-3
- [x] Recherche textuelle instantanee — Sprint 1-3
- [x] Fiche detaillee par exercice (animation, description) — Sprint 1-3
- [x] Historique de performance par exercice avec graphique — Sprint 5
- [x] Catalogue global importable depuis le cloud — Sprint 1-3
- [x] Alternatives d'exercices — Sprint 10

## Features — Gamification

- [x] Systeme XP et niveaux (1 a 100) — Sprint 1-3
- [x] Streaks hebdomadaires avec objectif personnalisable — Sprint 1-3
- [x] 50+ badges a debloquer en 7 categories — Sprint 1-3
- [x] Tonnage cumule lifetime avec milestones — Sprint 1-3
- [x] Celebrations animees (badges, level up, milestones) — Sprint 3
- [x] ~~Titres athlete~~ — Supprime (audit critique 20260320, fusionne dans Badges)
- [x] ~~Leaderboard~~ — Supprime (audit critique 20260320, architecture cassee sans backend)
- [x] ~~Self-Leagues~~ — Supprime (audit critique 20260320, over-engineered)
- [x] ~~Skill Tree~~ — Supprime (audit critique 20260320, code mort)
- [x] ~~Challenges personnels~~ — Supprime (audit critique 20260320, 5eme systeme reward)
- [x] ~~Activity Feed~~ — Supprime (audit critique 20260320, historique deguise)
- [x] ~~Bulletin mensuel~~ — Supprime (audit critique 20260320, condescendant)
- [ ] Themes debloquables (recompenses cosmetiques) — Phase 4

## Features — Stats (8 ecrans post-audit)

- [x] Calendrier (grille mensuelle coloree par intensite) — Sprint 5
- [x] Volume (bar chart hebdo/mensuel, KPIs) — Sprint 5
- [x] Duree (graphique evolution, moyenne, total) — Sprint 5
- [x] Exercices (Top 5 frequence, PRs par exercice) — Sprint 5
- [x] Mensurations (poids, taille, hanches, bras, poitrine) — Sprint 5
- [x] Heatmap — Sprint 9
- [x] Hall of Fame — Sprint 7
- [x] Compare — Sprint 11
- [x] Force Standards — Sprint 7
- [x] Rapports hebdomadaires automatiques — Sprint 12
- [x] ~~PRs Timeline~~ — Supprime (fusionne dans Hall of Fame)
- [x] ~~Training Split~~ — Supprime (faible valeur)
- [x] ~~Body Composition~~ — Supprime (fusionne dans Mensurations)
- [x] ~~Balance musculaire~~ — Supprime (fusionne dans Heatmap)
- [x] ~~Volume Forecast~~ — Supprime (code mort)
- [x] ~~Rest Time~~ — Supprime (code mort)
- [x] ~~Volume Distribution~~ — Supprime (fusionne dans Heatmap)
- [x] ~~Monthly Progress~~ — Supprime (fusionne dans Compare)
- [x] ~~Exercise Frequency~~ — Supprime (fusionne dans Exercices)
- [x] ~~Set Quality~~ — Supprime (code mort)
- [x] ~~Volume Records~~ — Supprime (code mort)
- [x] ~~Constellation~~ — Supprime (code mort)
- [x] ~~Hexagon~~ — Supprime (vanity metric)

## Features — HomeScreen (16+ cartes)

- [x] KPIs (seances, tonnage, PRs)
- [x] Gamification (level, XP, streak, classe athlete)
- [x] Streak heatmap 13 semaines
- [x] Streak milestones (jalons visuels)
- [x] Readiness score (recup/fatigue/regularite)
- [x] Fatigue index (ACWR)
- [x] Objectifs hebdo (seances + volume)
- [x] Resume derniere seance
- [x] Recuperation musculaire (grille par muscle)
- [x] Suggestion de repos
- [x] Motivation contextuelle
- [x] Rapport hebdo
- [x] Flashback (1 mois / 3 mois)
- [x] Recommandation deload
- [x] Exercice de la semaine

## Features — Assistant IA

- [x] Wizard intelligent en 9 etapes (programme) / 4 etapes (seance) — Sprint 1-3
- [x] 10 types de split (Full Body, PPL, Arnold, PHUL…) — Sprint 1-3
- [x] 4 objectifs (Bodybuilding, Power, Renfo, Cardio) — Sprint 1-3
- [x] Gestion des blessures et priorites musculaires — Sprint 1-3
- [x] Moteur offline (gratuit, toujours disponible) — Sprint 1-3
- [x] ~~Providers cloud (Claude, OpenAI, Gemini)~~ — Supprime (audit critique 20260320, pas de users)
- [x] Previsualisation du programme avant import — Sprint 1-3

## Features — Settings & Data

- [x] Dark / Light mode — Sprint 1-3
- [x] Design neumorphique — Sprint 1-3
- [x] Langue FR / EN (i18n custom) — Sprint 1-3
- [x] Profil utilisateur (nom, niveau, objectif) — Sprint 1-3
- [x] Onboarding guide au premier lancement — Sprint 1-3
- [x] Rappels d'entrainement (notifications planifiees) — Sprint 1-3
- [x] Export complet JSON — Sprint 1-3
- [x] Import avec confirmation — Sprint 1-3
- [x] ~~Donnees sensibles chiffrees (Secure Store)~~ — Supprime (audit 20260320, plus de providers cloud)
- [x] Suppression de compte / donnees (RGPD) — Sprint 1-3
- [x] Splash screen anime — Sprint 1-3

## Features — Services

- [x] Wearables (Health Connect + HealthKit) — Sprint 8+ (pesees uniquement, voir Phase HC-1/2/3 pour integration complete)
- [x] Widget Android (streak, prochain workout) — Sprint 8+
- [x] Photos de progression (before/after) — Sprint 8+
- [x] Partage (texte + image) — Sprint 8+
- [x] Crash reporting (Sentry) — Sprint 1-3
- [x] Notifications locales (timer de repos) — Sprint 1-3

## Features — Phase 4 (post-release)

### Priorite haute (impact adoption)
- [ ] Cloud backup (Google Drive / iCloud) — sauvegarde sans compte
- [ ] Onboarding progressif (guidage par etapes, decouverte features)
- [x] Empty states avec CTA sur tous les ecrans sans data
- [x] Toast/Snackbar global (feedback visuel apres actions)
- [x] Accessibilite (a11y labels, roles, screen reader support)

### Priorite moyenne (differenciation)
- [ ] Cloud sync multi-device (avec compte optionnel)
- [ ] Themes debloquables (recompenses cosmetiques)
- [ ] iOS (App Store)
- [ ] Widgets iOS
- [x] Skeleton loaders sur les ecrans stats
- [ ] Navigation stats groupee (Performance / Corps / Habitudes / Avance)
- [ ] Videos d'execution des exercices
- [ ] Nutrition (connexion MyFitnessPal / apps similaires + saisie manuelle)

### Health Connect — Integration complete (3 phases)

L'integration actuelle ne sync que les pesees. Plan pour exploiter le maximum de donnees Health Connect.

**Donnees disponibles via Health Connect :** SleepSession (phases deep/light/REM/awake), RestingHeartRate, HRV (HeartRateVariabilityRmssd), Steps, ActiveCaloriesBurned, TotalCaloriesBurned, BodyFat, LeanBodyMass, HeartRate (samples), Vo2Max, ExerciseSession, Weight, Nutrition (29 champs macro/micro).

> **Note :** Health Connect ne fournit pas de "sleep score" ni "energy score" — ce sont des scores proprietaires (Samsung Health, Fitbit, Garmin). On calcule nos propres scores a partir des donnees brutes (phases de sommeil, duree, HRV, resting HR), bases sur la **tendance personnelle** de l'utilisateur (moyenne glissante 14j) plutot que des seuils fixes.

#### Phase HC-1a — Auto-sync (priorite haute, ~1 jour)

- [ ] **Auto-sync au lancement** — Declencher `performSync()` apres affichage du Home (useEffect dans HomeScreen, pas App.tsx) si `wearable_provider !== null` (connecte = tout synce). Le flag `wearable_sync_weight` ne controle que le sous-ensemble poids. Cooldown 30min entre 2 syncs. Indicateur discret (icone sync dans le header). Extraire la logique sync du composant Settings vers `services/wearableSyncService.ts`. Backfill initial limite a 30 jours (comme le poids)

#### Phase HC-1b — Sommeil (priorite haute, ~2-3 jours)

- [ ] **Import SleepSession** — Nouvelle table `sleep_records` (duration_minutes, deep_minutes, light_minutes, rem_minutes, awake_minutes, source). Deduplication : garder la session la plus longue par periode 24h (00h-00h). Sessions < 3h exclues du score sommeil (siestes stockees mais non comptees). Backfill initial 30 jours
- [ ] **Widget sommeil Home** — Duree derniere nuit, barre empilee des phases, score de qualite base sur la tendance perso (compare a la moyenne 14j de l'utilisateur, pas des seuils fixes)
- [ ] **Helper `sleepHelpers.ts`** — `getSleepQuality(tonight, avg14d)`, `getLastNightSleep(records)`
- [ ] **Nouvelle permission Android** — `SleepSession` (read) dans AndroidManifest.xml + healthConnectService.ts
- [ ] **Interface HealthKit** — Ajouter `fetchSleepRecords(from, to)` dans `WearableServiceInterface` (implementation HealthKit en Phase iOS)

#### Phase HC-1c — HR / HRV (priorite haute, ~2 jours)

- [ ] **Import Resting HR + HRV** — Nouvelle table `daily_vitals` avec colonnes typees : `resting_hr` (number, BPM), `hrv_rmssd` (number, ms). Une ligne par jour. Pas de table EAV generique. Backfill initial 30 jours. Colonne `vo2max` ajoutee en HC-3 via migration de schema (pas de champ speculative)
- [ ] **Nouvelles permissions Android** — `RestingHeartRate`, `HeartRateVariabilityRmssd` (read)
- [ ] **Interface HealthKit** — Ajouter `fetchRestingHeartRate(from, to)`, `fetchHRV(from, to)` dans `WearableServiceInterface`

#### Phase HC-1d — Readiness enrichi (priorite haute, ~2 jours, depend de HC-1b + HC-1c)

> **Dependances :** HC-1a, HC-1b et HC-1c sont independants et peuvent etre faits en parallele. HC-1d depend de HC-1b et HC-1c (le readiness enrichi a besoin des donnees sommeil et vitals).

- [ ] **Ponderations dynamiques** — Le readiness score s'adapte aux donnees disponibles :
  - Toutes les donnees HC : Recovery 25% + Fatigue ACWR 25% + Sommeil 20% + HRV/HR 20% + Consistency 10%
  - Sommeil seul (pas de montre HR) : Recovery 30% + Fatigue 30% + Sommeil 25% + Consistency 15%
  - Aucune donnee HC : ponderations actuelles inchangees (Recovery 40% + Fatigue 35% + Consistency 25%)
  - Regle : les poids se redistribuent proportionnellement sur les facteurs disponibles. Jamais de trou dans le score
- [ ] **Logique HRV/HR** — Comparaison valeur lissee (moyenne mobile 3j) vs moyenne glissante 30j. Seuil : ±1 ecart-type de la fenetre 30j (personnalise : HRV stable = seuil serre, HRV variable = seuil large). Resting HR : logique inverse (plus bas = mieux)
- [ ] **Enrichir HomeBodyStatusSection** — Integrer sommeil et HR dans la carte readiness existante (pas de nouvelle carte). Sommeil (duree + qualite), HR repos (tendance), readiness enrichi. Objectif : l'utilisateur voit sa condition et s'adapte lui-meme. Le Home a deja 16+ cartes — on enrichit, on n'empile pas

#### Phase HC-2 — Enrichissement (priorite moyenne)

- [ ] **Recovery Score — ecran dedie** — Nouvel ecran `RecoveryScreen` : jauge circulaire 0-100, decomposition des facteurs (adapte aux donnees dispo), historique 7/14/30j calcule a la volee depuis `sleep_records` + `daily_vitals` + `histories` (useMemo avec deps stables). Pas de table `recovery_scores` — le recalcul est trivial et evite la dette si la formule evolue. Fallback perf : si les calculs deviennent lents (6+ mois de donnees, telephone bas de gamme), ajouter une colonne optionnelle `readiness_cache` dans `daily_vitals`
- [ ] **Pas + Calories** — Nouvelle table `daily_activity` (steps, active_calories, total_calories). Chip activite quotidienne sur le Home. Integration StatsCalendar : jours actifs en couleur differente
- [ ] **Body Fat + Lean Mass** — Ajouter colonnes `body_fat`, `lean_body_mass` sur `body_measurements`. Sync depuis HC. Courbe overlay dans StatsMeasurementsScreen
- ~~Nutrition~~ — Retiree de HC. A traiter comme feature standalone avec connexion MyFitnessPal / apps similaires (voir Priorite basse)
- [ ] **Badges Health Connect (~10 badges, 3 categories)**
  - `sleep` : 7 nuits au-dessus de sa moyenne 14j en 7j, 30 nuits au-dessus de sa moyenne, 7 nuits avec >25% deep sleep. Guard : badges sommeil actifs uniquement apres 14 jours de donnees (eviter badges gratuits au bootstrap)
  - `recovery` : Score >80 pendant 7j, 10 seances lancees en "optimal", 3 jours de repos quand readiness < 40 (on mesure le fait, pas l'intention)
  - `consistency_health` : 7j sync consecutifs, sommeil+poids+HR dans la meme semaine, 30j de donnees consecutifs
  - ~~`steps`~~ — Retire : Kore est une app de musculation, pas un tracker d'activite. Les badges pas dilueraient l'identite du produit
- [ ] **XP Smart Training** — Bonus +10 XP quand l'utilisateur s'entraine avec un Recovery Score "optimal"

#### Phase HC-3 — Avance (priorite basse)

- [ ] **HR pendant l'entrainement** — Apres fin de seance, lire HeartRate samples entre start/end time. Calculer avg_hr/max_hr a la volee au moment du sync — ne PAS stocker les samples bruts (restent dans Health Connect). Nouvelles colonnes `histories` : avg_hr, max_hr, calories_burned (source : TotalCaloriesBurned de HC pour la fenetre de la seance, pas d'estimation locale). Afficher dans detail historique. Si `daily_activity.active_calories` existe aussi (HC-2), priorite a la valeur par seance de `histories` dans le detail, `daily_activity` pour le resume quotidien
- [ ] **VO2Max** — Lire Vo2Max, ajouter colonne `vo2max` dans `daily_vitals` via migration schema. Widget "Forme physique" dans Stats
- [ ] **Stats avancees sommeil** — Ecran dedie sommeil avec tendances 7/30j, correlation sommeil vs performance (tonnage, PRs)

#### Resume des changements DB pour Health Connect

| Nouvelle table | Phase | Colonnes cles |
|----------------|-------|---------------|
| `sleep_records` | HC-1b | date, duration_minutes, deep/light/rem/awake_minutes, source |
| `daily_vitals` | HC-1c | date, resting_hr, hrv_rmssd (1 ligne/jour, colonnes typees). vo2max ajoute en HC-3 |
| `daily_activity` | HC-2 | date, steps, active_calories, total_calories, source |

| Colonnes ajoutees | Table | Phase |
|-------------------|-------|-------|
| body_fat, lean_body_mass | body_measurements | HC-2 |
| avg_hr, max_hr, calories_burned | histories | HC-3 |

> **Notes :** Pas de table `recovery_scores` — le score est calcule a la volee depuis les donnees brutes. Pas de table `health_metrics` EAV — remplacee par `daily_vitals` avec colonnes typees. Colonne `vo2max` ajoutee a `daily_vitals` en HC-3 seulement (pas de champ speculatif).

#### Degradation gracieuse

Le plan doit fonctionner dans tous les cas :

| Scenario | Comportement |
|----------|-------------|
| Pas de montre connectee | Readiness = ponderations actuelles (entrainement seul). Pas de widget sommeil/HR. Badges HC non affiches |
| HC connecte mais montre sans HR/HRV | Sommeil affiché si dispo, readiness redistribue le poids HR sur les autres facteurs |
| HC connecte puis deconnecte | Donnees historiques conservees (lectures). Widget Home masque. Readiness revient aux ponderations sans HC |
| Donnees partielles (ex: pas de deep sleep) | Score sommeil base uniquement sur la duree. Barre des phases affiche ce qui est dispo |

#### Parite HealthKit (iOS)

Chaque feature HC-x a un pendant HealthKit a implementer lors du port iOS. L'interface `WearableServiceInterface` doit etre etendue des HC-1b avec les methodes :
- `fetchSleepRecords(from, to): Promise<SleepRecord[]>`
- `fetchRestingHeartRate(from, to): Promise<HeartRateRecord[]>`
- `fetchHRV(from, to): Promise<HRVRecord[]>`
- `fetchSteps(from, to): Promise<StepsRecord[]>` (HC-2)
- `fetchHeartRate(from, to): Promise<HeartRateSample[]>` (HC-3)

L'implementation Android est prioritaire. Les stubs HealthKit renvoient `[]` jusqu'au port iOS.

#### Philosophie UX

L'objectif n'est **pas** de modifier automatiquement les programmes de l'utilisateur. Quand quelqu'un suit un programme, il s'y tient. Health Connect sert a :
1. **Informer** — Resume quotidien indicatif (sommeil, recup, HR) pour que l'utilisateur s'adapte lui-meme
2. **Enrichir les stats** — Correlations sommeil/performance, tendances HR, recovery historique
3. **Gamifier** — Badges, XP bonus, streaks sante (lies a la muscu, pas de vanity metrics)
4. **Pas de friction** — Sync auto silencieux, pas de popups "tu devrais te reposer"
5. **Degrader gracieusement** — Chaque feature fonctionne avec les donnees disponibles, pas de score casse

#### Metriques de succes

A suivre pour valider l'adoption et guider les decisions HC-2/3 :
- **Taux de connexion HC** — % d'utilisateurs qui connectent Health Connect (via `wearable_sync_logs`)
- **Retention sync a 30j** — % d'utilisateurs encore connectes apres 30 jours
- **Records synces/semaine** — Volume de donnees importees (indicateur d'utilisation reelle)
- **Engagement widget sommeil** — Le widget est-il vu ? (proxy : l'utilisateur scrolle-t-il jusqu'a la carte readiness)

---

### Priorite basse (long terme)
- [ ] Wear OS / Apple Watch companion app
- [ ] Internationalisation (ES, DE, PT…)
- [ ] Partage social avance (screenshots stylises)
- [ ] Mode coach (creer et partager des programmes)
- [ ] Premium / abonnement
- [ ] Communaute / feed
- [ ] Programme marketplace
- [ ] Notifications push intelligentes
- [ ] Challenges entre amis (temps reel)
- [ ] Comparaison 1RM avec stats globales

---

## Phases de release

### Phase 1 — Stabilisation (terminee)
- [x] Tests helpers Sprint 9-14 (35 helpers testes)
- [x] Tests ecrans Sprint 5-14 (30 ecrans testes)
- [x] Coverage 80%+ atteinte

### Phase 2 — Polish (terminee)
- [x] UI Review globale (coherence visuelle 51 ecrans)
- [x] Couleurs hardcodees → tokens theme
- [x] HomeScreen refactor (HomeHeroAction, HomeStatusStrip extraits)
- [x] DRY getMondayOfWeek (commit b8dcb76)
- [x] Perf audit HomeScreen (React.memo, useCallback, useMemo)
- [x] Empty states (EmptyState component + integration)
- [x] Error boundaries (ErrorBoundary wrapping app root)
- [x] Accessibilite (a11y labels sur tous les ecrans interactifs)
- [x] Toast system (creation + integration)
- [x] ScreenLoading + loading states
- [x] Nav type safety (0 `as never`)
- [x] Dead code cleanup
- [x] WorkoutSummarySheet split (895 → 5 sub-components)
- [x] StatsCalendarScreen split (806 → 3 sub-components)
- [x] FlatList getItemLayout optimization
- [ ] Test sur device reel (scroll, haptics, notifications)

### Phase 3 — Release
- [ ] Build production (`eas build --platform android --profile production`)
- [ ] Screenshots Google Play (5-8 ecrans cles)
- [ ] Description store FR/EN
- [ ] Politique de confidentialite (page web)
- [ ] Soumission Play Store

### Phase 4 — Roadmap post-release
Cloud sync, iOS, themes debloquables, partage avance, mode coach, premium (voir section Features — Phase 4).

---

## Sprints (1-14)

| Sprint | Date | Features cles |
|--------|------|---------------|
| 1-3 | 5-13 mars | Core app, gamification, assistant IA, legal |
| 4 | 13 mars | Animated recap, self-leagues, skill tree |
| 5 | 14 mars | Stats avances (calendar, exercises, measurements) |
| 6 | 14 mars | Leaderboard, selfLeagues, skillTree, activityFeed |
| 7 | 14 mars | Hexagon, hallOfFame, balance, titles, compare |
| 8 | 14 mars | Bulletin, constellation, collection, challenges, card |
| 9 | 15 mars | Heatmap, strength, trainingSplit, prTimeline, bodyComp |
| 10 | 15 mars | VolumeForecast, fatigueIndex, exerciseAlternatives, durationPredictor, exerciseMastery |
| 11 | 15 mars | RepMax, volumeDistribution, streakHeatmap, restTime, monthlyProgress |
| 12 | 17 mars | MuscleRecovery, bodyCompTrends, overtraining, workoutTips, plateau |
| 13 | 18 mars | Readiness, muscleBalance, density, exerciseFrequency, weeklyGoals |
| 14 | 18 mars | WorkoutSummary, setQuality, streakMilestones, volumeRecords, restSuggestions |

---

## Dette technique

Toutes les issues du verrif 20260322-2154 sont resolues :
- 1 CRIT + 3 WARN + 1 SUGG fixes dans commit `fb82f16`
- Score : 0 issue ouverte (date : 2026-03-22)

---

## Architecture

```
mobile/src/
├── components/        12 composants reutilisables
├── contexts/          2 contextes (Theme, Language)
├── hooks/             5 hooks custom
├── i18n/              FR + EN (1800+ lignes chacun)
├── model/
│   ├── models/        13 modeles WatermelonDB (schema v38)
│   └── utils/         53 helpers
├── navigation/        52 routes (Native Stack)
├── screens/           51 ecrans
├── services/          10 services
└── theme/             Couleurs, spacing, typography
```

---

## References

- **Score de sante** : [`docs/bmad/verrif/HEALTH.md`](bmad/verrif/HEALTH.md) (historique time-series)
- **Dernier verrif** : [`docs/bmad/verrif/20260321-0859/`](bmad/verrif/20260321-0859/)
- **Verdict ship** : `docs/bmad/verrif-ship/20260319-2327/VERDICT.md` — 100/100 SHIP IT
- **Sprints detailles** : `docs/bmad/do/` (un rapport par sprint/feature)
