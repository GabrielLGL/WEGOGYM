# Product Brief — Assistant IA WEGOGYM
> Date : 2026-02-18 | Phase 2 validée

## Problème
Les utilisateurs de WEGOGYM savent qu'ils veulent s'entraîner mais ne savent pas toujours **quoi faire** : quel programme choisir, comment structurer une séance, quels exercices combiner. Créer un programme manuellement demande des connaissances en programmation sportive que la plupart n'ont pas.

## Solution
Un **Assistant IA** intégré à l'app qui génère automatiquement un programme ou une séance personnalisée à partir d'un formulaire simple. Il fonctionne **sans connexion** (moteur de règles) et peut être **boosté** avec une clé API personnelle pour des résultats plus fins.

## Utilisateurs cibles
- **Débutant** : ne sait pas par où commencer, veut qu'on lui dise quoi faire
- **Intermédiaire** : veut varier son entraînement ou repartir sur une nouvelle structure
- **Avancé** : veut gagner du temps sur la planification, utilise la clé API pour plus de précision

## Ce que l'utilisateur peut faire
1. Ouvrir l'écran "Assistant" depuis la nav bar
2. Choisir : générer un **Programme** ou une **Séance**
3. Remplir un formulaire (objectif, niveau, équipement, fréquence)
4. Voir un aperçu du résultat généré
5. Valider → insertion automatique en DB (visible dans Home / SessionDetail)
6. (Optionnel) Configurer sa clé API dans Settings pour booster la qualité

## Providers IA supportés
| Provider | Mode | SDK |
|----------|------|-----|
| Moteur de règles | Offline (défaut) | Aucun |
| Claude (Anthropic) | Cloud | API REST |
| OpenAI (GPT-4o) | Cloud | API REST |
| Gemini (Google) | Cloud | `@google/generative-ai` |

## Métriques de succès
- L'utilisateur peut générer et sauvegarder un programme en moins de 2 minutes
- Le mode offline fonctionne sans aucune configuration préalable
- Le mode API produit un résultat cohérent avec le contexte DB de l'utilisateur
- Zéro crash lié au parsing de la réponse IA (fallback garanti sur le moteur de règles)

## Hors scope
- Chat conversationnel (pas de back-and-forth avec l'IA)
- Modification du résultat généré avant validation (ça se fait dans les écrans existants après)
- Backend proxy / hébergement de clé API côté serveur
- Autres providers IA (uniquement Claude, OpenAI, Gemini)
- Suivi de progression basé sur l'IA (recommandations continues)
