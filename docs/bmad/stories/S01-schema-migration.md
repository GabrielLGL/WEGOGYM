# S01 — Migration Schema v16 + Modèle User
> Priorité : Must | Bloque : S02, S06, S07

## Objectif
Ajouter les champs `ai_provider` et `ai_api_key` au schema WatermelonDB et au modèle User.

## Tâches techniques
1. `model/schema.ts` : passer version 15 → 16, ajouter dans `users` :
   - `{ name: 'ai_provider', type: 'string', isOptional: true }`
   - `{ name: 'ai_api_key', type: 'string', isOptional: true }`
2. `model/models/User.ts` : ajouter les décorateurs :
   - `@field('ai_provider') aiProvider!: string | null`
   - `@text('ai_api_key') aiApiKey!: string | null`

## Critères d'acceptation
- [ ] L'app démarre sans crash après migration
- [ ] Les champs `aiProvider` et `aiApiKey` sont accessibles sur l'objet User
- [ ] Les champs sont null par défaut (isOptional)
