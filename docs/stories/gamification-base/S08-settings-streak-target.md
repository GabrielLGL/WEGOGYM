# S08 — Settings — Objectif streak

## Story
**En tant que** pratiquant,
**je veux** pouvoir modifier mon objectif hebdomadaire (2 a 5 seances/semaine) dans les reglages,
**afin que** le streak s'adapte a mon rythme.

## Taches techniques
1. Modifier `mobile/src/screens/SettingsScreen.tsx` :
   - Ajouter section "Gamification" apres les sections existantes
   - 4 boutons (2, 3, 4, 5) en row
   - Bouton selectionne : fond colors.primary, texte blanc
   - Boutons non selectionnes : fond colors.cardSecondary, texte colors.textSecondary
   - Sauvegarde immediate via `database.write()` au tap
   - Haptic `onSelect` au changement
2. Label : "Objectif hebdomadaire" + "seances/sem"

## Criteres d'acceptation
- [ ] Section "Gamification" visible dans les reglages
- [ ] 4 boutons affichant 2, 3, 4, 5
- [ ] Bouton selectionne correspond a `user.streakTarget`
- [ ] Tap change la valeur et sauvegarde immediatement
- [ ] Haptic onSelect au changement
- [ ] `npx tsc --noEmit` passe

## Depend de
- S01

## Estimation
S (~30min)
