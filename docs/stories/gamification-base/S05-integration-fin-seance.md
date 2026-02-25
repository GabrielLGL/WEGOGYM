# S05 — Integration fin de seance

## Story
**En tant que** pratiquant,
**je veux** que mon XP, niveau, tonnage et streak soient mis a jour automatiquement a la fin de chaque seance,
**afin que** ma progression soit trackee sans action manuelle.

## Taches techniques
1. Identifier le point d'integration exact dans le flow de fin de seance (WorkoutSummarySheet ou handler de validation)
2. Capturer l'etat `before` (totalXp, level, totalTonnage, totalSessions)
3. Calculer : `calculateSessionXP()`, `calculateSessionTonnage()`, `calculateLevel()`, `updateStreak()`
4. Ecrire les nouvelles valeurs sur User dans le meme `database.write()` que la sauvegarde existante
5. Capturer l'etat `after` pour la detection de milestones (S09)
6. Tests d'integration

## Flow
```
Fin de seance
  → calculer XP (base + PR + completion)
  → calculer tonnage seance
  → calculer nouveau niveau
  → evaluer streak
  → database.write(() => {
      // sauvegarde existante (history, sets)
      // + user.update(gamification)
    })
```

## Criteres d'acceptation
- [ ] XP incremente apres chaque seance
- [ ] Niveau mis a jour si XP suffisant
- [ ] Tonnage incremente du tonnage de la seance
- [ ] Streak evalue et mis a jour
- [ ] Tout dans un seul `database.write()`
- [ ] Flow existant (history, sets) non casse
- [ ] `npx tsc --noEmit` passe
- [ ] Tests existants toujours verts

## Depend de
- S02, S03, S04

## Estimation
L (~2h)
