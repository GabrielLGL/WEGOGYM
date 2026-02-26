<!-- v1.0 — 2026-02-27 -->
# Prompt — fix(ExerciseTargetInputs) saisie rapide v2 — 20260227-0900

## Demande originale

"il y a toujours le probleme : ecrire vite 555 donne juste 55,
il y a un chiffre sur 2 qui n'est pas ajouté en ecrivant vite"

## Analyse de la vraie cause racine

Le fix précédent (déplacer clamp vers onBlur) ne résolvait PAS la race condition.

**Vraie cause :** `value={state}` sur un TextInput contrôlé React Native.
`setState(value)` est async. Quand le re-render arrive, `state` contient une
valeur STALE (en retard d'un caractère). React Native voit `value prop` ≠
`valeur native actuelle` → envoie une "correction" qui reset le natif à la
valeur stale → caractère perdu.

**Vrai fix :** `value={ref.current}` — la ref est mise à jour SYNCHRONIQUEMENT
dans onChangeText. Au moment du re-render async, `ref.current` = dernière valeur
tapée = ce que le natif affiche déjà → pas de correction → aucun caractère perdu.

## Groupes générés

| Groupe | Rapport | Fichiers | Vague | Statut |
|--------|---------|----------|-------|--------|
| A | `20260227-0900-fix-input-fast-type-A.md` | ExerciseTargetInputs.tsx + test | 1 | ✅ Terminé |

## Résultat

- 4 refs ajoutées (`localSetsRef`, `localWeightRef`, `repsMinRef`, `repsMaxRef`)
- Toutes les refs mises à jour synchroniquement avant setState dans chaque handler
- Tous les blur handlers lisent les refs (pas les closures stales)
- Tous les `value=` props utilisent `ref.current`
- TypeScript : 0 erreur
- Tests : 26/26 ✓
