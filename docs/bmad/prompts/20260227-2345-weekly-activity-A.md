<!-- v1.0 — 2026-02-27 -->
# Rapport — Weekly Activity HomeScreen — Groupe A (Utilitaires) — 20260227-2345

## Objectif
Ajouter les types TypeScript et la fonction utilitaire `buildWeeklyActivity()` qui calcule les données d'activité pour la semaine courante (Lun–Dim). Ce groupe pose les fondations de la couche data pour le Groupe B (UI).

## Fichiers concernés
- `mobile/src/model/utils/statsTypes.ts`
- `mobile/src/model/utils/statsVolume.ts`
- `mobile/src/model/utils/statsDateUtils.ts` (lecture seule — réutiliser `toDateKey`)
- `mobile/src/model/utils/statsMuscle.ts` (lecture seule — réutiliser `getMondayOfCurrentWeek`)

## Contexte technique

### Stack & contraintes (CLAUDE.md)
- TypeScript strict — **pas de `any`**
- `withObservables` HOC pour la réactivité DB (mais cette couche est purement utilitaire, pas de WatermelonDB direct ici)
- **Pas de `console.log`** en production (guard `__DEV__` ou supprimer)
- Conventions de nommage : camelCase functions, PascalCase interfaces

### Modèles utilisés
**History** (`mobile/src/model/models/History.ts`) :
- `startTime: Date`, `endTime?: Date`
- `id: string` (hérité de Model)
- `session_id` (via schema, accessible comme `history.sessionId` ou via `history.session`)
- `deletedAt: Date | null` (soft-delete, déjà filtré dans le query HomeScreen)

**Session** (`mobile/src/model/models/Session.ts`) :
- `id: string`, `name: string`

**WorkoutSet** (`mobile/src/model/models/Set.ts`) :
- `historyId: string` (foreign key vers histories)
- `weight: number`, `reps: number`

### Fonctions existantes à réutiliser (NE PAS dupliquer)
```ts
// mobile/src/model/utils/statsDateUtils.ts
export function toDateKey(date: Date): string
  // Retourne 'YYYY-MM-DD'

// mobile/src/model/utils/statsMuscle.ts
function getMondayOfCurrentWeek(): number
  // Retourne timestamp du lundi 00:00:00 de la semaine courante
  // ATTENTION: cette fonction est locale (non exportée), vérifier avant d'importer
  // Si non exportée → copier la logique localement dans statsVolume.ts
```

### Types existants dans statsTypes.ts (à lire avant de modifier)
Ne pas casser les exports existants. Ajouter les nouveaux types à la suite.

## Étapes

### 1. Lire les fichiers existants
Lire statsTypes.ts, statsVolume.ts, statsDateUtils.ts, statsMuscle.ts pour comprendre l'existant avant de modifier.

### 2. Ajouter les types dans statsTypes.ts
Ajouter à la fin du fichier :
```ts
export interface WeekDaySessionRecap {
  sessionName: string       // Nom de la séance (ex: "Push A")
  setCount: number          // Nombre total de séries
  volumeKg: number          // Volume total (sum weight × reps)
  durationMin: number | null // Durée en minutes (null si endTime manquant)
}

export interface WeekDayActivity {
  dateKey: string            // 'YYYY-MM-DD'
  dayLabel: string           // 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'
  dayNumber: number          // Numéro du jour dans le mois (ex: 12)
  isToday: boolean
  isPast: boolean            // true si le jour est dans le passé
  sessions: WeekDaySessionRecap[]
}

export type WeeklyActivityData = WeekDayActivity[]
```

### 3. Ajouter buildWeeklyActivity() dans statsVolume.ts
Importer les types nécessaires en haut du fichier.

Implémenter la fonction :
```ts
export function buildWeeklyActivity(
  histories: History[],
  sets: WorkoutSet[],
  sessions: Session[],
): WeeklyActivityData
```

Logique :
1. Calculer le lundi de la semaine courante (même logique que `getMondayOfCurrentWeek` dans statsMuscle.ts)
2. Créer un tableau de 7 jours (index 0 = Lundi, 6 = Dimanche)
3. Pour chaque jour :
   - Calculer `dateKey` via `toDateKey()`
   - Calculer `isToday` (comparer avec date du jour)
   - Calculer `isPast` (jour < aujourd'hui)
   - `dayLabel` : `['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'][i]`
   - `dayNumber` : `.getDate()`
4. Pour chaque jour, filtrer les `histories` dont `toDateKey(new Date(history.startTime))` === `dateKey`
5. Pour chaque history trouvée :
   - Trouver le session name : `sessions.find(s => s.id === history.sessionId)?.name ?? 'Séance'`
     - Note : WatermelonDB expose l'id via `history.id`, la foreign key est accessible via `(history as any)._raw.session_id` OU via le champ. Vérifier dans le modèle History comment accéder à `session_id`. Dans CLAUDE.md schema v23+, History a `session_id` comme string field.
     - Pattern correct selon le modèle : la relation est `@relation('sessions', 'session_id')`, donc le raw field est `session_id`. Accès : regarder si `history.sessionId` existe (camelCase auto-mapping) ou utiliser `(history._raw as { session_id: string }).session_id`
   - Filtrer les `sets` dont `set.historyId === history.id` (vérifier le field name dans le modèle Set)
   - `setCount` = nombre de sets trouvés
   - `volumeKg` = `sets.reduce((acc, s) => acc + s.weight * s.reps, 0)` — arrondir à 1 décimale
   - `durationMin` = `history.endTime ? Math.round((history.endTime.getTime() - history.startTime.getTime()) / 60000) : null`
6. Retourner le tableau de 7 `WeekDayActivity`

**Point d'attention** : `history.startTime` est un `Date` dans le modèle (via `@date` decorator). `toDateKey()` attend un `Date`. Utiliser directement `new Date(history.startTime)` si startTime est un timestamp number, ou `history.startTime` si c'est déjà un Date.

### 4. Exporter via statsHelpers.ts (si barrel existe)
Si `mobile/src/model/utils/statsHelpers.ts` est un barrel export, ajouter les nouveaux exports.

## Contraintes
- Ne pas modifier les fonctions existantes dans statsVolume.ts (ne pas casser buildHeatmapData, computeCalendarData, etc.)
- Ne pas introduire de `any` TypeScript
- Les noms de jours sont en français : `['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']`
- Semaine ISO : commence le LUNDI (pas dimanche)

## Critères de validation
- `npx tsc --noEmit` → zéro erreur TypeScript
- `npm test` → zéro fail (pas de tests à créer pour ce groupe, mais les tests existants ne doivent pas casser)
- La fonction retourne exactement 7 éléments
- `isToday` est true pour un seul jour max
- Avec 0 histories → tous les `sessions` arrays sont vides

## Dépendances
Aucune dépendance (ce groupe est la fondation). Le Groupe B dépend de ce groupe.

## Statut
⏳ En attente
