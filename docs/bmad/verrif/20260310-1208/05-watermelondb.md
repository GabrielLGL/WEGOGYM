# Passe 5/8 — Cohérence WatermelonDB

## Issues trouvées : 2

### 🔴 DB1 — PerformanceLog Missing @field('exercise_id')
**Fichier :** `model/models/PerformanceLog.ts`
**Description :** Le schema définit `exercise_id` (indexed), le modèle a @relation mais PAS @field('exercise_id')
**Impact :** Le FK est géré implicitement par @relation, mais l'accès direct au champ ID est impossible
**Note :** WatermelonDB @relation gère automatiquement le FK sous-jacent — ce n'est pas un bug fonctionnel mais un manque d'accès explicite

### 🟡 DB2 — PerformanceLog sans updated_at dans schema
**Description :** Tous les autres modèles ont updated_at sauf performance_logs
**Impact :** Inconsistance, pas de bug fonctionnel si on ne modifie jamais les logs

## Cross-Reference ✅
Toutes les autres tables (9/10) sont parfaitement synchronisées schema ↔ models.
Relations, migrations v27-v33, types — tout est cohérent.
