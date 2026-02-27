<!-- v1.0 — 2026-02-27 -->
# Prompt — calendar-detail — 20260227-1630

## Demande originale
"il faudrait ne pas afficher les jours du precedent mois (par exemple dans fevrier 2026 on affiche pas le 31 janvier), aussi quand on clique sur un jour la seance doit s'afficher en dessous on pourrais mettre nom de la seance tiré de nom du programme puis la liste des exercices avec les poids mis pour chaque series de chaque exercice"

## Groupes générés
| Groupe | Rapport | Fichiers | Vague | Statut |
|--------|---------|----------|-------|--------|
| A | docs/bmad/prompts/20260227-1630-calendar-detail-A.md | StatsCalendarScreen.tsx + test | 1 | ⏳ |

## Ordre d'exécution
1 seul groupe (tout dans le même fichier) → lancer directement.

## Résumé des changements

### 1. Masquer les jours hors mois
- Cellules `!isCurrentMonth` → `<View style={daySpacer} />` (transparent, non-pressable, pas de testID)
- La structure de la grille reste inchangée (alignement préservé)

### 2. Carte de détail enrichie
- Renommage `tooltip` → `detail`, `TooltipInfo` → `DayDetail`
- Nouveau type `DayDetail` : `{ dateKey, label, count, programName, sessionName, durationMin, exercises: ExerciseDetail[] }`
- Fetch chain : `History → Session → Program` (programName) + `History → Set[] → Exercise` (exercices + séries)
- Affichage : programme en titre bold + durée, séance en sous-titre, exercices avec chips `80 kg × 10`
- PR en couleur `colors.warning`
