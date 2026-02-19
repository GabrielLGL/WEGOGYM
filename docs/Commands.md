# Guide des commandes — WEGOGYM

## Aide rapide

### `/plan`
Affiche le workflow quotidien complet en un coup d'oeil. Le memo de toutes les commandes.

---

## Matin

### `/morning`
Briefing du matin. Résume l'état du projet en 2 min : dernier verrif, dernier push, état git, tests, TODOs, et propose un plan du jour avec priorités.

### `/retro [période]`
Rétrospective du projet. Analyse le score de santé, les commits, les rapports verrif, le ratio feat/fix, et donne les tendances : ce qui va bien, ce qui stagne, ce qui régresse. Par défaut sur 7 jours.
```
/retro                → derniers 7 jours
/retro cette semaine  → cette semaine
/retro ce mois        → ce mois
```

---

## Journée

### `/do [description]`
Commande universelle. Détecte automatiquement le type d'action (fix, feat, refactor, style, chore, perf) et exécute en conséquence. Pour les fix, cherche automatiquement dans les rapports verrif pour avoir le contexte.
```
/do fuite mémoire RestTimer              → fix
/do refactor RestTimer en hook séparé    → refactor
/do ajouter loading spinner HomeScreen   → feat
/do migrer couleurs hardcodées Settings  → style
/do CR#6 SessionDetail double reload     → fix (avec contexte verrif)
/do optimiser FlatList HistoryScreen     → perf
```

### `/idee [description de l'idée]`
Pipeline complet de l'idée au code déployé. 9 phases, toutes interactives sauf le dev :
1. Brainstorming (cis-brainstorming-coach)
2. Product Brief (bmm-analyst)
3. PRD (bmm-pm)
4. Validation PRD (bmm-pm)
5. Architecture (bmm-architect)
6. UX Design (bmm-ux-designer)
7. Stories & Sprint (bmm-sm)
8. Implémentation — autonome (bmm-dev)
9. QA (bmm-qa)

Tu valides chaque phase avant de passer à la suivante. Les stories sont sauvegardées dans `docs/stories/[nom-feature]/`.
```
/idee ajouter un système de notifications push pour les rappels d'entraînement
/idee intégrer un mode social avec partage de programmes
```

### `/backup [nom]`
Crée une branche de sauvegarde locale avant un gros changement. Ne push pas, ne change pas de branche.
```
/backup                    → backup/main-20260219-1430
/backup avant-refactor-ia  → backup/main-avant-refactor-ia-20260219
```

### `/status`
État du projet en 10 secondes. Ultra-concis : branche git, fichiers modifiés, build, tests, dernière action, chose la plus urgente. Max 6 lignes.

### `/review`
Review du code avant push. Analyse le git diff, vérifie bugs/qualité/perf/tests, donne un verdict : PUSH ou CORRIGE D'ABORD. Ne corrige rien, signale seulement.

### `/doc [cible]`
Génère ou met à jour la documentation.
```
/doc RestTimer           → JSDoc sur le composant
/doc useProgramManager   → JSDoc sur le hook
/doc claude              → met à jour CLAUDE.md
/doc commands            → met à jour ce fichier
/doc all                 → tout documenter d'un coup
```

### `/perf`
Analyse de performance React Native. Cherche les re-renders inutiles, FlatList non optimisées, animations JS, queries WatermelonDB lourdes. Génère un rapport avec score perf /10.

### `/changelog [période]`
Génère un changelog propre basé sur l'historique git. Trie par type, regroupe les commits liés, met en avant les changements visibles.
```
/changelog              → depuis le dernier tag ou 20 derniers commits
/changelog last week    → dernière semaine
/changelog v1.0..v1.1   → entre deux tags
```

### `/gitgo`
Commit et push intelligent. Vérifie que rien de sensible est staged, lance build + tests, génère des commits atomiques par type (feat/fix/refactor), push, sauvegarde un rapport dans `docs/bmad/git-history/`.

