# Changelog -- Gamification Base -- 2026-02-25

## Resume
Systeme complet de gamification pour WEGOGYM : XP par seance (80 base + 20/PR + 15 completion), niveaux 1-100 (formule lineaire 80+7N), streak hebdomadaire configurable (2-5x/sem), tonnage lifetime avec formatage kg/t, celebrations milestones via BottomSheet.

## Decisions cles
- Formule XP lineaire au lieu de power law pour une progression previsible (~500 seances pour niveau 100)
- Pas de XP retroactif (app pas encore lancee)
- Streak basee sur semaine ISO pour coherence internationale
- Detection milestones par comparaison before/after pour eviter re-triggers
- Milestones : 10/25/50/100/250/500 seances, 10K/50K/100K/500K/1M kg tonnage, chaque level-up

## Stories implementees
| Story | Statut | Description |
|-------|--------|-------------|
| S01 | OK | Schema migration -- 7 colonnes gamification |
| S02 | OK | Helpers XP & Niveaux |
| S03 | OK | Helpers Streak |
| S04 | OK | Helpers Tonnage |
| S05 | OK | Integration fin de seance |
| S06 | OK | Composants visuels (LevelBadge, XPProgressBar, StreakIndicator) |
| S07 | OK | Integration HomeScreen |
| S08 | OK | Settings streak target |
| S09 | OK | Milestones & Celebrations |

## Resultat QA
- TypeScript : clean
- Tests : 1172/1172 passed (dont 47 gamification)
- Issues corrigees : variable morte supprimee, haptic deplace de close vers open
- Pas de violations de patterns CLAUDE.md
