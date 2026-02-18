# PRD — Assistant IA WEGOGYM
> Date : 2026-02-18 | Phase 3 validée

## Epic 1 — Écran Assistant

**US-01 — Accès à l'assistant** *(Must)*
> En tant qu'utilisateur, je veux accéder à l'Assistant depuis la nav bar pour pouvoir générer du contenu à tout moment.
- [ ] Nouvel onglet "Assistant" dans la bottom nav (icône baguette magique)
- [ ] L'écran s'affiche avec deux options : "Créer un Programme" / "Créer une Séance"

**US-02 — Formulaire de génération Programme** *(Must)*
> En tant qu'utilisateur, je veux remplir un formulaire pour décrire mes besoins afin que l'IA génère un programme adapté.
- [ ] Champs : objectif (prise de masse / perte de poids / force / endurance), niveau (débutant / intermédiaire / avancé), équipement (haltères / barre / machines / poids du corps), jours/semaine (2-6), durée séance (30/45/60/90 min)
- [ ] Bouton "Générer"

**US-03 — Formulaire de génération Séance** *(Must)*
> En tant qu'utilisateur, je veux générer une séance unique pour aujourd'hui sans créer un programme complet.
- [ ] Champs : groupe musculaire cible, niveau, équipement, durée
- [ ] Sélecteur "Ajouter à quel programme ?" (liste des programmes existants en DB)
- [ ] Bouton "Générer"

## Epic 2 — Génération & Aperçu

**US-04 — Génération offline (moteur de règles)** *(Must)*
> En tant qu'utilisateur sans clé API, je veux que la génération fonctionne quand même pour ne pas être bloqué.
- [ ] Moteur de règles produit un `GeneratedPlan` structuré (JSON interne)
- [ ] Répartition musculaire cohérente, pas de conflit agoniste/antagoniste
- [ ] Utilise les exercices déjà présents en DB en priorité

**US-05 — Génération via clé API** *(Should)*
> En tant qu'utilisateur avec une clé API configurée, je veux que l'IA utilise mon historique pour personnaliser la génération.
- [ ] Contexte DB injecté dans le prompt (historique, PRs, exercices favoris)
- [ ] Réponse JSON parsée de manière défensive
- [ ] Si la réponse est invalide → fallback automatique sur le moteur offline

**US-06 — Aperçu du résultat** *(Must)*
> En tant qu'utilisateur, je veux voir ce qui va être créé avant de valider pour pouvoir annuler si ça ne me convient pas.
- [ ] Affichage du nom du programme/séance généré
- [ ] Liste des séances (mode programme) ou des exercices (mode séance)
- [ ] Boutons "Régénérer" et "Valider"

## Epic 3 — Insertion en DB

**US-07 — Sauvegarde Programme** *(Must)*
> En tant qu'utilisateur, je veux valider un programme généré pour qu'il apparaisse dans Home.
- [ ] Crée `Program` + N `Session` + `SessionExercise` via WatermelonDB
- [ ] Redirige vers Home après validation

**US-08 — Sauvegarde Séance** *(Must)*
> En tant qu'utilisateur, je veux valider une séance générée pour pouvoir la lancer immédiatement.
- [ ] Crée une `Session` standalone + `SessionExercise`
- [ ] Redirige vers SessionDetail après validation

## Epic 4 — Configuration IA

**US-09 — Choix du provider & clé API** *(Should)*
> En tant qu'utilisateur, je veux configurer mon provider IA dans Settings pour booster la qualité de génération.
- [ ] Nouvelle section "Intelligence Artificielle" dans SettingsScreen
- [ ] Sélecteur de provider : Offline / Claude / OpenAI / Gemini
- [ ] Champ clé API (masqué, type password)
- [ ] Bouton "Tester la connexion"
- [ ] Clé stockée dans le modèle `User` (champ `ai_api_key` + `ai_provider`)

## Priorisation MoSCoW

| Priorité | Stories |
|----------|---------|
| **Must** | US-01, US-02, US-03, US-04, US-06, US-07, US-08 |
| **Should** | US-05, US-09 |
| **Could** | Régénération partielle, historique des générations |
| **Won't** | Chat conversationnel, backend proxy |
