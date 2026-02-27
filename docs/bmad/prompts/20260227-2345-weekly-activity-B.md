<!-- v1.0 — 2026-02-27 -->
# Rapport — Weekly Activity HomeScreen — Groupe B (UI HomeScreen) — 20260227-2345

## Objectif
Modifier `HomeScreen.tsx` pour remplacer le heatmap calendrier (365 jours) par une carte d'activité **semaine courante** (Lun–Dim) avec un mini recap visuel par jour. Ajouter les améliorations UI suivantes : aujourd'hui mis en avant, volume hebdomadaire en sous-titre, durée et sets par séance.

**Ce groupe dépend du Groupe A** (qui ajoute `buildWeeklyActivity()` et les types dans statsVolume.ts/statsTypes.ts).

## Fichiers concernés
- `mobile/src/screens/HomeScreen.tsx` (modifications principales)
- `mobile/src/screens/__tests__/HomeScreen.test.tsx` (mise à jour des mocks si nécessaire)

## Contexte technique

### Stack & contraintes (CLAUDE.md)
- TypeScript strict — **pas de `any`**
- **NO `<Modal>` natif** — utiliser Portal pattern (mais cette feature n'a pas de modal)
- **Couleurs** : toujours depuis `colors.*` via `useColors()` hook — pas de hardcoded
- `useColors()` hook → `mobile/src/contexts/ThemeContext.tsx`
- `withObservables` HOC de `@nozbe/with-observables`
- **WatermelonDB mutations** dans `database.write()` — mais cette feature est read-only
- Haptics via `useHaptics()` si boutons interactifs

### Architecture actuelle du HomeScreen
```tsx
// withObservables query actuelle (lignes ~379-384)
const enhance = withObservables([], () => ({
  users: database.get<User>('users').query().observe(),
  histories: database.get<History>('histories').query(Q.where('deleted_at', null)).observe(),
  sets: database.get<WorkoutSet>('sets').query().observe(),
  userBadges: database.get<UserBadge>('user_badges').query().observe(),
}))
```

```tsx
// Props interface actuelle
interface Props {
  users: User[]
  histories: History[]
  sets: WorkoutSet[]
  userBadges: UserBadge[]
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>
}
```

```tsx
// Card heatmap actuelle (dans le rendu, autour de la ligne 198-202)
{/* ── Card Heatmap ── */}
<View style={styles.heatmapCard}>
  <Text style={styles.sectionTitle}>Activité</Text>
  <HeatmapCalendar data={heatmapData} />
</View>
```

```tsx
// useMemo heatmap actuel
const heatmapData = useMemo(() => buildHeatmapData(histories), [histories])
```

### Imports à ajouter
```ts
import Session from '../model/models/Session'
import { buildWeeklyActivity } from '../model/utils/statsVolume'
import type { WeekDayActivity, WeeklyActivityData } from '../model/utils/statsTypes'
```

### Imports à supprimer (si HeatmapCalendar n'est plus utilisé)
```ts
import { HeatmapCalendar } from '../components/HeatmapCalendar'
import { buildHeatmapData } from '../model/utils/statsVolume'
```
**Attention** : vérifier que HeatmapCalendar et buildHeatmapData ne sont pas utilisés ailleurs dans ce fichier avant de supprimer.

## Étapes

### 1. Lire HomeScreen.tsx entièrement
Comprendre la structure complète avant de modifier.

### 2. Ajouter sessions à withObservables
```tsx
const enhance = withObservables([], () => ({
  users: database.get<User>('users').query().observe(),
  histories: database.get<History>('histories').query(Q.where('deleted_at', null)).observe(),
  sets: database.get<WorkoutSet>('sets').query().observe(),
  sessions: database.get<Session>('sessions').query().observe(),
  userBadges: database.get<UserBadge>('user_badges').query().observe(),
}))
```

### 3. Mettre à jour l'interface Props
Ajouter `sessions: Session[]`

### 4. Remplacer useMemo heatmap
```tsx
// Supprimer :
const heatmapData = useMemo(() => buildHeatmapData(histories), [histories])

// Ajouter :
const weeklyActivity = useMemo(
  () => buildWeeklyActivity(histories, sets, sessions),
  [histories, sets, sessions],
)
```

### 5. Remplacer le bloc JSX de la card heatmap
Remplacer tout le bloc `{/* ── Card Heatmap ── */}` par :

```tsx
{/* ── Card Activité Semaine ── */}
<View style={styles.weeklyCard}>
  {/* Header */}
  <View style={styles.weeklyHeader}>
    <Text style={styles.sectionTitle}>Cette semaine</Text>
    <Text style={styles.weeklySubtitle}>
      {/* Calcul : total sessions cette semaine + total volume */}
      {(() => {
        const totalSessions = weeklyActivity.reduce((acc, d) => acc + d.sessions.length, 0)
        const totalVolume = weeklyActivity.reduce(
          (acc, d) => acc + d.sessions.reduce((a, s) => a + s.volumeKg, 0), 0
        )
        if (totalSessions === 0) return 'Aucune séance'
        return `${totalSessions} séance${totalSessions > 1 ? 's' : ''} · ${Math.round(totalVolume)} kg`
      })()}
    </Text>
  </View>

  {/* Ligne de 7 jours */}
  <View style={styles.weekRow}>
    {weeklyActivity.map((day) => (
      <View
        key={day.dateKey}
        style={[
          styles.dayChip,
          day.isToday && styles.dayChipToday,
          !day.isToday && day.isPast && day.sessions.length === 0 && styles.dayChipRestPast,
        ]}
      >
        {/* Étiquette jour */}
        <Text style={[styles.dayLabel, day.isToday && styles.dayLabelToday]}>
          {day.dayLabel}
        </Text>
        <Text style={[styles.dayNumber, day.isToday && styles.dayNumberToday]}>
          {day.dayNumber}
        </Text>

        {/* Sessions du jour */}
        {day.sessions.length > 0 ? (
          day.sessions.map((s, idx) => (
            <View key={idx} style={styles.sessionTag}>
              <Text style={styles.sessionName} numberOfLines={1}>
                {s.sessionName}
              </Text>
              <Text style={styles.sessionMeta}>
                {s.setCount} séries
                {s.durationMin !== null ? ` · ${s.durationMin}min` : ''}
              </Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyDay}>
            <Text style={styles.emptyDayText}>
              {day.isPast ? 'Repos' : '—'}
            </Text>
          </View>
        )}
      </View>
    ))}
  </View>
</View>
```

### 6. Ajouter les styles
Dans le `StyleSheet.create({...})` du fichier, ajouter :
```ts
weeklyCard: {
  backgroundColor: colors.card,
  borderRadius: borderRadius.lg,
  padding: spacing.md,
  marginBottom: spacing.md,
},
weeklyHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: spacing.sm,
},
weeklySubtitle: {
  color: colors.textMuted,
  fontSize: fontSize.xs,
},
weekRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  gap: 4,
},
dayChip: {
  flex: 1,
  backgroundColor: colors.background,
  borderRadius: borderRadius.sm,
  padding: spacing.xs,
  alignItems: 'center',
  minHeight: 80,
},
dayChipToday: {
  borderWidth: 1.5,
  borderColor: colors.primary,
  backgroundColor: colors.card,
},
dayChipRestPast: {
  opacity: 0.5,
},
dayLabel: {
  color: colors.textMuted,
  fontSize: fontSize.caption,
  fontWeight: '500',
},
dayLabelToday: {
  color: colors.primary,
},
dayNumber: {
  color: colors.text,
  fontSize: fontSize.xs,
  fontWeight: '600',
  marginBottom: 4,
},
dayNumberToday: {
  color: colors.primary,
},
sessionTag: {
  backgroundColor: colors.primary + '22', // 13% opacity
  borderRadius: 4,
  paddingHorizontal: 4,
  paddingVertical: 2,
  marginTop: 2,
  width: '100%',
},
sessionName: {
  color: colors.text,
  fontSize: 9,
  fontWeight: '600',
},
sessionMeta: {
  color: colors.textMuted,
  fontSize: 8,
},
emptyDay: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
},
emptyDayText: {
  color: colors.textMuted,
  fontSize: fontSize.caption,
},
```

**Note** : les styles doivent utiliser les variables du thème (`colors`, `spacing`, `borderRadius`, `fontSize`) importées depuis `theme/index.ts`. Vérifier les imports existants dans le fichier.

**Note** : `colors` et `useColors()` — le HomeScreen utilise probablement `useColors()` hook. Les styles dynamiques (qui utilisent `colors`) doivent être dans le body du composant (pas dans `StyleSheet.create` statique). Vérifier le pattern utilisé dans le fichier existant et l'adapter.

### 7. Supprimer les styles heatmap devenus orphelins
Supprimer `heatmapCard` du StyleSheet si plus utilisé.

### 8. Mettre à jour HomeScreen.test.tsx
Vérifier `mobile/src/screens/__tests__/HomeScreen.test.tsx` :
- Si le test mocke `buildHeatmapData` → remplacer par `buildWeeklyActivity`
- Si le test teste l'affichage du heatmap → adapter pour la vue semaine
- Ajouter `sessions: []` dans les props mockées si besoin

## Contraintes
- Ne pas casser les autres sections du HomeScreen (KPIs, motivational phrase, badges, etc.)
- **Couleurs hardcodées interdites** — utiliser `colors.*` depuis le thème
- **`colors.primary + '22'`** pour opacity hex : vérifier si le thème expose une helper, sinon c'est acceptable
- Respecter le layout existant (ScrollView, spacing, card pattern)
- `sessions` query dans withObservables : pas de filtre `deleted_at` car Session n'a pas de soft-delete dans la query homescreen (vérifier le schéma)

## Critères de validation
- `npx tsc --noEmit` → zéro erreur TypeScript
- `npm test` → zéro fail (tous les tests HomeScreen passent)
- Affichage correct avec :
  - 0 séances dans la semaine (tous les jours = "Repos" pour le passé, "—" pour le futur)
  - Séance le jour actuel → chip today mis en avant avec la séance
  - Plusieurs séances sur un même jour
  - Aujourd'hui = lundi (premier jour de la semaine)
  - Aujourd'hui = dimanche (dernier jour de la semaine)

## Dépendances
**Ce groupe dépend de : Groupe A** (qui crée `buildWeeklyActivity` et les types `WeekDayActivity`, `WeeklyActivityData` dans statsTypes.ts et statsVolume.ts). Lancer uniquement après que le Groupe A est terminé et validé.

## Statut
⏳ En attente (bloquer jusqu'à Groupe A terminé)
