# S06 — Composants visuels (LevelBadge, XPProgressBar, StreakIndicator)

## Story
**En tant que** pratiquant,
**je veux** voir mon niveau, ma barre XP et mon streak sous forme de composants visuels,
**afin d'** avoir un feedback visuel immediat de ma progression.

## Taches techniques
1. Creer `mobile/src/components/LevelBadge.tsx`
   - Props : `{ level: number }`
   - Rendu : icone ⭐ + texte "Niveau X", fontSize.lg, bold, colors.text
2. Creer `mobile/src/components/XPProgressBar.tsx`
   - Props : `{ currentXP: number, requiredXP: number, percentage: number }`
   - Rendu : barre 8px, fond colors.cardSecondary, remplissage colors.primary
   - Pourcentage affiche a droite : fontSize.xs, colors.textSecondary
3. Creer `mobile/src/components/StreakIndicator.tsx`
   - Props : `{ currentStreak: number, streakTarget: number }`
   - Rendu : "🔥 X semaines (obj: Y/sem)" ou "Pas encore de streak" si 0

## Specifications visuelles
- Tous les composants utilisent `colors.*` du theme
- Pas de hardcoded colors
- Composants fonctionnels TypeScript
- Props interfaces typees

## Criteres d'acceptation
- [ ] 3 composants crees
- [ ] LevelBadge affiche le niveau correctement
- [ ] XPProgressBar affiche la barre avec le bon pourcentage
- [ ] StreakIndicator affiche le streak ou le message par defaut
- [ ] Tous utilisent les tokens du theme
- [ ] `npx tsc --noEmit` passe

## Depend de
- S01

## Estimation
M (~1h)
