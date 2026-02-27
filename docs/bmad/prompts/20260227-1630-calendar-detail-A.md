<!-- v1.0 — 2026-02-27 -->
# Rapport — calendar-detail — Groupe A — 20260227-1630

## Objectif
Deux améliorations dans `StatsCalendarScreen.tsx` :
1. **Masquer les jours hors mois** — ne plus afficher Jan 31 dans la vue Février (cellule transparente sans contenu)
2. **Carte de détail au clic** — au lieu d'un tooltip minimaliste, afficher une carte complète : nom du programme, liste des exercices avec poids/reps de chaque série

---

## Fichiers concernés
- `mobile/src/screens/StatsCalendarScreen.tsx`
- `mobile/src/screens/__tests__/StatsCalendarScreen.test.tsx`

---

## Contexte technique

### Stack
- React Native (Expo 52) + TypeScript strict — pas de `any`
- WatermelonDB — toutes les mutations dans `database.write()`, fetch via `.fetch()`
- `useColors()` hook — jamais de couleurs hardcodées hors `intensityColors` de `theme/index.ts`
- Composants fonctionnels uniquement

### Modèle de données (chaîne de fetch)
```
History
  ├── .session.fetch()        → Session { name: string }
  │     └── .program.fetch()  → Program { name: string }
  └── .sets.fetch()           → Set[]
        ├── .weight: number
        ├── .reps: number
        ├── .setOrder: number
        ├── .isPr: boolean
        └── .exercise.fetch() → Exercise { name: string }
```

### État actuel du composant
Le composant `StatsCalendarScreenBase` dans `StatsCalendarScreen.tsx` affiche :
- Une grille mensuelle avec `generateMonthGrid(year, month, calendarData) → WeekRow[]`
- Les cellules `DayCell` ont un champ `isCurrentMonth: boolean`
- Le state `tooltip: TooltipInfo | null` contient `{ dateKey, label, count, sessions: SessionDetail[] }`
- `SessionDetail = { name: string, durationMin: number | null }`
- `handleDayPress` fetche `h.session.fetch()` → nom, calcule la durée

---

## Changement 1 — Masquer les jours hors mois

### Dans le rendu des cellules
Pour les cellules `!day.isCurrentMonth` : remplacer le `<TouchableOpacity>` + `<View dayBox>` par un simple spacer `<View style={styles.daySpacer} />` (même dimensions que `dayBox`, fond transparent, pas de texte, pas de pressable).

```tsx
// Avant
if (!day.isCurrentMonth) → cellule grisée avec numéro dim

// Après
if (!day.isCurrentMonth) → <View style={styles.daySpacer} />
// daySpacer = { width: DAY_SIZE, height: DAY_SIZE } (identique à dayBox pour alignement)
```

Pas de modification à `generateMonthGrid` — les cellules hors mois sont toujours générées pour l'alignement de la grille, elles sont juste rendues transparentes et non-interactives.

---

## Changement 2 — Carte de détail enrichie

### Nouveaux types (remplacer `TooltipInfo` et `SessionDetail`)

```typescript
interface SetDetail {
  setOrder: number
  weight: number
  reps: number
  isPr: boolean
}

interface ExerciseDetail {
  exerciseName: string
  sets: SetDetail[]
}

interface DayDetail {
  dateKey: string
  label: string
  count: number
  programName: string        // Session.program.name — ex: "PPL Push"
  sessionName: string        // Session.name — ex: "Poitrine A"
  durationMin: number | null
  exercises: ExerciseDetail[]
}
```

Remplacer le state `tooltip: TooltipInfo | null` par `detail: DayDetail | null`.

### Logique de fetch dans `handleDayPress`

