# S03 — Section "Évolution par muscle" dans StatsVolumeScreen

## Description
Ajouter une section avec sélecteur de muscle et line chart montrant l'évolution des sets par semaine sur 8 semaines pour le muscle sélectionné.

## Fichiers à modifier
- `mobile/src/screens/StatsVolumeScreen.tsx` — +section "Évolution par muscle"

## UI à implémenter

Nouvelle section après la section S02 :

```
Évolution par muscle
─────────────────────────────────────────────
[Pectoraux] [Dos] [Épaules] [Biceps] ...    ← ChipSelector scrollable
                                             ← horizontale, allowNone=false

[LineChart — sets/semaine pour le muscle]
  10 ─────────────────────────────────────
   8 ──────────────────╮
   6 ─────────╮        │        ╭────────
   4          ╰────────╯────────╯
   2
   0
   03/02  10/02  17/02  24/02  03/03  ...
─────────────────────────────────────────────
[état vide si aucune donnée pour ce muscle]
```

## Détails techniques

### État local
```typescript
const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null)
```

### Liste des muscles disponibles
- Extraire la liste unique des muscles depuis `setsPerMuscleWeek` OU depuis tous les sets historiques
- Utiliser les muscles présents dans les `sets` de la période → `useMemo`
- Si liste vide → masquer la section

### Default muscle
- Premier muscle de la liste (le plus entraîné de la semaine)
- Fallback : premier muscle trouvé dans les sets récents

### LineChart
- Composant : `LineChart` de `react-native-chart-kit`
- Données : `computeSetsPerMuscleHistory(sets, exercises, histories, selectedMuscle, 8)`
- Labels : `weekLabel` de chaque entrée (ex: "03/02")
- Afficher 1 label sur 2 si trop dense (`i % 2 === 0 ? entry.weekLabel : ''`)
- couleur ligne : `colors.primary`
- `fromZero: true`
- `withInnerLines: false`
- yAxisSuffix="" (sets = entier, pas d'unité)

### ChipSelector
```tsx
<ChipSelector
  items={muscleList}
  selectedValue={selectedMuscle}
  onChange={muscle => { if (muscle) setSelectedMuscle(muscle) }}
  allowNone={false}
  noneLabel=""
/>
```

## Critères d'acceptation
- [ ] ChipSelector affiche les muscles entraînés (extraits des données réelles)
- [ ] Line chart se met à jour au changement de muscle sélectionné
- [ ] 8 points sur le chart (une par semaine, 0 pour semaines vides)
- [ ] Haptics `onSelect()` au changement de muscle (via ChipSelector)
- [ ] État vide si aucune donnée pour le muscle sélectionné
- [ ] Masqué si aucun muscle disponible
- [ ] `npx tsc --noEmit` → 0 erreur

## Estimation : M (2h)
## Dépendances : S01, S02
