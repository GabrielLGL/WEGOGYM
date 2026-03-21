# Kore — Roadmap & Avancement
> Derniere MAJ : 2026-03-20

---

## Resume executif

L'app est **feature-complete pour un MVP** et a ete taguee `v0.1.0-mvp-20260319`. 120+ features implementees sur 14 sprints, 0 erreur TypeScript, score de sante 100/100, ship score 100/100. **Phase 2 Polish terminee** (4 rounds, 19 taches). Le MVP est pret a shipper sur le Play Store.

---

## Metriques

| Metrique | Valeur |
|----------|--------|
| Tests | 1943 (147 suites) |
| Erreurs TS | 0 |
| Score sante | 95/100 ([HEALTH.md](bmad/verrif/HEALTH.md)) |
| Ship score | 100/100 SHIP IT (20260319-2327) |
| Tag MVP | `v0.1.0-mvp-20260319` |
| Ecrans | ~30 (post-audit critique) |
| Helpers | ~40 (post-audit critique) |
| Routes | ~30 (post-audit critique) |
| Services | 7 (cloud AI providers retires) |
| Tables DB | 13 (schema v39) |
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

- [x] Wearables (Health Connect + HealthKit) — Sprint 8+
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
- [ ] Nutrition basique (calories / proteines)

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

Toutes les issues du verrif 20260319-1408 sont resolues ou classees faux positif :
- **A1-A2, B1-B2** : corriges dans commit `a088050` (useCallback, stale closures)
- **C1, D1-D3** : classes faux positif apres verification manuelle
- Score : 0 issue ouverte (date : 2026-03-19)

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
