<!-- v1.0 — 2026-03-01 -->
# Prompt — Intégration catalogue exercises — 20260301-1930

## Demande originale
Intégrer la table exercises dans l'app mobile (recherche d'exercices via Supabase client ou API REST)

## Décision d'architecture
- **Plain fetch** via Supabase REST API (pas de `@supabase/supabase-js` dans mobile/)
- Clé anon Supabase exposée dans `app.json` extras (publique, safe)
- Nouvelle route Native Stack `ExerciseCatalog` + accès via icône dans header ExercisesScreen
- Import d'exercices → WatermelonDB (offline-first respecté)

## Action manuelle AVANT de lancer les groupes
Récupérer la clé anon Supabase :
1. Supabase Dashboard → Settings → API → "Project API keys"
2. Copier **anon / public** (commence par `eyJ...`)
3. Remplacer dans `mobile/app.json` le `PLACEHOLDER_REMPLACER_PAR_LA_VRAIE_CLE_ANON`

## Groupes générés

| Groupe | Rapport | Fichiers | Vague | Statut |
|--------|---------|----------|-------|--------|
| A | `20260301-1930-exercise-catalog-A.md` | `services/exerciseCatalog.ts` + `app.json` | 1 | ⏳ |
| B | `20260301-1930-exercise-catalog-B.md` | `screens/ExerciseCatalogScreen.tsx` | 2 | ⏳ |
| C | `20260301-1930-exercise-catalog-C.md` | `navigation/index.tsx` + `ExercisesScreen.tsx` | 3 | ⏳ |

## Ordre d'exécution

```
Vague 1 — Groupe A (indépendant)
  → Service REST + types + mapping + app.json

Vague 2 — Groupe B (dépend de A)
  → ExerciseCatalogScreen avec search, pagination, GIF, import

Vague 3 — Groupe C (dépend de B)
  → Navigation + bouton icône dans ExercisesScreen
```
