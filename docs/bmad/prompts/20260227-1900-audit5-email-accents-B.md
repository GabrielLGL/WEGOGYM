<!-- v1.0 — 2026-02-27 -->
# Rapport — Audit 5 Site Kore — Groupe B : Email Welcome Accents — 20260227-1900

## Objectif
Corriger les accents manquants dans le template d'email `welcome.tsx`.
Même problème que les pages web en Audit 1 — des mots sans accents dans les textes français.

## Fichiers concernés
- `web/src/emails/welcome.tsx`

## Contexte technique
- Composant React utilisé par Resend pour générer l'email HTML
- Utilise des styles inline (pas de classes Tailwind)
- **PAS de `"use client"`** — composant pur utilisé côté serveur (rendu par Resend)
- `npx tsc --noEmit` (depuis `web/`) doit rester à 0 erreur
- Ne pas modifier les styles, les couleurs, la structure JSX

## Corrections à appliquer

Toutes les corrections sont dans les **valeurs texte** uniquement :

### 1. Header subtitle (ligne ~114)
```
AVANT : "Bienvenue dans la communaute Kore"
APRÈS : "Bienvenue dans la communauté Kore"
```

### 2. Body intro (ligne ~128-129)
```
AVANT : "Tu fais partie des premiers a suivre Kore. On te tient au courant des qu'on lance."
APRÈS : "Tu fais partie des premiers à suivre Kore. On te tiendra au courant dès qu'on lance."
```
Note : `a` → `à`, `des qu` → `dès qu`, `tient` → `tiendra` (futur plus correct)

### 3. Feature card — "Programmes sur mesure" desc
```
AVANT : desc: "Cree tes propres routines"
APRÈS : desc: "Crée tes propres routines"
```

### 4. Feature card — "100% Offline" desc
```
AVANT : desc: "Pas besoin de wifi a la salle"
APRÈS : desc: "Pas besoin de wifi à la salle"
```

### 5. Feature card — "Progression visible" desc
```
AVANT : desc: "Graphiques et stats detailles"
APRÈS : desc: "Graphiques et stats détaillés"
```

### 6. CTA button text
```
AVANT : "Decouvrir Kore"
APRÈS : "Découvrir Kore"
```

### 7. Footer — désinscription (ligne ~250-252)
```
AVANT : "Tu recois cet email car tu t'es inscrit sur Kore."
APRÈS : "Tu reçois cet email car tu t'es inscrit sur Kore."

AVANT : "Pour te desinscrire, reponds a cet email."
APRÈS : "Pour te désinscrire, réponds à cet email."
```

## Contraintes
- Ne modifier QUE le texte, pas les styles inline ni la structure JSX
- Garder le `&apos;` là où il est déjà utilisé (ex: `t&apos;es`)
- Ne pas changer les noms de features ni les emojis
- Le composant doit rester utilisable par Resend sans erreur TypeScript

## Critères de validation
- `npx tsc --noEmit` (depuis `web/`) → 0 erreur
- Vérification visuelle : tous les mots listés ci-dessus ont leurs accents

## Dépendances
Aucune dépendance — peut tourner en parallèle avec Groupes A et C.

## Statut
⏳ En attente
