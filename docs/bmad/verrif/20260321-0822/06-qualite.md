# Passe 6/8 — Code mort & Qualite

## Resultat

### `any` TypeScript
5 occurrences de `as any` dans `StatsDurationScreen.tsx` — casts sur records WatermelonDB non types.

### Imports inutilises
Aucun import inutilise detecte.

### Code mort
Aucun code mort residuel.

### console.log hors `__DEV__`
0 occurrence — tous les logs sont proteges.

### Valeurs hardcodees
Widget KoreWidget : fontSize/spacing en dur (justifie — widget Android ne peut importer le theme React).

### Conventions
Pas d'incoherence notable.

## Verdict : 5 `as any` corriges en passe 7 (→ generics types). 0 autre correction necessaire.
