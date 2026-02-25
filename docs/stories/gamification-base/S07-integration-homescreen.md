# S07 — Integration HomeScreen

## Story
**En tant que** pratiquant,
**je veux** voir ma progression gamification directement sur le dashboard,
**afin d'** avoir un apercu immediat de mon niveau, streak et tonnage a chaque ouverture.

## Taches techniques
1. Modifier `mobile/src/screens/HomeScreen.tsx` :
   - Ajouter une nouvelle card entre la header card et les sections de tuiles
   - Integrer `LevelBadge`, `XPProgressBar`, `StreakIndicator`
   - Utiliser `xpToNextLevel()` pour calculer les props de XPProgressBar
2. Ajouter un 4e KPI "Tonnage" dans la row existante
   - Utiliser `formatTonnage(user.totalTonnage)`
3. Les donnees viennent du User observe via withObservables (deja en place)

## Layout
```
[Header card existante + 4 KPIs]
[Nouvelle card gamification]
  ⭐ Niveau 12
  [████████████░░░░░░░░] 68%
  🔥 5 semaines (obj: 3/sem)
[Sections de tuiles existantes]
```

## Criteres d'acceptation
- [ ] Card gamification visible sur HomeScreen
- [ ] LevelBadge affiche le niveau du User
- [ ] XPProgressBar affiche la progression vers le prochain niveau
- [ ] StreakIndicator affiche le streak et l'objectif
- [ ] 4e KPI "Tonnage" affiche avec formatTonnage()
- [ ] Reactif via withObservables (se met a jour en temps reel)
- [ ] Dark mode respecte (colors.* du theme)
- [ ] `npx tsc --noEmit` passe

## Depend de
- S06

## Estimation
M (~1h)
