<!-- v1.0 — 2026-03-11 -->
# Rapport — Rapports hebdo/mensuels automatiques — Groupe A — 20260311-1900

## Objectif
Créer la commande `/rapport` qui génère automatiquement un rapport hebdomadaire ou mensuel persistant, agrégeant toutes les données existantes du projet (santé, activité git, qualité, tâches, changelog).

## Fichiers concernés
- `.claude/commands/rapport.md` (NOUVEAU — le seul fichier à créer)
- `docs/COMMANDS.md` (mettre à jour la table des commandes — ajouter `/rapport`)
- `CLAUDE.md` (ajouter `/rapport` dans la table section 7)

## Contexte technique

### Commandes existantes à réutiliser comme modèle
- `/retro` (`.claude/commands/retro.md`) — lit HEALTH.md, git log, verrif STATUS, git-history. Chat-only, pas de fichier.
- `/changelog` (`.claude/commands/changelog.md`) — git log trié par type. Crée un fichier `docs/bmad/CHANGELOG-[date].md`.
- `/morning` — lit les mêmes sources + crée des action items dans `docs/bmad/morning/`.

### Sources de données (toutes déjà existantes)
| Donnée | Fichier | Format |
|--------|---------|--------|
| Score de santé | `docs/bmad/verrif/HEALTH.md` | Table MD avec historique |
| Commits | `git log --oneline --since="X"` | Git standard |
| Détails verrif | `docs/bmad/verrif/[YYYYMMDD-HHmm]/RAPPORT.md` | MD structuré |
| Historique push | `docs/bmad/git-history/` | 1 fichier MD par push |
| Tâches exécutées | `docs/bmad/do/` | 1 fichier MD par tâche |
| Action items | `docs/bmad/morning/` | Status ⏳/✅/⚠️ |
| Reviews | `docs/bmad/reviews/` | 1 fichier par review |

### Convention de nommage des rapports
Sortie : `docs/bmad/rapports/[YYYYMMDD]-[hebdo|mensuel].md`

### Structure du rapport (fusionner /retro + /changelog)
Le rapport doit contenir ces sections :
1. **Résumé exécutif** — 3-5 lignes, score santé début→fin, nb commits, ratio feat/fix
2. **Santé** — évolution du score, tendances par dimension (comme /retro)
3. **Changelog** — commits groupés par type (comme /changelog)
4. **Activité** — nb commits, fichiers touchés, top 3 fichiers modifiés
5. **Qualité** — runs verrif, couverture, problèmes récurrents
6. **Tâches** — résumé des /do exécutés avec leur statut
7. **Points en attente** — action items encore ⏳
8. **Recommandations** — 2-3 priorités pour la période suivante

### Argument de la commande
- `$ARGUMENTS` : `hebdo` (défaut) ou `mensuel`
- `hebdo` : 7 derniers jours
- `mensuel` : 30 derniers jours
- Accepte aussi des dates : `--since="2026-03-01"`

## Étapes

1. Créer `.claude/commands/rapport.md` avec le template complet de la commande, suivant le pattern des commandes existantes (retro.md, changelog.md).

2. La commande doit :
   - Lire `$ARGUMENTS` pour déterminer la période (hebdo par défaut)
   - Collecter les données des 7 sources listées ci-dessus
   - Générer le fichier `docs/bmad/rapports/[YYYYMMDD]-[type].md`
   - Afficher un résumé court dans le chat
   - Commiter et pusher le rapport

3. Mettre à jour `docs/COMMANDS.md` — ajouter `/rapport [hebdo|mensuel]` dans la table.

4. Mettre à jour `CLAUDE.md` section 7 — ajouter `/rapport` dans la table "Workflow quotidien".

## Contraintes
- Ne pas casser les commandes existantes (`/retro`, `/changelog`, `/morning`)
- Respecter le format des commandes Claude Code (`.claude/commands/*.md`)
- Le rapport doit être autonome (lisible sans contexte externe)
- Français pour le contenu, anglais pour le commit message
- Pas de dépendance npm — tout est basé sur git + lecture de fichiers MD existants

## Critères de validation
- Le fichier `.claude/commands/rapport.md` existe et suit le pattern des autres commandes
- `docs/COMMANDS.md` contient `/rapport`
- `CLAUDE.md` section 7 contient `/rapport`
- La commande est invocable via `/rapport` ou `/rapport mensuel`

## Dépendances
Aucune dépendance.

## Statut
⏳ En attente
