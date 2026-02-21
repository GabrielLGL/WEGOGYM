# Rapport — Fix reads inside database.write() — 2026-02-21

## Problème

Le run verrif 20260221-0223 a identifié et appliqué le fix FIX-N1 (reads dans write()),
mais le CHECK post-correction était DIRTY → ROLLBACK automatique. Les corrections sont
**documentées mais pas appliquées** dans le codebase actuel.

Score santé impacté : Bugs 13/20 (au lieu de 20/20).

## Fichiers concernés

- `mobile/src/hooks/useProgramManager.ts`
- `mobile/src/hooks/useSessionManager.ts`

## Corrections à appliquer (extraites de 07-fix-niveau1.md)

### useProgramManager.ts

**`saveProgram()`** : `getNextPosition('programs')` doit être appelé AVANT le `database.write()`.
```ts
// Avant le write() :
const position = isRenamingProgram ? 0 : await getNextPosition('programs')
// Retirer getNextPosition de l'intérieur du write()
```

**`saveSession()`** : `getNextPosition('sessions', ...)` doit être sorti du write().
```ts
const position = (!isRenamingSession && targetProgram) ? await getNextPosition(...) : 0
```

**`duplicateSession()`** : `program.fetch()`, `getNextPosition()`, `exercise.fetch()` × N tous dans le write() → déplacer TOUS les fetches avant le write().
```ts
const parent = await selectedSession.program.fetch()
const position = await getNextPosition(...)
const originalExos = await ...fetch()
const exoRecords = await Promise.all(originalExos.map(se => se.exercise.fetch()))
// write() itère sur exoRecords[i] déjà fetchés
```

**`moveSession()`** : `getNextPosition('sessions', ...)` à sortir du write().

### useSessionManager.ts

**`addExercise()`** : `getNextPosition('session_exercises', ...)` à sortir du write().

## Commande à lancer

/do docs/bmad/morning/20260221-0830-fix-reads-in-write.md

## Contexte

- Rapport détaillé : `docs/bmad/verrif/20260221-0223/07-fix-niveau1.md`
- Règle CLAUDE.md section 3.1 : "WatermelonDB mutations MUST be inside database.write() — reads MUST NOT be"
- Le rollback précédent était DIRTY : s'assurer que le fix compile proprement avant de committer
- Faire `npx tsc --noEmit` puis `npm test` avant le commit
- Cause probable du dirty check : le script verrif a peut-être des conflits avec d'autres fichiers — appliquer UNIQUEMENT les 2 fichiers listés

## Critères de validation

- `npx tsc --noEmit` → 0 erreur
- `npm test` → 773+ passed, 0 fail
- `grep -n "getNextPosition\|\.fetch()" mobile/src/hooks/useProgramManager.ts` : aucun appel à l'intérieur d'un bloc `database.write(() => {`
- `grep -n "getNextPosition" mobile/src/hooks/useSessionManager.ts` : aucun appel à l'intérieur d'un bloc `database.write(() => {`

## Statut
⏳ En attente
