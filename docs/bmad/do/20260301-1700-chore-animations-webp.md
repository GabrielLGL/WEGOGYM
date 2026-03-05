# DO — Exercise Animations : WebP animés 2 frames
**Date:** 2026-03-01 17:00
**Type:** chore
**Scope:** scripts, package.json, animationMap

## Résumé
Pivot du pipeline d'animations d'exercices : les images statiques JPG (`0.jpg` uniquement) sont remplacées par des **WebP animés 2 frames** (départ ↔ arrivée, 1fps, loop infini), générés via `@ffmpeg/ffmpeg` WASM en Node.js pur (pas de dépendance binaire système).

## Changements effectués

### `package.json` (racine)
- Ajout `"type": "module"` (requis pour `@ffmpeg/ffmpeg` ESM)
- Ajout `devDependencies` : `@ffmpeg/ffmpeg ^0.12.10`, `@ffmpeg/core ^0.12.9`, `@ffmpeg/util ^0.12.2`

### `scripts/build-exercise-animations.mjs`
- **Import FFmpeg WASM** : `initFFmpeg()` charge `ffmpeg-core.js` + `ffmpeg-core.wasm` depuis `node_modules/@ffmpeg/core/dist/esm/` via `createRequire`
- **Pipeline 2 frames** : téléchargement de `0.jpg` (départ) ET `1.jpg` (arrivée) au lieu de seulement `0.jpg`
- **`createAnimatedWebP()`** : concat demuxer ffmpeg → `-vcodec libwebp -loop 0 -quality 75` → WebP animé 2 frames
- **Upload Supabase** : fichier `.webp` avec `Content-Type: image/webp` (x-upsert: true)
- **Fallback** : si seulement 1 image dans le dataset → WebP à 1 frame (frame 0 dupliquée)
- **Commentaire mis à jour** : header reflète le nouveau format WebP animé

## Pipeline résultant
```
0.jpg + 1.jpg (free-exercise-db)
    ↓
@ffmpeg/ffmpeg WASM (ffmpeg-core.wasm depuis node_modules)
    ↓ concat demuxer → libwebp -loop 0
WebP animé 2 frames (1fps, loop infini)
    ↓
Upload Supabase → {animKey}.webp (x-upsert: true)
```

## Commandes d'exécution
```bash
# À la racine du repo
npm install  # installe @ffmpeg/ffmpeg + @ffmpeg/core

# Générer les WebP animés + mettre à jour animationMap.ts
node scripts/build-exercise-animations.mjs > mobile/src/model/utils/animationMap.ts 2>scripts/build-log.txt

# Vérifier TypeScript (zéro changement structurel dans l'app)
cd mobile && npx tsc --noEmit
```

## Notes techniques
- `@ffmpeg/core` embarque `ffmpeg-core.wasm` (~30MB) — premier run plus lent
- Le bucket Supabase accepte déjà `image/webp` (configuré lors du run précédent)
- Les anciens `.jpg` dans Supabase restent mais `animationMap.ts` pointe sur les `.webp`
- `bulgarian_split_squat` : toujours absent du dataset free-exercise-db → reste `undefined`
- Structure TypeScript de `animationMap.ts` identique → zéro changement dans l'app

## Fichiers modifiés
- `package.json` — type module + devDependencies ffmpeg
- `scripts/build-exercise-animations.mjs` — pipeline WebP animé complet
