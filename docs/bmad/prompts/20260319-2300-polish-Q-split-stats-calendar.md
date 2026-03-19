# Tache Q — Split StatsCalendarScreen (806 lignes) — 20260319-2300

## Objectif
Decomposer `StatsCalendarScreen.tsx` (806 lignes) en sous-composants. C'est le 2e plus gros ecran.

## Fichier principal
- `mobile/src/screens/StatsCalendarScreen.tsx`

## Sous-composants a extraire

### 1. `CalendarGrid.tsx`
La grille calendrier avec les jours du mois, les indicateurs d'entrainement, la navigation mois precedent/suivant.

### 2. `CalendarDayDetail.tsx`
La section qui s'affiche quand on tape sur un jour : liste des seances du jour avec volume, duree, exercices.

### 3. `CalendarMonthSummary.tsx`
Le resume mensuel : nombre de seances, volume total du mois, streaks.

## Contexte technique

### Pattern a suivre
Meme pattern que la tache P :
```tsx
// components/stats-calendar/CalendarGrid.tsx
export const CalendarGrid = React.memo(function CalendarGrid({...}: CalendarGridProps) {
  // ...
})
```

### Structure
```
mobile/src/components/
└── stats-calendar/
    ├── CalendarGrid.tsx
    ├── CalendarDayDetail.tsx
    └── CalendarMonthSummary.tsx
```

### Donnees observables
`StatsCalendarScreen` utilise `withObservables`. Les donnees observables restent dans l'ecran parent. Les sous-composants recoivent des props deja resolues (pas d'observables).

### Handlers
Les handlers de navigation mois (`handlePrevMonth`, `handleNextMonth`) restent dans le parent. Passer via props `onPrevMonth`, `onNextMonth`.

## Etapes
1. Lire `StatsCalendarScreen.tsx` en entier
2. Identifier les 3 sections visuelles
3. Creer le dossier `components/stats-calendar/`
4. Extraire chaque section
5. Wrapper dans `React.memo` avec props typees
6. Mettre a jour l'ecran pour importer les sous-composants
7. `npx tsc --noEmit` → 0 erreur
8. `npm test` → 0 fail

## Contraintes
- NE PAS modifier la logique de calcul des jours/mois
- NE PAS modifier `withObservables` enhance
- NE PAS changer le layout visuel
- NE PAS toucher aux autres ecrans Stats*

## Criteres de validation
- `npx tsc --noEmit` → 0 erreur
- `npm test` → 2231+ passed
- `StatsCalendarScreen.tsx` reduit a ~300 lignes
- Chaque sous-composant est un `React.memo`

## Dependances
Aucune.

## Statut
⏳ En attente
