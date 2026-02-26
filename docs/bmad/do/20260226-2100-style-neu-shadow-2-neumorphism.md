# style(neumorphism): vrai neumorphisme avec react-native-shadow-2

**Date :** 2026-02-26 21:00  
**Type :** style  
**Status :** ✅ Terminé

## Changements

### Groupe A — Infrastructure
- `mobile/package.json` : ajout `react-native-shadow-2@^7.1.2` (SVG déjà installé, 0 rebuild natif)
- `mobile/src/theme/index.ts` :
  - Ajout `neuShadowParams` (dark + light, 3 niveaux chacun)
  - `lightColors.background` + `lightColors.card` → `'#e8ecef'` (card === background pour neumorphisme)
  - Gradient light mis à jour : `bgGradientStart: '#eaeff5'`, `bgGradientEnd: '#dce4ee'`
- `mobile/src/components/NeuShadow.tsx` : nouveau composant — 2 Shadow imbriqués (dark offset + / light offset -)

### Groupe B — Migration composants
- `mobile/src/components/Button.tsx` : remplace `neuShadow.*` ViewStyle par `<NeuShadow>` wrapper + `isPressed` state
- `mobile/src/screens/SettingsScreen.tsx` : 8 sections wrappées avec `<NeuShadow level="elevatedSm">`

## Vérification
- `npx tsc --noEmit` : 0 erreur ✅
- `npm test` : 1255/1259 passent — 4 échecs préexistants (databaseHelpers/models, non liés) ✅
- `SettingsScreen.test.tsx` : PASS ✅

## Notes API react-native-shadow-2 v7
- `style` → borderRadius pour coins corrects
- `containerStyle` → layout externe (margin…)
- `stretch` → alignSelf stretch (fullWidth buttons)
- `paintInside={false}` → évite le remplissage interne indésirable
