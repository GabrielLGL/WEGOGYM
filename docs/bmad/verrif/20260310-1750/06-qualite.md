# Passe 6/8 — Code mort & qualité

## Issues Found

### 🟡 WARN-1: Composant mort `SessionItem.tsx`
Pas importé dans aucun écran. Seul son test le référence.

### 🟡 WARN-2: Composant mort `SetItem.tsx`
Pas importé dans aucun écran. Seul son test le référence.

### 🟡 WARN-3: Composant mort `AssistantPreviewSheet.tsx`
Pas importé dans aucun écran. Possiblement pour feature future assistant IA.

### 🟡 WARN-4: Composant mort `LastPerformanceBadge.tsx`
Pas importé dans aucun composant de production. Mocké dans un test mais jamais utilisé.

### 🟡 WARN-5: Magic number `marginTop: 50` dans ChartsScreen
**Fichier:** `screens/ChartsScreen.tsx:352`

### 🔵 SUGG-1: Couleurs hardcodées dans tests (3 fichiers)
### 🔵 SUGG-2: ErrorBoundary textes français hardcodés (class component, pas de hooks)

## Conformités vérifiées
- ✅ 0 `any` (production + tests)
- ✅ 0 console.log non gardé
- ✅ 0 `<Modal>` natif
- ✅ `computeGlobalKPIs` et `formatVolume` PAS morts — utilisés dans StatsScreen
- ✅ Couleurs production via tokens theme

## Résumé
- 🔴 Critiques: 0
- 🟡 Warnings: 5
- 🔵 Suggestions: 2
