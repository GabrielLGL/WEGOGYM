<!-- v1.0 — 2026-02-21 -->
# Prompt — warnings-dev — 20260221-1730

## Demande originale
> tout marche bien mais j'ai ça :
> `[🍉] JSI SQLiteAdapter not available… falling back to asynchronous operation`
> `[aiService] Provider cloud échoué, fallback offline: [Error: OpenAI API erreur 429]`

## Diagnostic
Les deux warnings sont **indépendants** et touchent des fichiers différents → parallélisables.

| Warning | Nature | Gravité | Action |
|---------|--------|---------|--------|
| JSI SQLiteAdapter | Limitation dev (Expo Go / pas de rebuild natif) | Aucune — attendu | Commentaire explicatif uniquement |
| OpenAI 429 | Rate limit transitoire → fallback immédiat | Faible — le fallback fonctionne | Retry ×1 avec backoff 1s |

## Groupes générés
| Groupe | Rapport | Fichiers | Vague | Statut |
|--------|---------|----------|-------|--------|
| A | `20260221-1730-warnings-A.md` | `model/index.ts` | 1 | ⏳ |
| B | `20260221-1730-warnings-B.md` | `openaiProvider.ts` | 1 | ⏳ |

## Ordre d'exécution
Les deux groupes sont **indépendants** — lancer en parallèle dans deux sessions Claude Code.

## Note
Le warning JSI ne peut pas être supprimé par du code : il vient de WatermelonDB interne.
La vraie correction est un rebuild natif : `npm run android`.
Le Groupe A se limite donc à un commentaire documentaire + vérification de config.
