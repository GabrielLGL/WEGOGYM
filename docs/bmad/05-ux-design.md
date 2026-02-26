# UX Design — Volume Tracker Complet — 2026-02-26

> Dark Mode uniquement · fr-FR · tokens `theme/index.ts`

---

## StatsVolumeScreen — Enrichissement

Les 3 sections existantes restent inchangées en haut :
1. ChipSelector période (1 mois / 3 mois / Tout)
2. Card volume total + % comparaison
3. Bar chart 12 semaines

Ajout de deux nouvelles sections après le "Top exercices" :

---

## Section 4 — "Sets par muscle cette semaine"

```
┌─────────────────────────────────────────────────────┐
│  Sets par muscle — semaine actuelle                 │  #FFFFFF, 16px, 600
│                                                     │
│  Pectoraux                          8 sets          │
│  ████████████████████░░░░░░░░░░ 80%  #007AFF        │
│                                                     │
│  Dos                               10 sets          │
│  █████████████████████████ 100%      #007AFF        │
│                                                     │
│  Épaules                            4 sets          │
│  ██████████░░░░░░░░░░░░░░░ 40%       #007AFF        │
│                                                     │
│  Triceps                            2 sets          │
│  █████░░░░░░░░░░░░░░░░░░░░ 20%       #007AFF        │
│                                                     │
│  [état vide si aucun set cette semaine]             │
└─────────────────────────────────────────────────────┘
   bg: colors.card
   barre: View width proportionnel au max (100% = muscle le + travaillé)
   hauteur barre: 6px, borderRadius: 3, bg: colors.primary
   bg barre vide: colors.separator
```

**Layout par ligne muscle :**
```
┌─────────────────────────────────────────────────┐
│  Nom muscle                          X sets      │  row, justifyContent: space-between
│  [barre progress pleine couleur     ░░░░░░░░░]  │  View width %
└─────────────────────────────────────────────────┘
```

**État vide :**
```
"Aucun set enregistré cette semaine"
italic, colors.textSecondary, centré
```

---

## Section 5 — "Évolution par muscle"

```
┌─────────────────────────────────────────────────────┐
│  Évolution par muscle                               │  #FFFFFF, 16px, 600
│                                                     │
│  [Pectoraux] [Dos] [Épaules] [Biceps] ...          │  ← ChipSelector scrollable
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │   10 ─────────────────────────────────────  │   │
│  │    8 ──────────────────╮                    │   │
│  │    6 ─────────╮        │        ╭────────   │   │
│  │    4 ─────────╯ ╭──────╯        │           │   │
│  │    2            ╰───────────────╯           │   │
│  │    0                                        │   │
│  │    03/02  10/02  17/02  24/02  03/03  ...   │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
   LineChart de react-native-chart-kit
   couleur ligne: colors.primary (#007AFF)
   bg: colors.card
   labels: semaines (format: "03/02")
```

**État vide (muscle sans historique) :**
```
"Aucun set enregistré pour ce muscle"
italic, colors.textSecondary, centré
```

---

## Interactions

| Action | Feedback |
|--------|----------|
| Tap chip muscle | Haptics.onSelect() + line chart se met à jour |
| Scroll vertical | Scroll fluent dans ScrollView existant |
| Changement période (chip du haut) | Section 4 et 5 se mettent à jour avec les nouvelles données |

---

## Tokens utilisés

```typescript
// Couleurs
colors.card           // fond sections
colors.primary        // barres progression + ligne chart
colors.separator      // fond barre vide
colors.text           // titres sections, noms muscles
colors.textSecondary  // sets count, états vides

// Spacing
spacing.sm   // 8  — gap interne lignes
spacing.md   // 16 — padding sections, gap entre sections
spacing.lg   // 24 — gap vertical entre Section 4 et 5

// Typography
fontSize.md (16px) 600 — titre sections
fontSize.sm (14px) — noms muscles, count sets
fontSize.xs (12px) — labels chart, états vides italic
```

---

## Ce qui ne change PAS

- Sections 1-3 de StatsVolumeScreen (intact)
- Navigation (aucun nouvel écran)
- Tous les autres écrans Stats (Duration, Calendar, Repartition, Exercises)
- Flow de séance
