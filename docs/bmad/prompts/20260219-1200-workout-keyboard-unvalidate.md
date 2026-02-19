# Prompt analysé — workout keyboard + unvalidate — 2026-02-19

## Demande originale
"j'aimerais quand une seance est lancé et qu'on a le clavier ouvert que le bouton terminer la
seance reste en bas de l'ecran et donc passe sous le clavier sinon on peut vite cliquer dessus
et qu'on puisse dévalidé une serie si on s'est trompé"

## Analyse

### Feature 1 — Footer sous le clavier
- WorkoutScreen.tsx ligne 196 : <View style={styles.footer}>
- Utiliser useKeyboardAnimation(85) → Animated.Value translateY
- Quand clavier ouvert → footer translate vers le bas (hors écran)
- Quand clavier fermé → footer remonte à sa position

### Feature 2 — Dévalider une série
- databaseHelpers.ts : ajouter deleteWorkoutSet(historyId, exerciseId, setOrder)
- useWorkoutState.ts : ajouter unvalidateSet → supprime en DB, retire de validatedSets, soustrait du volume, remet les inputs
- WorkoutExerciseCard.tsx : bouton "↩" discret sur les séries validées
- WorkoutScreen.tsx : passer unvalidateSet comme prop à WorkoutExerciseCard

### Dépendances
- A1 (databaseHelpers) ← indépendant
- A2 (useWorkoutState) ← importe deleteWorkoutSet de A1, parallélisable si signature connue
- B (WorkoutExerciseCard + WorkoutScreen) ← dépend de A1 + A2

## Commandes générées
| Groupe | /do | Fichiers | Ordre |
|--------|-----|----------|-------|
| A1 | Ajouter deleteWorkoutSet | databaseHelpers.ts | Parallèle avec A2 |
| A2 | Ajouter unvalidateSet | useWorkoutState.ts | Parallèle avec A1 |
| B  | Footer keyboard animation + bouton ↩ | WorkoutExerciseCard.tsx, WorkoutScreen.tsx | Après A1+A2 |
