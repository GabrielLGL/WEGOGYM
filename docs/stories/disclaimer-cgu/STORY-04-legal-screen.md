# STORY-04 — LegalScreen (WebView + fallback)

## Description
Créer un écran LegalScreen qui affiche les CGU via WebView (kore-app.net/cgu). Si offline, affiche un fallback texte local depuis i18n.

## Tâches techniques
1. Créer `screens/LegalScreen.tsx`
2. WebView charge `CGU_URL`
3. ActivityIndicator pendant le chargement
4. Détection erreur réseau → affiche `t.legal.fallbackContent` dans un ScrollView
5. `navigation/index.tsx` : ajouter route `Legal`
6. Vérifier si `react-native-webview` est installé, sinon l'ajouter

## Critères d'acceptation
- [ ] WebView charge kore-app.net/cgu
- [ ] Si offline → texte local affiché
- [ ] Route `Legal` accessible depuis navigation
- [ ] Header avec titre + bouton retour
- [ ] `npx tsc --noEmit` → 0 erreur

## Estimation
M (1-2h)

## Dépendances
- STORY-02 (textes i18n pour le fallback)
