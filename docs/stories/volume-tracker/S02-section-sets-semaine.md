# S02 — Section "Sets par muscle cette semaine" dans StatsVolumeScreen

## Description
Ajouter une nouvelle section dans StatsVolumeScreen affichant les sets par groupe musculaire pour la semaine courante, avec des barres de progression proportionnelles.

## Fichiers à modifier
- `mobile/src/screens/StatsVolumeScreen.tsx` — +section "Sets par muscle — semaine actuelle"

## UI à implémenter

Nouvelle section après "Top exercices par volume" existant :

```
Sets par muscle — semaine actuelle
─────────────────────────────────────────────
Pectoraux                          8 sets
████████████████░░░░░░░░░░░░░░░░  80%

Dos                               10 sets
██████████████████████████ 100%

Épaules                            4 sets
██████████░░░░░░░░░░░░░░░░  40%
─────────────────────────────────────────────
[état vide si aucun set cette semaine]
```

## Détails techniques

- Appel : `computeSetsPerMuscleWeek(sets, exercises, histories)`
- Mémoïsation : `useMemo` (dépend de `sets`, `exercises`, `histories`)
- Barres : `View` avec `width: (muscle.sets / maxSets * 100) + '%'`, hauteur 6px, borderRadius 3
- Couleur barre : `colors.primary`
- Fond barre vide : `colors.separator`
- Max 8 muscles (déjà géré par le helper)
- État vide : `"Aucun set enregistré cette semaine"` italic `colors.textSecondary`
- Pas de BarChart horizontal (chart-kit n'en propose pas d'horizontal)

## Critères d'acceptation
- [ ] Section visible dans StatsVolumeScreen sous "Top exercices"
- [ ] Barres proportionnelles (100% = muscle le plus entraîné de la semaine)
- [ ] Muscle + nombre de sets affiché sur chaque ligne
- [ ] État vide affiché si aucun set cette semaine
- [ ] Données mises à jour en temps réel (réactivité withObservables héritée)
- [ ] Dark mode uniquement (colors.*)
- [ ] `npx tsc --noEmit` → 0 erreur

## Estimation : S (1h)
## Dépendances : S01