```typescript
const handleDayPress = async (day: DayCell) => {
  if (day.isFuture || !day.isCurrentMonth) return

  // Toggle off si même jour
  if (detail?.dateKey === day.dateKey) {
    setDetail(null)
    return
  }

  const label = day.date.toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  if (day.count === 0) {
    setDetail({ dateKey: day.dateKey, label, count: 0,
      programName: '', sessionName: '', durationMin: null, exercises: [] })
    return
  }

  // Filtrer les histories de ce jour
  const dayHistories = histories.filter(
    h => h.deletedAt === null && toDateKey(h.startTime) === day.dateKey
  )

  // Agréger toutes les séances du jour (en général 1, mais peut être plusieurs)
  const allExercises: ExerciseDetail[] = []
  let programName = ''
  let sessionName = ''
  let totalDurationMin = 0

  await Promise.all(
    dayHistories.map(async (h) => {
      // Session + Programme
      try {
        const session = await h.session.fetch()
        if (session) {
          if (!sessionName && session.name) sessionName = session.name
          try {
            const program = await session.program.fetch()
            if (program?.name && !programName) programName = program.name
          } catch { /* programme supprimé */ }
        }
      } catch { /* session supprimée */ }

      // Durée
      if (h.endTime) {
        totalDurationMin += Math.round(
          (h.endTime.getTime() - h.startTime.getTime()) / 60000
        )
      }

      // Sets → regrouper par exercice
      try {
        const sets = await h.sets.fetch()
        // Map exerciceId → ExerciseDetail
        const exerciseMap = new Map<string, ExerciseDetail>()

        await Promise.all(
          sets.map(async (s) => {
            let exName = 'Exercice inconnu'
            try {
              const ex = await s.exercise.fetch()
              if (ex?.name) exName = ex.name
            } catch { /* exercice supprimé */ }

            const key = exName
            if (!exerciseMap.has(key)) {
              exerciseMap.set(key, { exerciseName: exName, sets: [] })
            }
            exerciseMap.get(key)!.sets.push({
              setOrder: s.setOrder,
              weight: s.weight,
              reps: s.reps,
              isPr: s.isPr,
            })
          })
        )

        // Trier les séries par setOrder dans chaque exercice
        exerciseMap.forEach(exDetail => {
          exDetail.sets.sort((a, b) => a.setOrder - b.setOrder)
          allExercises.push(exDetail)
        })
      } catch { /* sets inaccessibles */ }
    })
  )

  setDetail({
    dateKey: day.dateKey,
    label,
    count: day.count,
    programName,
    sessionName,
    durationMin: totalDurationMin > 0 ? totalDurationMin : null,
    exercises: allExercises,
  })
}
```

### Rendu de la carte détail (remplacer le bloc `{tooltip && ...}`)

```tsx
{detail && (
  <View style={styles.detailCard}>
    {/* En-tête */}
    <Text style={styles.detailDate}>{detail.label}</Text>

    {detail.count === 0 ? (
      <Text style={styles.detailRest}>Repos</Text>
    ) : (
      <>
        {/* Nom programme + durée */}
        <View style={styles.detailHeader}>
          <Text style={styles.detailProgramName} numberOfLines={1}>
            {detail.programName || detail.sessionName || 'Séance'}
          </Text>
          {detail.durationMin != null && detail.durationMin > 0 && (
            <Text style={styles.detailDuration}>
              {formatDuration(detail.durationMin)}
            </Text>
          )}
        </View>

        {/* Nom de séance si différent du programme */}
        {detail.sessionName && detail.sessionName !== detail.programName && (
          <Text style={styles.detailSessionName}>{detail.sessionName}</Text>
        )}

        {/* Liste des exercices */}
        {detail.exercises.map((ex, ei) => (
          <View key={ei} style={styles.detailExercise}>
            <Text style={styles.detailExerciseName}>{ex.exerciseName}</Text>
            <View style={styles.detailSetsRow}>
              {ex.sets.map((s, si) => (
                <View key={si} style={styles.detailSetChip}>
                  <Text style={[styles.detailSetText, s.isPr && styles.detailSetPr]}>
                    {s.weight > 0 ? `${s.weight} kg` : 'PC'} × {s.reps}
                    {s.isPr ? ' 🏅' : ''}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </>
    )}
  </View>
)}
```

Note : utiliser `'PC'` (poids de corps) si `weight === 0`.

### Nouveaux styles à ajouter dans `useStyles`

