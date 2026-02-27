<!-- v1.0 — 2026-02-28 -->
# Rapport — HomeScreen sections — Groupe A — 20260228-0001

## Objectif
1. Déplacer la tuile "Agenda" de la section "Statistiques" vers la section "Entraînement"
2. Renommer le label "Bibliothèque" → "Bibliothèque d'exercices" (route `'Exercices'` inchangée)

## Fichiers concernés
- `mobile/src/screens/HomeScreen.tsx`
- `mobile/src/screens/__tests__/HomeScreen.test.tsx`

## Contexte technique
Le tableau `SECTIONS` (lignes 52-69) définit les sections et tuiles de la HomeScreen.
État actuel après la dernière refonte (commit fa2ce0a + refonte-nav) :

```ts
const SECTIONS: Section[] = [
  {
    title: 'Entraînement',
    tiles: [
      { icon: 'library-outline', label: 'Programmes', route: 'Programs' },
      { icon: 'barbell-outline', label: 'Bibliothèque', route: 'Exercices' },
    ],
  },
  {
    title: 'Statistiques',
    tiles: [
      { icon: 'time-outline',    label: 'Durée',   route: 'StatsDuration' },
      { icon: 'barbell-outline', label: 'Volume',  route: 'StatsVolume' },
      { icon: 'calendar-outline', label: 'Agenda', route: 'StatsCalendar' },
      { icon: 'resize-outline',  label: 'Mesures', route: 'StatsMeasurements' },
    ],
  },
]
```

État cible :

```ts
const SECTIONS: Section[] = [
  {
    title: 'Entraînement',
    tiles: [
      { icon: 'library-outline',  label: 'Programmes',            route: 'Programs' },
      { icon: 'barbell-outline',  label: "Bibliothèque d'exercices", route: 'Exercices' },
      { icon: 'calendar-outline', label: 'Agenda',                route: 'StatsCalendar' },
    ],
  },
  {
    title: 'Statistiques',
    tiles: [
      { icon: 'time-outline',    label: 'Durée',   route: 'StatsDuration' },
      { icon: 'barbell-outline', label: 'Volume',  route: 'StatsVolume' },
      { icon: 'resize-outline',  label: 'Mesures', route: 'StatsMeasurements' },
    ],
  },
]
```

## Étapes

1. Dans `HomeScreen.tsx` — modifier `SECTIONS` :
   - Renommer `'Bibliothèque'` → `"Bibliothèque d'exercices"`
   - Ajouter `{ icon: 'calendar-outline', label: 'Agenda', route: 'StatsCalendar' }` dans la section "Entraînement"
   - Supprimer la tuile `'Agenda'` de la section "Statistiques"

2. Dans `HomeScreen.test.tsx` — adapter le test `'affiche toutes les tuiles'` :
   - `expect(getByText('Biblioth\u00e8que')).toBeTruthy()` → `expect(getByText("Biblioth\u00e8que d'exercices")).toBeTruthy()`
   - `expect(getByText('Agenda')).toBeTruthy()` — vérifier qu'il existe encore (toujours présent, juste déplacé)
   - La navigation 'Agenda' → 'StatsCalendar' doit toujours fonctionner

## Contraintes
- Ne pas modifier les routes (StatsCalendar reste 'StatsCalendar', Exercices reste 'Exercices')
- Ne pas toucher aux autres écrans
- Respecter `colors.*` et `spacing.*` (pas de hardcoded)

## Critères de validation
- `npx tsc --noEmit` → zéro erreur
- `npm test` → zéro fail
- La tuile "Agenda" apparaît dans "Entraînement" et non "Statistiques"
- Le label "Bibliothèque d'exercices" est visible

## Dépendances
Aucune dépendance externe.

## Statut
✅ Résolu — 20260228-0002

## Résolution
Rapport do : docs/bmad/do/20260228-0002-chore-homescreen-sections.md
