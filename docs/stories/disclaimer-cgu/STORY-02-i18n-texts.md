# STORY-02 — Textes i18n disclaimer + CGU

## Description
Ajouter toutes les clés de traduction FR/EN pour le disclaimer santé, le bouton d'acceptation, le lien CGU, et le texte fallback des CGU complètes.

## Tâches techniques
1. `i18n/fr.ts` : ajouter section `disclaimer` + `legal`
2. `i18n/en.ts` : idem en anglais
3. Clés : `disclaimer.title`, `disclaimer.body`, `disclaimer.cguLink`, `disclaimer.acceptButton`, `legal.title`, `legal.fallbackContent`, `settings.legal`

## Critères d'acceptation
- [ ] Toutes les clés existent en FR et EN
- [ ] Pas de `as const` sur l'objet (pattern i18n existant)
- [ ] `npx tsc --noEmit` → 0 erreur

## Estimation
S (< 1h)

## Dépendances
Aucune — parallélisable avec STORY-01
