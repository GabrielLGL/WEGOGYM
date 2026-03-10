# 07 — Corrections Niveau 1 (🟡)

**Run:** 2026-03-10 23:48

## Corrections appliquées

### 1. StatsCalendarScreen.tsx:379 — i18n 'PC' hardcodé
- **Avant:** `{s.weight > 0 ? \`\${s.weight} kg\` : 'PC'}`
- **Après:** `{s.weight > 0 ? \`\${s.weight} kg\` : t.historyDetail.bodyweight}`
- **Impact:** Affiche 'PC' en FR et 'BW' en EN (existait déjà dans i18n)

### 2. statsDuration.ts:11 — `==` → `===`
- **Avant:** `h.deletedAt == null`
- **Après:** `h.deletedAt === null`
- **Impact:** Cohérence avec les 15+ autres occurrences du même pattern

### 3. StatsDurationScreen.tsx:325 — pagination non i18n
- **Avant:** `Page {safePage + 1} / {totalPages}`
- **Après:** `{t.statsDuration.pageLabel} {safePage + 1} / {totalPages}`
- **Clé ajoutée:** `statsDuration.pageLabel: 'Page'` dans fr.ts et en.ts

### 4. StatsCalendarScreen AlertDialog — confirmColor
- **Analyse:** `AlertDialog` a déjà `confirmColor` qui default à `colors.danger`
- **Action:** Aucune correction nécessaire (comportement déjà correct)

## Vérification post-fix
- TSC: ✅ 0 erreur
- Tests: ✅ 108 suites, 1690 tests — 100% pass
