<!-- v1.0 — 20260227-0000 -->
# Rapport — aria-busy button — Groupe A — 20260227-0000

## Objectif
Dans `web/src/app/page.tsx`, remplacer l'attribut `disabled={status === 'loading'}` sur le
bouton de soumission du formulaire par :
- `aria-busy={status === "loading"}`
- `aria-disabled={status === "loading"}`
- `tabIndex={status === "loading" ? -1 : 0}`

Et mettre à jour les classes CSS Tailwind pour utiliser le variant `aria-disabled:` à la place
du variant `disabled:`.

## Fichiers concernés
- `web/src/app/page.tsx` (ligne 348-356)

## Contexte technique

**Avant (lignes 348-356 actuelles) :**
```tsx
<button
  type="submit"
  disabled={status === "loading"}
  className="w-full btn-liquid text-white py-4 rounded-full font-extrabold text-base
    uppercase tracking-widest border-none cursor-pointer
    disabled:opacity-50 disabled:cursor-not-allowed"
>
  {status === "loading" ? "Inscription..." : "S\u2019inscrire"}
</button>
```

**Après :**
```tsx
<button
  type="submit"
  aria-busy={status === "loading"}
  aria-disabled={status === "loading"}
  tabIndex={status === "loading" ? -1 : 0}
  className="w-full btn-liquid text-white py-4 rounded-full font-extrabold text-base
    uppercase tracking-widest border-none cursor-pointer
    aria-disabled:opacity-50 aria-disabled:cursor-not-allowed"
>
  {status === "loading" ? "Inscription..." : "S\u2019inscrire"}
</button>
```

## Étapes
1. Lire `web/src/app/page.tsx` (confirmer ligne 348-356).
2. Remplacer le bloc button : supprimer `disabled=`, ajouter `aria-busy=`, `aria-disabled=`, `tabIndex=`.
3. Remplacer les classes CSS `disabled:opacity-50 disabled:cursor-not-allowed` par `aria-disabled:opacity-50 aria-disabled:cursor-not-allowed`.
4. Vérifier `npx tsc --noEmit` dans `web/`.
5. Vérifier `npm test -- --testPathPattern=page` dans `web/`.

## Contraintes
- Ne pas modifier `web/src/app/__tests__/page.test.tsx` — le test vérifie seulement le texte "Inscription...", pas l'attribut `disabled`.
- Respecter le style Tailwind existant du projet.
- Pas d'autres changements dans ce fichier.

## Critères de validation
- `npx tsc --noEmit` → zéro erreur
- `npm test` dans `web/` → le test "affiche Inscription... pendant le chargement" passe
- Visuellement : le bouton est bien semi-transparent et non-cliquable en état loading

## Dépendances
Aucune.

## Statut
⏳ En attente
