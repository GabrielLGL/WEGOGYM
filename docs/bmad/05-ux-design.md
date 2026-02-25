# UX Design — Animations/Demos exercices — 2026-02-25

> Dark Mode uniquement · fr-FR · tokens `theme/index.ts`

---

## ExerciseInfoSheet (BottomSheet)

**Declenchement :** Tap sur icone (i) — depuis la seance ou la bibliotheque

```
┌─────────────────────────────────────────┐
│              ─── handle ───              │  #38383A
│                                         │
│  ┌───────────────────────────────────┐  │
│  │                                   │  │  bg: #2C2C2E
│  │        ◻ (icone fitness)          │  │  icone 48px, #8E8E93
│  │    "Animation a venir"            │  │  #8E8E93, italic, 12px
│  │                                   │  │
│  └───────────────────────────────────┘  │
│                                         │
│  Developpe couche                       │  #FFFFFF, bold, 20px
│                                         │
│  ┌──────┐ ┌────────┐ ┌────────┐        │
│  │ Pecs │ │Epaules │ │Triceps │        │  chips: bg primaryBg, text primary
│  └──────┘ └────────┘ └────────┘        │
│                                         │
│  ─── Description ───────────────────    │  label: #8E8E93, 12px
│  Allonge sur le banc, pieds au sol.     │  text: #FFFFFF, 14px
│  Descends la barre vers le milieu       │
│  de la poitrine en controlant.          │
│  Pousse vers le haut en expirant.       │
│                                         │
│  ─── Notes personnelles ────────────    │  label: #8E8E93, 12px
│  Grip pronation, tempo 3-1-1-0          │  text: #FFFFFF, 14px, italic
│                                         │
│  (ou "Aucune note — ajoutez-en une      │  #8E8E93, italic
│   depuis la seance")                    │
│                                         │
└─────────────────────────────────────────┘
   bg: colors.card (#1C1C1E)
```

---

## Bouton info dans SessionExerciseItem

**Avant :**
```
[drag] Developpe couche                    [poubelle]
       Pecs, Epaules • Poids libre
       [3 series] x [10 reps]
```

**Apres :**
```
[drag] Developpe couche  (i)               [poubelle]
       Pecs, Epaules • Poids libre
       [3 series] x [10 reps]
```

- Icone `information-circle-outline` (Ionicons), 20px, `colors.textSecondary`
- Espacement `spacing.sm` (8px) entre nom et icone
- Tap → `haptics.onPress()` + ouvre ExerciseInfoSheet

---

## Bouton info dans ExercisePickerModal

**Avant :**
```
┌─────────────────────────────────┐
│ Developpe couche                │
└─────────────────────────────────┘
```

**Apres :**
```
┌─────────────────────────────────┐
│ Developpe couche            (i) │
└─────────────────────────────────┘
```

- Icone (i) alignee a droite, meme style
- Tap sur (i) = info sheet (ne selectionne PAS l'exercice)
- Tap sur le reste = selection exercice (inchange)

---

## Cas limites

| Situation | Affichage |
|-----------|-----------|
| Exercice sans description | "Pas de description disponible" italic textSecondary |
| Exercice sans notes | "Aucune note" italic textSecondary |
| Exercice custom | Sheet identique, probablement sans description |
| Nom tres long | `numberOfLines={2}` avec ellipsis |
| 5+ muscles | Chips wrappent sur 2 lignes (flexWrap) |

---

## Interactions

| Action | Feedback |
|--------|----------|
| Tap icone (i) en seance | `haptics.onPress()` + ouvre ExerciseInfoSheet |
| Tap icone (i) en bibliotheque | `haptics.onPress()` + ouvre ExerciseInfoSheet |
| Tap overlay / drag down | Ferme le BottomSheet (animation slide-down) |
| Back hardware Android | Ferme le BottomSheet |

---

## Tokens utilises

```typescript
// Couleurs
colors.card           // #1C1C1E — fond BottomSheet
colors.cardSecondary  // #2C2C2E — fond zone placeholder
colors.primary        // #007AFF — texte chips muscles
colors.primaryBg      // rgba(0,122,255,0.15) — fond chips muscles
colors.text           // #FFFFFF — titre, description
colors.textSecondary  // #8E8E93 — labels, placeholders, icone info

// Spacing
spacing.sm   // 8 — gap chips, gap nom/icone
spacing.md   // 16 — padding sections
spacing.lg   // 24 — gap entre sections

// Typography
fontSize.xl (20px) bold — nom exercice
fontSize.sm (14px) — description, notes
fontSize.xs (12px) — labels sections, placeholder animation
fontSize.xs (12px) italic — "Aucune note", "Animation a venir"

// Icons
Ionicons 'information-circle-outline' 20px — bouton info
Ionicons 'barbell-outline' 48px — placeholder animation
```

---

## Ce qui ne change PAS

- HomeScreen (aucune modification)
- WorkoutScreen (aucune modification)
- Navigation (aucun nouvel ecran — seulement des BottomSheets)
- Flow de seance (saisie series, validation, resume)
- Flow d'ajout d'exercice (selection + objectifs dans ExercisePickerModal)
