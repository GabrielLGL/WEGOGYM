# Tache O — Nettoyage dead code et imports inutiles — 20260319-2100

## Objectif
Supprimer le code mort, les imports inutilises, les variables prefixees `_`, et les TODO/FIXME restants dans le code. Reduire le bruit et ameliorer la maintenabilite.

## Recherches a effectuer

### 1. Variables prefixees `_` (unused convention)
```bash
grep -rn "const _" mobile/src/screens/ mobile/src/components/ mobile/src/hooks/
```
Exemple connu : `ExerciseCatalogScreen.tsx` ligne ~289 : `const [_hasMore, setHasMore] = useState(true)` — state potentiellement mort.

### 2. Imports inutilises
Lancer `npx tsc --noEmit` ne detecte pas tous les imports inutilises. Verifier manuellement les fichiers suspects ou utiliser :
```bash
grep -rn "^import.*from" mobile/src/screens/ | head -100
```
Chercher les imports qui ne sont pas utilises dans le fichier.

### 3. TODO / FIXME / HACK
```bash
grep -rn "TODO\|FIXME\|HACK\|XXX" mobile/src/
```
Pour chaque occurrence : soit le resoudre, soit le supprimer s'il est obsolete.

### 4. Fonctions exportees non utilisees
Verifier si des fonctions exportees dans les helpers ne sont importees nulle part :
```bash
# Pour chaque export dans model/utils/*.ts, verifier si c'est importe quelque part
grep -rn "export function\|export const\|export async function" mobile/src/model/utils/*.ts
```

### 5. Console.log residuels
```bash
grep -rn "console\.log" mobile/src/
```
Il ne doit y en avoir aucun (meme avec `__DEV__`).

### 6. Imports de types sans `type` keyword
```bash
grep -rn "import {" mobile/src/ | grep -v "import type" | head -50
```
Les imports qui n'importent QUE des types devraient utiliser `import type { ... }` pour le tree-shaking.

## Etapes
1. Executer chaque recherche ci-dessus
2. Pour chaque occurrence trouvee :
   - Variable `_` inutilisee → supprimer ou corriger
   - Import inutilise → supprimer
   - TODO/FIXME → resoudre ou supprimer
   - console.log → supprimer
   - Export non utilise → garder si c'est un helper public, supprimer si c'est du code mort
3. `npx tsc --noEmit` → 0 erreur
4. `npm test` → 0 fail

## Contraintes
- NE PAS supprimer des exports qui pourraient etre utilises par des tests
- NE PAS modifier la logique metier
- NE PAS toucher aux fichiers deja modifies par les autres taches (verifier git status avant)
- Si un TODO est encore pertinent, le laisser
- `import type` uniquement pour les imports qui sont EXCLUSIVEMENT des types

## Criteres de validation
- `npx tsc --noEmit` → 0 erreur
- `npm test` → 2231+ passed
- Zero `console.log` dans mobile/src/
- Zero variable `_` inutilisee
- TODO/FIXME resolus ou justifies

## Dependances
Aucune.

## Statut
⏳ En attente
