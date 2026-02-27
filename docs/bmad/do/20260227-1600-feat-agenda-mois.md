# feat(StatsCalendar) — vue mensuelle paginée (mois-par-mois)
Date : 2026-02-27 16:00

## Instruction
Plan : refactoring StatsCalendarScreen — vue heatmap → vue mensuelle paginée

## Classification
Type : feat
Fichiers modifiés :
- `mobile/src/screens/StatsCalendarScreen.tsx`
- `mobile/src/screens/__tests__/StatsCalendarScreen.test.tsx`

## Ce qui a été fait

### 1. Nouvel état mois sélectionné
- `viewYear` / `viewMonth` (useState initialisés au mois courant)
- `isCurrentMonth` flag pour désactiver la flèche →

### 2. Remplacement de `generateCalendarWeeks` par `generateMonthGrid`
- Signature : `generateMonthGrid(year, month, calendarData) → WeekRow[]`
- Type `DayCell` : `{ dateKey, date, dayNumber, count, isFuture, isCurrentMonth }`
- Grille : premier lundi avant ou égal au 1er du mois → dernier dimanche après ou égal au dernier jour
- `isCurrentMonth` = `day.getMonth() === month`
- `count` = 0 si futur ou hors mois courant

### 3. Sélecteur de mois
- `← Février 2026 →` avec format `toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })` + 1ère lettre maj
- Flèche → désactivée (`disabled`, opacité 0.3) si `isCurrentMonth`
- Navigation décembre→janvier (année +1) et janvier→décembre (année -1) gérée

### 4. Stats du mois
- `X séances · Xh Ymin au total` sous le sélecteur
- Calculées depuis `histories` filtrées par préfixe `YYYY-MM`

### 5. Bouton "Aujourd'hui"
- Visible uniquement si pas sur le mois courant
- Remet `viewYear` / `viewMonth` au mois actuel

### 6. Grille calendrier mensuelle
- Cellule : 38×38px, `borderRadius: 8`, affiche le numéro du jour
- Header : `L M M J V S D` en ligne horizontale
- Couleurs :
  - Hors mois : `#252830` bg, `colors.border` text (très dim)
  - Futur : transparent bg, `colors.border` text (dim)
  - Actif (séance) : `colors.primaryBg` bg, `colors.primary` text (cyan)
  - Repos : `#252830` bg, `colors.textSecondary` text
  - Aujourd'hui : bordure `colors.primary` 2px (prioritaire sur selected)
  - Sélectionné (tooltip ouvert) : bordure `colors.primary` 1px
- `testID={`day-cell-${day.dateKey}`}` sur chaque cellule TouchableOpacity

### 7. Swipe PanResponder
- Swipe gauche → mois suivant, swipe droite → mois précédent
- `navRef` pour éviter les stale closures dans `useRef(PanResponder.create(...))`

### 8. Tooltip
- Comportement inchangé (clic → affiche nom séance + durée, re-clic → masque)
- Ignorer le clic si `isFuture || !isCurrentMonth`

### 9. Légende simplifiée
- 2 cases : Repos (fond `#252830`) + Actif (fond `primaryBg`, bordure `primary`)

### 10. Streaks
- Inchangés en haut de l'écran

## Tests mis à jour (15 tests, tous ✅)
- Nouveau : titre du mois courant affiché par défaut
- Nouveau : navigation ← → avec flèches texte
- Nouveau : → désactivée sur mois courant
- Nouveau : bouton Aujourd'hui visible/masqué selon navigation
- Nouveau : Aujourd'hui revient au mois courant
- Mis à jour : tooltip via `getByTestId('day-cell-YYYY-MM-DD')` (plus fragile par index)
- Conservés : streak, légende, durée dans tooltip

## Vérification
- `npx tsc --noEmit` → 0 erreur
- `npm test StatsCalendar` → 15/15 ✅
