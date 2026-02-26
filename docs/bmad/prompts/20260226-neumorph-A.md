# Groupe A — Theme neumorphique

**Fichier** : `mobile/src/theme/index.ts`

## Changements appliqués

### Palette colors
- `background`: `#121212` → `#21242b`
- `card`: `#1C1C1E` → `#21242b` (principe neumorphisme : card = background)
- `cardSecondary`: `#2C2C2E` → `#252830`
- `primary`: `#007AFF` → `#00cec9` (cyan)
- `danger`: `#FF3B30` → `#ff6b6b`
- `success`: `#34C759` → `#00cec9`
- `warning`: `#FF9500` (inchangé)
- `text`: `#FFFFFF` → `#dfe6e9`
- `textSecondary`: `#8E8E93` → `#b2bec3`
- `placeholder`: `#444` → `#636e72`
- `border`: `#333` → `#2c3039`
- `separator`: `#38383A` → `#2c3039`
- `shadow`: `#000` → `#16181d`
- `secondaryButton`: `#3A3A3C` → `#252830`
- `overlay`: `rgba(0,0,0,0.85)` → `rgba(10,12,16,0.9)`
- `bottomSheetOverlay`: `rgba(0,0,0,0.4)` → `rgba(10,12,16,0.5)`
- `primaryBg`: `rgba(0,122,255,0.15)` → `rgba(0,206,201,0.15)`
- `successBg`: `rgba(52,199,89,0.12)` → `rgba(0,206,201,0.12)`

### Nouveaux tokens
- `neuShadowDark: '#16181d'`
- `neuShadowLight: '#2c3039'`
- `secondaryAccent: '#6c5ce7'`

### borderRadius (coins plus arrondis)
- `sm`: 8 → 10
- `md`: 12 → 14
- `lg`: 20 (inchangé)
- `xl`: 24 → 26

### intensityColors (heatmap cyan)
- `['#252830', '#004d4a', '#007875', '#00cec9']`

### Nouvel export `neuShadow`
- `elevated`: shadow 6px, elevation 6, borderColor light
- `elevatedSm`: shadow 3px, elevation 3, borderColor light
- `pressed`: shadow 1px, elevation 1, borderColor dark (effet enfoncé)
