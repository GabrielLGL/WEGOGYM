<!-- v1.0 — 2026-02-21 -->
# Prompt — fix OpenAI 429 — 20260221-1200

## Demande originale
"j'ai testé les deux, ils ne marchent pas, on va dabord faire openai, l'erreur que j'ai est openai api erreur 429, prend les dernieres news pour ne rien utiliser d'obsolete"

## Analyse
Deux causes identifiées :
1. Modèle `gpt-4o-mini` → remplacé par `gpt-4.1-mini` (OpenAI 2026)
2. Fonction test trop lourde → envoie 2048 tokens au lieu d'un ping minimal → déclenche le 429
3. Pas de messages d'aide utilisateur pour le 429 OpenAI (contrairement à Gemini qui a des hints)

## Groupes générés
| Groupe | Rapport | Fichiers | Vague | Statut |
|--------|---------|----------|-------|--------|
| A | 20260221-1200-openai-fix-A.md | openaiProvider.ts, aiService.ts | 1 | ⏳ |
| B | 20260221-1200-openai-fix-B.md | SettingsScreen.tsx | 1 | ⏳ |

## Ordre d'exécution
Vague 1 — A et B sont indépendants, lancer en parallèle.
Pas de vague 2.
