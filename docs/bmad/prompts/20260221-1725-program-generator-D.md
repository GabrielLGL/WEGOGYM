<!-- v1.0 — 2026-02-21 -->
# Rapport — programGenerator — Groupe D : Intégration aiService — 20260221-1725

## Objectif
Brancher le nouveau module `programGenerator` dans `aiService.ts` comme point d'entrée
alternatif au mode offline. Ajouter une fonction `generateFromProfile()` qui accepte un
`UserProfile` (nouveau format) et retourne un `GeneratedPlan` prêt à être sauvegardé.

**Périmètre strict** :
- Modifier UNIQUEMENT `aiService.ts`
- Ne PAS modifier `AssistantScreen.tsx` (le wizard continue à fonctionner avec AIFormData)
- Ne PAS supprimer `offlineEngine.ts` (utilisé par le flux cloud existant)
- Ne PAS modifier `types.ts` existant

## Fichiers concernés
- **MODIFIER** `mobile/src/services/ai/aiService.ts`

## Contexte technique

### Ce qui EXISTE déjà dans aiService.ts
```typescript
// Lit le provider depuis User.aiProvider ('offline' | 'claude' | 'openai' | 'gemini')
// Construit un DBContext (exercices DB, recent muscles, PRs)
// Appelle le bon provider → GeneratedPlan
// Fallback vers offlineEngine si cloud échoue

export async function generatePlan(form: AIFormData, user: User): Promise<GeneratedPlan>
export async function testProviderConnection(providerName: AIProviderName, apiKey: string): Promise<boolean>
```

### Module programGenerator (créé par Groupes A+B+C)
```typescript
// mobile/src/services/ai/programGenerator/index.ts
export async function generateProgram(profile: UserProfile, db: Database): Promise<PGGeneratedProgram>
export function toDatabasePlan(program: PGGeneratedProgram, name: string): GeneratedPlan
export type { UserProfile, PGGeneratedProgram }
```

### Base de données
```typescript
// WatermelonDB — import depuis mobile/src/model/index.ts
import database from '../../../model'
```

## Étapes

### 1. Lire le fichier aiService.ts en entier

Avant toute modification, lire `mobile/src/services/ai/aiService.ts` pour comprendre
la structure exacte (imports, fonctions, exports).

### 2. Ajouter `generateFromProfile()` à la FIN du fichier

Ne toucher à aucune fonction existante. Ajouter uniquement après les exports existants :

```typescript
import { generateProgram, toDatabasePlan } from './programGenerator'
import type { UserProfile } from './programGenerator'
import database from '../../model'

/**
 * Génère un plan depuis un profil utilisateur structuré (programGenerator).
 * Alternative offline à generatePlan() qui utilise l'offlineEngine.
 * Utilisable depuis n'importe quel écran sans AIFormData.
 *
 * @param profile - Profil utilisateur typé (goal, level, equipment, injuries, etc.)
 * @param programName - Nom du programme à créer
 * @returns GeneratedPlan compatible avec importGeneratedPlan()
 */
export async function generateFromProfile(
  profile: UserProfile,
  programName: string,
): Promise<GeneratedPlan> {
  const program = await generateProgram(profile, database)
  return toDatabasePlan(program, programName)
}

export type { UserProfile }
```

### 3. Vérifier les imports

S'assurer que les nouveaux imports n'entrent pas en conflit avec les imports existants.
En particulier :
- `database` est peut-être déjà importé dans aiService.ts → ne pas dupliquer l'import
- `GeneratedPlan` est peut-être déjà importé depuis `./types` → ne pas dupliquer

Ajuster les imports en conséquence (merger si nécessaire).

### 4. Vérifier TypeScript

Lancer mentalement `npx tsc --noEmit` — s'assurer que :
- `generateFromProfile` retourne bien `Promise<GeneratedPlan>`
- `UserProfile` re-exporté sans conflit avec types existants

## Contraintes
- **Ne pas casser** `generatePlan()` ni `testProviderConnection()`
- **Ne pas modifier** le flux AIFormData / offlineEngine
- **Ne pas supprimer** de fonctions ou exports existants
- **Pas de `any`** en TypeScript
- **Pas de `console.log`** en production
- **Import database** : utiliser le singleton existant depuis `../../model` (vérifier le path relatif dans aiService.ts)

## Critères de validation
- `npx tsc --noEmit` → zéro erreur
- `npm test` → zéro fail (les tests existants ne doivent pas casser)
- `generateFromProfile` est exporté depuis `aiService.ts`
- `generatePlan()` existant fonctionne toujours (pas de régression)
- L'import de `database` ne crée pas de doublon

## Dépendances
Ce groupe dépend de : **Groupe C** (programGenerator/index.ts doit exister)

## Statut
✅ Résolu — 20260221-1725

## Résolution
Rapport do : docs/bmad/do/20260221-1725-feat-programgenerator-integration.md
