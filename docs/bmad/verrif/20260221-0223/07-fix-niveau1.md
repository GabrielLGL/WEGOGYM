# Fix Niveau 1 (Critiques) — 20260221-0223

## Résultat : ✅ Toutes les corrections appliquées — 0 erreur TypeScript résiduelle

---

## Contexte

Rapports analysés : `build-20260221-0223.md`, `tests-20260221-0226.md`,
`bugs-20260221-0233.md`, `db-20260221-0230.md`, `code-review-20260221-0229.md`,
`qualite-20260221-0240.md`.

Seules les passes **build** et **code-review** contiennent des problèmes de niveau critique.
Les passes tests, bugs silencieux, WatermelonDB et qualité sont toutes ✅ OK.

---

## Problèmes critiques identifiés

### 🔴 CRITIQUE — Reads inside `database.write()` (WatermelonDB undefined behavior)

**Pattern :** `getNextPosition()` (qui exécute un `.fetchCount()`) appelé à l'intérieur d'un
bloc `database.write()`. Selon la documentation WatermelonDB, les lectures dans une
transaction d'écriture sont un comportement indéfini — risk de corruption silencieuse de
la position ou de crash.

| Fichier | Fonction | Ligne | Lecture dans write |
|---------|----------|-------|--------------------|
| `hooks/useProgramManager.ts` | `saveProgram()` | 73 | `getNextPosition('programs')` |
| `hooks/useProgramManager.ts` | `saveSession()` | 143–146 | `getNextPosition('sessions', ...)` |
| `hooks/useProgramManager.ts` | `duplicateSession()` | 173–187 | `program.fetch()` + `getNextPosition()` + `exercise.fetch()` × N |
| `hooks/useProgramManager.ts` | `moveSession()` | 242 | `getNextPosition('sessions', ...)` |
| `hooks/useSessionManager.ts` | `addExercise()` | 83–86 | `getNextPosition('session_exercises', ...)` |

**Note :** Le rapport de code-review mentionnait uniquement les lignes 143–145 et 174–176
de `useProgramManager.ts`. L'audit complet a révélé 3 occurrences supplémentaires du même
pattern dans les mêmes fichiers.

---

## Corrections appliquées

### `hooks/useProgramManager.ts`

**`saveProgram()`**
- Avant : `getNextPosition()` à l'intérieur du `database.write()`
- Après : `const position = isRenamingProgram ? 0 : await getNextPosition('programs')` avant le `write()`

**`saveSession()`**
- Avant : `getNextPosition()` à l'intérieur du `database.write()`
- Après : `const position = (!isRenamingSession && targetProgram) ? await getNextPosition(...) : 0` avant le `write()`

**`duplicateSession()`**
- Avant : `program.fetch()`, `getNextPosition()`, `exercise.fetch()` × N tous dans le `write()`
- Après : Toutes les lectures pré-calculées avant le `write()` :
  - `const parent = await selectedSession.program.fetch()`
  - `const position = await getNextPosition(...)`
  - `const originalExos = await ...fetch()`
  - `const exoRecords = await Promise.all(originalExos.map(se => se.exercise.fetch()))`
  - La boucle `for` dans le `write()` itère sur `exoRecords[i]` (déjà fetchés)

**`moveSession()`**
- Avant : `getNextPosition()` à l'intérieur du `database.write()`
- Après : `const position = await getNextPosition(...)` avant le `write()`

### `hooks/useSessionManager.ts`

**`addExercise()`**
- Avant : `getNextPosition()` à l'intérieur du `database.write()`
- Après : `const position = await getNextPosition(...)` avant le `write()`

---

## Comportement fonctionnel

**Aucun changement de comportement.** La logique est identique — seul l'ordre
d'exécution change (lectures avant la transaction au lieu de pendant). Sur une app
mobile mono-utilisateur, le risque de race condition entre la lecture de position et le
`write()` est négligeable.

---

## Problèmes non corrigés (hors périmètre niveau 1)

| # | Problème | Raison non-correction |
|---|----------|-----------------------|
| Code review #2 | `validation.errors` ignoré (feedback UX silencieux) | UX issue, non listé dans critères niveau 1 (pas mutation, pas fuite, pas schema) |
| Code review #3 | Absence de `@lazy` sur relations lourdes | Warning (niveau 2), pas critique |
| Code review #4–8 | Performance screens, AssistantScreen | Warnings (niveau 2) |
| Qualité #1 | Import `useModalState` inutilisé dans `AlertDialog.tsx` | Qualité (niveau 3) |
| Qualité #2 | Couleurs hardcodées `ChartsScreen.tsx` | Qualité (niveau 3) |

---

## Vérification TypeScript post-correction

```
npx tsc --noEmit → 0 erreur
```

---

## Fichiers modifiés

- `mobile/src/hooks/useProgramManager.ts`
- `mobile/src/hooks/useSessionManager.ts`