---

## Soir / Nuit

### `.\run-verrif.ps1 [-mode safe|full|scan]`
Script autonome pour la nuit. Lance dans PowerShell avant de dormir.

**3 modes :**
- `-mode full` (défaut) — scan + corrections par niveaux + push si clean
- `-mode safe` — scan + corrections critiques seulement + push si clean
- `-mode scan` — scan seul, aucune correction, juste les rapports

**Flow du mode full :**
1. Désactive la mise en veille
2. Scan 6 passes (build, tests, code review, bugs, WatermelonDB, qualité)
3. Score de santé AVANT
4. Corrections par niveaux avec rollback :
   - Niveau 1 : Critiques (bugs, build, tests fail)
   - Niveau 2 : Warnings (any, console.log, hardcoded)
   - Niveau 3 : Suggestions (nommage, TODOs)
   - Chaque niveau vérifié → rollback si ça casse
5. Vérification finale
6. Score de santé APRÈS
7. Si CLEAN → commit & push. Si DIRTY → revert tout, aucun commit
8. Réactive la mise en veille

```powershell
.\run-verrif.ps1              # mode full
.\run-verrif.ps1 -mode safe   # critiques seulement
.\run-verrif.ps1 -mode scan   # scan sans correction
```

### `/verrif`
Même chose que le script mais en mode interactif dans Claude Code. Utilise quand t'es devant le PC.

---

## Reprise après /compact

| Commande | Reprend quoi |
|----------|-------------|
| `/idee-continue` | Pipeline feature |
| `/verrif-continue` | Vérification (lit STATUS.md pour les passes échouées) |
| `/test-continue` | Couverture de tests |

---

## Qualité & tests

### `/test-coverage`
Augmente la couverture de tests par priorité :
- P1 : Hooks critiques — 80%+ (useProgramManager, useSessionManager, useWorkoutState)
- P2 : Utils & helpers — 90%+ (databaseHelpers, validationHelpers)
- P3 : Hooks secondaires — 70%+
- P4 : Composants avec logique — 60%+
- P5 : Services — 50%+

### Sous-commandes verrif (une seule passe)
| Commande | Focus |
|----------|-------|
| `/verrif-build` | TypeScript |
| `/verrif-tests` | Tests |
| `/verrif-code-review` | Code review adversarial |
| `/verrif-bugs` | Bugs silencieux |
| `/verrif-db` | Cohérence WatermelonDB |
| `/verrif-qualite` | Code mort & qualité |

---

## Rapports et historique

```
docs/bmad/
├── verrif/
│   ├── HEALTH.md                    ← Score de santé au fil du temps
│   └── [YYYYMMDD-HHmm]/            ← Un dossier par run
│       ├── 01-build.md
│       ├── 02-tests.md
│       ├── 03-code-review.md
│       ├── 04-bugs-silencieux.md
│       ├── 05-watermelondb.md
│       ├── 06-qualite.md
│       ├── 07-fix-niveau1/2/3.md
│       ├── STATUS.md
│       └── RAPPORT.md
├── git-history/
│   └── [YYYYMMDD-HHmm]-verrif.md
└── brainstorm.md, prd.md, etc.

docs/stories/
├── WEGO-001 → WEGO-007
└── [nom-feature]/
```

---

## Commandes BMAD conservées

Agents appelés automatiquement par `/idee` et `/verrif` :

| Agent | Rôle |
|-------|------|
| `cis-brainstorming-coach` | Brainstorming |
| `bmm-analyst` | Analyse métier |
| `bmm-pm` | Product Manager |
| `bmm-architect` | Architecte |
| `bmm-ux-designer` | UX Designer |
| `bmm-sm` | Scrum Master |
| `bmm-dev` | Développeur |
| `bmm-qa` | QA |
| `bmm-code-review` | Code Review |
