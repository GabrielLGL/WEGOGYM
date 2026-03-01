# CHORE(scripts) — build-exercise-animations : diagnostic + pivot source + fix matching
Date : 2026-03-01 15:00

## Instruction
docs/bmad/prompts/20260301-1435-exercise-animations-setup-B.md

## Rapport source
docs/bmad/prompts/20260301-1435-exercise-animations-setup-B.md

## Classification
Type : chore
Fichiers modifiés :
- `scripts/build-exercise-animations.mjs`
- `scripts/README-animations.md`
- `mobile/src/model/utils/animationMap.ts`
- `scripts/build-log.txt` (log intermédiaire — ignoré par gitignore)

## Ce qui a été fait

### Diagnostics
1. ExerciseDB (RapidAPI) : `gifUrl` supprimé de l'API en 2025 — 0/30 résultats
2. free-exercise-db (GitHub) : dataset OK (873 exercices, JPG), mais bug matching
3. Supabase upload : `Invalid Compact JWS` → clé `sb_secret_` incompatible avec Storage REST API

### Corrections

**Script `build-exercise-animations.mjs`** :
- Pivot source ExerciseDB → free-exercise-db (GitHub, CC0, no API key)
- Correction bug matching : `normTerm.includes(w)` → `name.includes(normalize(term))`
  (l'ancienne logique permettait `"barbell".includes("a")` = true → faux positifs)
- Ajout guard au démarrage : détecte le format `sb_secret_` et affiche un message clair
- Search terms affinés pour 29/30 exercices (seul `bulgarian_split_squat` absent du dataset)

**README `scripts/README-animations.md`** :
- Tableau clair JWT vs sb_secret_ avec instructions pour trouver la bonne clé
- Mise à jour source (free-exercise-db au lieu de ExerciseDB)
- Suppression de EXERCISEDB_API_KEY des prérequis
- Note sur les GIFs animés (non disponibles automatiquement — upload manuel)

**`animationMap.ts`** :
- URLs mises à jour avec extension `.jpg` (au lieu de `.webp`) pour correspondre aux fichiers uploadés
- `bulgarian_split_squat: undefined` documenté (absent du dataset)

### État des uploads Supabase
- 0 fichiers uploadés — la clé `sb_secret_...` a été rejetée par la Storage REST API
- Le script est prêt et fonctionnel : relancer après avoir mis la bonne clé JWT

## Vérification
- TypeScript : ✅ zéro erreur
- Tests : 3 failed (pré-existants, emoji encoding) / 1559 total — aucune régression
- Nouveau test créé : non
- Matching dry-run : 29/30 exercices trouvés

## Prochaine étape obligatoire

1. Récupérer la **JWT service_role key** (format `eyJhbGci...`) depuis :
   Supabase Dashboard → Settings → API → "Project API keys" → "service_role"

2. Remplacer dans `.env.local` :
   ```
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. Relancer :
   ```bash
   node scripts/build-exercise-animations.mjs > mobile/src/model/utils/animationMap.ts
   ```

## Documentation mise à jour
- `scripts/README-animations.md` — format clé, nouvelle source, troubleshooting

## Statut
⚠️ Partiellement résolu — upload bloqué (clé Supabase mauvais format)
Script correct et prêt. Relancer après avoir corrigé SUPABASE_SERVICE_ROLE_KEY.

## Commit
[à remplir]
