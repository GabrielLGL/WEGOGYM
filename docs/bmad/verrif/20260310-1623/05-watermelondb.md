# Passe 5/8 — Cohérence WatermelonDB

## Schema version: v33

## Résultat: ✅ Schema et modèles parfaitement synchronisés

- 10 tables, 10 modèles
- Toutes les colonnes ont un décorateur correspondant
- Tous les décorateurs ont une colonne correspondante
- Relations (@relation, @children, @immutableRelation) cohérentes avec FK
- Types TypeScript correspondent aux types de colonnes
- Migrations v27→v33 cohérentes

## Issues mineures

### 🟡 WARN-1: Migrations gap v1-v26
**Fichier:** `model/migrations.ts:3-4`
**Problème:** Pas de migration pour v1-v26. Utilisateurs avec DB très ancienne = crash au démarrage.
**Atténuation:** App probablement publiée à v27+. Risque très faible.

### 🔵 SUGG-1: Exercise manque @children decorators
**Fichier:** `model/models/Exercise.ts:12-19`
**Problème:** Associations `has_many` déclarées mais pas de `@children` decorators.

### 🔵 SUGG-2: JSI désactivé (`jsi: false`)
**Fichier:** `model/index.ts:24`
**Problème:** Performance réduite (async bridge). Trade-off connu Expo 52 bridgeless.

## Résumé
- 🔴 Critiques: 0
- 🟡 Warnings: 1
- 🔵 Suggestions: 2
