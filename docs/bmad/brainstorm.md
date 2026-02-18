# Brainstorming — Assistant IA WEGOGYM
> Date : 2026-02-18 | Phase 1 validée

## L'idée
Un écran dédié "Assistant IA" dans la nav bar qui permet de générer un **programme complet** ou une **séance unique**, via un formulaire structuré. Fonctionne en **offline** (moteur de règles) avec option **clé API utilisateur** (Claude/GPT) pour une génération plus intelligente.

## Angles explorés

### Expérience utilisateur
- Écran dédié accessible depuis la bottom nav (nouvel onglet)
- Formulaire : objectif, niveau, équipement dispo, fréquence/durée
- L'IA (ou le moteur) génère un aperçu → l'utilisateur valide → ça s'insère en DB via WatermelonDB
- La clé API se configure dans Settings (déjà existant)

### Moteur offline (règles métier)
- Algorithme de construction : répartition musculaire, progressivité, pas de doublon agoniste/antagoniste le même jour
- Contexte DB injecté : historique (`histories` + `sets`), exercices (`exercises`), PRs (`performance_logs`), préférences (`users`)
- Output structuré → parsing → création `Program` + `Session` + `SessionExercise`

### Mode API (boost)
- Clé stockée dans le modèle `User` (nouveau champ `ai_api_key`)
- Prompt système enrichi avec le contexte DB de l'utilisateur
- Réponse JSON structurée → même pipeline d'insertion que le mode offline
- Support Claude (Anthropic), OpenAI et Gemini (Google)

### Ce qui s'insère en DB
- Mode "Programme" → crée un `Program` + N `Session` + `SessionExercise` par séance
- Mode "Séance" → crée une `Session` standalone + `SessionExercise`

## Risques & Dépendances

| Risque | Impact | Mitigation |
|--------|--------|------------|
| Clé API exposée côté client | Moyen | Stockage local uniquement, jamais dans les logs |
| Réponse API mal formée (JSON invalide) | Élevé | Parser défensif + fallback moteur de règles |
| Moteur de règles trop générique | Moyen | S'appuyer sur l'historique DB pour personnaliser |
| Ajout d'un onglet dans la nav bar | Faible | Modifier `navigation/index.tsx` + bottom tabs |
| Migration schema (champ `ai_api_key`) | Faible | Schema v16, migration propre |
| Exercices générés inexistants en DB | Élevé | Matcher les noms générés avec les exercices existants + créer si absent |