```typescript
detailCard: {
  backgroundColor: colors.card,
  borderRadius: borderRadius.md,
  padding: spacing.md,
  marginBottom: spacing.sm,
},
detailDate: {
  fontSize: fontSize.xs,
  color: colors.textSecondary,
  textAlign: 'center',
  textTransform: 'capitalize',
  marginBottom: spacing.xs,
},
detailRest: {
  fontSize: fontSize.sm,
  color: colors.textSecondary,
  textAlign: 'center',
},
detailHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 2,
},
detailProgramName: {
  fontSize: fontSize.md,
  fontWeight: '700',
  color: colors.text,
  flex: 1,
},
detailDuration: {
  fontSize: fontSize.xs,
  color: colors.textSecondary,
  marginLeft: spacing.sm,
},
detailSessionName: {
  fontSize: fontSize.sm,
  color: colors.textSecondary,
  marginBottom: spacing.sm,
},
detailExercise: {
  marginTop: spacing.sm,
},
detailExerciseName: {
  fontSize: fontSize.sm,
  color: colors.text,
  fontWeight: '600',
  marginBottom: 4,
},
detailSetsRow: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 4,
},
detailSetChip: {
  backgroundColor: colors.cardSecondary,
  borderRadius: 6,
  paddingHorizontal: 8,
  paddingVertical: 3,
},
detailSetText: {
  fontSize: fontSize.xs,
  color: colors.textSecondary,
},
detailSetPr: {
  color: colors.warning,
},
daySpacer: {
  width: DAY_SIZE,
  height: DAY_SIZE,
},
```

### Styles à supprimer (plus utilisés)
`tooltip`, `tooltipDate`, `tooltipRest`, `tooltipSession`, `tooltipSessionName`, `tooltipSessionDuration`

---

## Changements tests

### Renommages dans les tests
- `tooltip` → `detail` dans les variables internes aux tests (state renommé)
- Les tests qui cherchent `'Repos'` dans le tooltip restent valides (le texte "Repos" est toujours affiché pour un jour vide)
- Les tests `queryByText('Push Day')` cherchent maintenant le nom de séance : mettre à jour pour `queryByText('Push Day')` (c'est le `session.name` qui vient du mock)

### Test : jours hors mois non pressables
```typescript
it('les jours hors mois ne déclenchent pas de tooltip', () => {
  const today = new Date()
  // Trouver un jour du mois précédent qui serait dans la grille (padding)
  // On navigue au mois suivant pour avoir du padding sur le mois courant
  // Alternative : vérifier qu'aucun testID day-cell-PREV-MONTH-XX n'existe
  const prevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 28)
  const prevKey = toKey(prevMonth)
  const { queryByTestId } = render(<StatsCalendarScreenBase histories={[]} />)
  // Les jours hors mois ne doivent PAS avoir de testID day-cell (non pressables)
  expect(queryByTestId(`day-cell-${prevKey}`)).toBeNull()
})
```

Note : puisque les cellules hors mois sont des `<View>` sans `testID`, le test confirme leur absence de `testID`.

### Adapter le test "affiche la durée"
Le test cherche `queryByText('1h')` — `formatDuration(60)` retourne `'1h'`. Le tooltip/detail montre toujours la durée via `formatDuration`. Ce test reste valide.

### Adapter le test "Push Day"
Le `session.name` dans le mock est `'Push Day'`. Il apparaît maintenant dans `detailSessionName` ou `detailProgramName`. Le test `queryByText('Push Day')` reste valide.

---

## Contraintes
- Ne PAS modifier `generateMonthGrid` (structure interne identique)
- Ne PAS modifier `computeCalendarData`, `toDateKey`, `formatDuration` (statsHelpers)
- Ne PAS modifier le `withObservables` enhance (requête identique)
- Ne PAS ajouter de `console.log` sans `__DEV__` guard
- Pas de `any` TypeScript
- Toutes les couleurs via `colors.*` ou `intensityColors` de `theme/index.ts`

---

## Critères de validation
```bash
cd mobile
npx tsc --noEmit   # 0 erreur TypeScript
npm test StatsCalendar  # tous les tests passent
```

Vérification visuelle :
- Vue février 2026 → aucun jour de janvier visible (cellules vides transparentes)
- Clic sur un jour actif → carte avec programme, séance, liste exercices + séries
- Clic sur un jour repos → carte avec "Repos"
- Clic sur le même jour → ferme la carte
- PR affiché en couleur `colors.warning` dans les chips de série

---

## Dépendances
Aucune dépendance externe — groupe unique.

## Statut
⏳ En attente
