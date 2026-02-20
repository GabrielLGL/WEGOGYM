# Prompt analysé — Mise à jour des .md — 2026-02-20

## Demande originale
> "je veux mettre à jour tous les .md" → Mettre à jour le contenu (synchroniser avec l'état actuel du code)

## Analyse

### Fichiers concernés
Parmi les 32 fichiers .md du projet, seuls **4 sont des docs vivantes** à maintenir synchronisées avec le code :

| Fichier | Raison de l'update |
|---------|-------------------|
| `CLAUDE.md` | Architecture, patterns, Known Pitfalls → peut évoluer avec le code |
| `README.md` | Vue d'ensemble du projet → peut être obsolète |
| `docs/Commands.md` | Liste des commandes custom → à synchroniser avec `.claude/commands/` |
| `docs/AI_SETUP.md` | Config providers IA → vérifier Gemini model, endpoints, notes EU |

### Fichiers exclus (non-vivants)
- `docs/bmad/verrif/*.md` — rapports d'audit, mis à jour par `/verrif`
- `docs/bmad/*.md` (brainstorm, prd, architecture...) — archives de décisions
- `docs/stories/*.md` — user stories historiques
- `CHANGELOG.md` — mis à jour par `/changelog`

### Commande recommandée
`/doc` est exactement fait pour ça. Lancer en parallèle sur les 4 fichiers cibles.

## Commandes générées

| Groupe | Commande | Fichiers | Parallèle |
|--------|----------|----------|-----------|
| A | `/doc CLAUDE.md` | CLAUDE.md | avec B, C, D |
| B | `/doc README.md` | README.md | avec A, C, D |
| C | `/doc docs/Commands.md` | docs/Commands.md | avec A, B, D |
| D | `/doc docs/AI_SETUP.md` | docs/AI_SETUP.md | avec A, B, C |

## /do autonomes (si /doc non disponible)

### Groupe A — CLAUDE.md
```
/do Mettre à jour le fichier CLAUDE.md (C:\Users\gabri\Desktop\WEGOGYM\CLAUDE.md) pour le synchroniser avec l'état actuel du code.

Contexte : WEGOGYM est une app React Native (Expo 52) + TypeScript + Fabric + WatermelonDB. CLAUDE.md est le guide projet pour Claude Code.

Étapes :
1. Lire CLAUDE.md en entier
2. Lire mobile/src/model/schema.ts → vérifier que la section "Schema v15" est à jour
3. Lire mobile/src/components/ → vérifier section 4.1 Components
4. Lire mobile/src/hooks/ → vérifier section 4.2 Hooks
5. Lire mobile/src/model/utils/ → vérifier section 4.3 Utilities
6. Lire mobile/src/theme/index.ts → vérifier section 4.4 Theme
7. Lire .claude/commands/ → vérifier section 7 Commands
8. Mettre à jour uniquement ce qui a changé
9. Sauvegarder rapport dans docs/bmad/git-history/[date]-maj-claude-md.md

Contraintes :
- Ne pas changer le format ou la structure générale
- Ne pas supprimer de Known Pitfalls (section 3.1)
- Ajouter de nouveaux pitfalls découverts s'il y en a
- Pas de commit (doc only)
```

### Groupe B — README.md
```
/do Mettre à jour le fichier README.md (C:\Users\gabri\Desktop\WEGOGYM\README.md) pour refléter l'état actuel du projet.

Contexte : WEGOGYM est une app React Native (Expo 52) + TypeScript + Fabric + WatermelonDB. App de gym offline-first, dark mode only.

Étapes :
1. Lire README.md en entier
2. Lire CHANGELOG.md pour les dernières features ajoutées
3. Mettre à jour la liste des features si incomplète
4. Vérifier que la stack technique est à jour
5. Mettre à jour la date si présente
6. Sauvegarder rapport dans docs/bmad/git-history/[date]-maj-readme.md

Contraintes :
- Garder le format markdown existant
- Ne pas ajouter de sections qui n'existaient pas
- Pas de commit (doc only)
```

### Groupe C — docs/Commands.md
```
/do Mettre à jour le fichier docs/Commands.md (C:\Users\gabri\Desktop\WEGOGYM\docs/Commands.md) pour le synchroniser avec les commandes custom réellement disponibles.

Contexte : WEGOGYM utilise des skills Claude Code dans .claude/commands/. docs/Commands.md documente ces commandes.

Étapes :
1. Lire docs/Commands.md en entier
2. Lister tous les fichiers dans .claude/commands/ (glob *.md)
3. Pour chaque commande dans .claude/commands/, vérifier qu'elle est documentée dans docs/Commands.md
4. Ajouter les commandes manquantes, retirer les commandes supprimées
5. Vérifier que les descriptions sont à jour
6. Sauvegarder rapport dans docs/bmad/git-history/[date]-maj-commands-md.md

Contraintes :
- Ne pas changer le format du tableau
- Pas de commit (doc only)
```

### Groupe D — docs/AI_SETUP.md
```
/do Mettre à jour le fichier docs/AI_SETUP.md (C:\Users\gabri\Desktop\WEGOGYM\docs/AI_SETUP.md) pour refléter la configuration IA actuelle.

Contexte : WEGOGYM utilise Gemini API pour l'assistant IA. Known pitfalls : AbortSignal.timeout() inexistant sur Hermes → utiliser withTimeout(ms) de providerUtils.ts. Free tier EU a limit:0 depuis déc 2025. Modèle stable : gemini-2.0-flash (v1beta).

Étapes :
1. Lire docs/AI_SETUP.md en entier
2. Lire mobile/src/screens/AssistantScreen/ ou le dossier provider IA pour voir la config actuelle
3. Vérifier que le nom du modèle Gemini est correct (gemini-2.0-flash)
4. Vérifier que la note EU free tier est présente
5. Vérifier que la note AbortSignal.timeout() est présente
6. Mettre à jour les sections obsolètes
7. Sauvegarder rapport dans docs/bmad/git-history/[date]-maj-ai-setup-md.md

Contraintes :
- Ne pas changer le format du guide
- Pas de commit (doc only)
```
