#!/usr/bin/env node
/**
 * build-exercise-animations.mjs
 *
 * Pipeline : free-exercise-db (GitHub, no API key) → WebP animé 2 frames → Supabase Storage
 * Output   : updated animationMap.ts content (stdout)
 *
 * Note : ExerciseDB (RapidAPI) a supprimé gifUrl de son API en 2025.
 * Ce script utilise le dataset libre https://github.com/yuhonas/free-exercise-db
 * qui contient 873 exercices avec exactement 2 images par exercice :
 *   0.jpg = position de départ
 *   1.jpg = position d'arrivée
 *
 * Le script génère des WebP animés 2 frames (1fps, loop infini) via ffmpeg-static.
 *
 * Usage:
 *   SUPABASE_URL=https://... SUPABASE_SERVICE_ROLE_KEY=xxx \
 *     node scripts/build-exercise-animations.mjs > mobile/src/model/utils/animationMap.ts 2>scripts/build-log.txt
 *
 * Ou via .env.local à la racine du repo (chargé automatiquement).
 *
 * Requirements:
 *   - Node 18+ (fetch built-in)
 *   - Supabase Storage bucket "exercise-animations" créé (public)
 *   - SUPABASE_SERVICE_ROLE_KEY dans .env.local
 *   - ffmpeg-static installé (npm install à la racine)
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const ffmpegBin = (await import('ffmpeg-static')).default
if (!ffmpegBin) {
  console.error('[error] ffmpeg-static not found. Run: npm install ffmpeg-static')
  process.exit(1)
}

// ── Load .env.local from repo root ─────────────────────────────────────────
const repoRoot = join(fileURLToPath(import.meta.url), '..', '..')
const envPath = join(repoRoot, '.env.local')
if (existsSync(envPath)) {
  const lines = readFileSync(envPath, 'utf8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    const key = trimmed.slice(0, idx).trim()
    const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '')
    if (key && !process.env[key]) process.env[key] = val
  }
  console.error('[env] Loaded .env.local')
}

// ── Config ──────────────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL ?? 'https://tcuchypwztvghiywhobo.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const BUCKET = 'exercise-animations'
const TMP_DIR = join(tmpdir(), 'kore-animations')

// Source : free-exercise-db GitHub dataset (no API key needed)
const FREE_EXERCISE_DB_URL =
  'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json'
const FREE_EXERCISE_IMG_BASE =
  'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises'

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY is required')
  process.exit(1)
}
// Supabase changed to sb_secret_ format for SDK v3, but Storage REST API still requires JWT
if (SUPABASE_SERVICE_ROLE_KEY.startsWith('sb_')) {
  console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY has wrong format.')
  console.error('       The Storage REST API requires the JWT service_role key (starts with "eyJ...")')
  console.error('       NOT the new sb_secret_... format (which is for Supabase SDK v3).')
  console.error('')
  console.error('       Where to find the JWT key:')
  console.error('       Supabase Dashboard → Settings → API → "Project API keys"')
  console.error('       → Copy the "service_role" value (long eyJ... string)')
  process.exit(1)
}

// ── Mapping animationKey → search terms (mots qui doivent tous être dans le nom) ─
const EXERCISE_SEARCH_TERMS = {
  // Pectoraux
  bench_press_barbell: ['barbell', 'bench', 'press', 'medium'],
  bench_press_dumbbell: ['dumbbell', 'bench', 'press'],
  incline_bench_press: ['incline', 'bench', 'press', 'barbell'],
  push_ups: ['push', 'up'],
  cable_flyes: ['cable', 'flye'],
  dips_chest: ['dips', 'chest'],

  // Dos
  pull_ups: ['pull', 'up'],
  barbell_row: ['barbell', 'bent', 'over', 'row'],
  lat_pulldown: ['lat', 'pulldown'],
  deadlift: ['barbell', 'deadlift'],
  seated_cable_row: ['cable', 'seated', 'row'],

  // Jambes
  back_squat: ['barbell', 'squat'],
  leg_press: ['leg', 'press'],
  leg_extension: ['leg', 'extension'],
  dumbbell_lunges: ['dumbbell', 'lunge'],
  bulgarian_split_squat: ['bulgarian', 'squat'],
  romanian_deadlift: ['romanian', 'deadlift'],
  lying_leg_curl: ['lying', 'leg', 'curl'],
  barbell_hip_thrust: ['barbell', 'hip', 'thrust'],

  // Épaules
  overhead_press: ['barbell', 'shoulder', 'press'],
  lateral_raises: ['dumbbell', 'lateral', 'raise'],
  face_pull: ['face', 'pull'],

  // Biceps
  dumbbell_curl: ['dumbbell', 'bicep', 'curl'],
  ez_bar_curl: ['ez', 'bar', 'curl'],
  hammer_curl: ['hammer', 'curl'],

  // Triceps
  triceps_pushdown: ['triceps', 'pushdown'],
  skull_crushers: ['skull', 'crusher'],

  // Abdominaux
  crunch: ['crunch'],
  plank: ['plank'],
  leg_raises: ['hanging', 'leg', 'raise'],
}

// ── FFmpeg (ffmpeg-static binary) ────────────────────────────────────────────

// ── Helpers ─────────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/**
 * Normalize a string for matching: lowercase, replace hyphens/special chars with space.
 */
function normalize(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim()
}

/**
 * Find the best matching exercise from the dataset.
 * Each searchTerm must appear as a substring in the normalized exercise name.
 */
function findBestMatch(exercises, searchTerms) {
  const candidates = []

  for (const ex of exercises) {
    const name = normalize(ex.name)

    // All search terms must appear in the name string (substring match, not word-fragment)
    const allMatch = searchTerms.every((term) => name.includes(normalize(term)))

    if (allMatch) {
      candidates.push({ ex, nameLen: ex.name.length })
    }
  }

  if (candidates.length === 0) return null

  // Prefer shorter names (more specific match)
  candidates.sort((a, b) => a.nameLen - b.nameLen)
  return candidates[0].ex
}

/**
 * Download a URL to a local file.
 */
async function downloadFile(url, destPath) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Download failed ${res.status}: ${url}`)
  const buf = Buffer.from(await res.arrayBuffer())
  writeFileSync(destPath, buf)
  return buf.length
}

/**
 * Upload a local file to Supabase Storage.
 * Returns the public URL.
 */
async function uploadToSupabase(localPath, storagePath, mimeType) {
  const fileData = readFileSync(localPath)
  const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${storagePath}`

  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': mimeType,
      'x-upsert': 'true',
    },
    body: fileData,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Supabase upload ${res.status}: ${text.slice(0, 300)}`)
  }

  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${storagePath}`
}

/**
 * Create an animated 2-frame WebP using ffmpeg-static binary.
 * Each frame displayed for 1 second, loops infinitely.
 */
async function createAnimatedWebP(frame0Path, frame1Path, outputPath) {
  const args = [
    '-y',
    '-loop', '1', '-t', '1', '-i', frame0Path,
    '-loop', '1', '-t', '1', '-i', frame1Path,
    '-filter_complex', '[0:v][1:v]concat=n=2:v=1[out]',
    '-map', '[out]',
    '-vcodec', 'libwebp_anim',
    '-loop', '0',
    '-quality', '75',
    outputPath,
  ]
  await execFileAsync(ffmpegBin, args)
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  mkdirSync(TMP_DIR, { recursive: true })
  console.error(`[info] Using ffmpeg binary: ${ffmpegBin}`)

  // 1. Download exercises dataset
  console.error('[info] Fetching free-exercise-db dataset...')
  const datasetRes = await fetch(FREE_EXERCISE_DB_URL)
  if (!datasetRes.ok) throw new Error(`Dataset fetch failed: ${datasetRes.status}`)
  const allExercises = await datasetRes.json()
  console.error(`[info] Dataset loaded: ${allExercises.length} exercises`)
  console.error(`[info] Processing ${Object.keys(EXERCISE_SEARCH_TERMS).length} animations...`)
  console.error('')

  /** @type {Record<string, string | undefined>} */
  const resultMap = {}
  const keys = Object.keys(EXERCISE_SEARCH_TERMS)

  for (let i = 0; i < keys.length; i++) {
    const animKey = keys[i]
    const searchTerms = EXERCISE_SEARCH_TERMS[animKey]
    console.error(`[${i + 1}/${keys.length}] ${animKey} — terms: [${searchTerms.join(', ')}]`)

    try {
      // 2. Find matching exercise
      const exercise = findBestMatch(allExercises, searchTerms)
      if (!exercise || !exercise.images || exercise.images.length === 0) {
        console.error(`  ⚠ No match found → skipped`)
        resultMap[animKey] = undefined
        continue
      }
      console.error(`  ✓ Match: "${exercise.name}" (${exercise.images.length} images)`)

      // 3. Download 0.jpg and 1.jpg (2 frames of the movement)
      const images = exercise.images.slice(0, 2)
      const framePaths = []

      for (let f = 0; f < images.length; f++) {
        const url = `${FREE_EXERCISE_IMG_BASE}/${images[f]}`
        const localPath = join(TMP_DIR, `${animKey}_${f}.jpg`)
        const size = await downloadFile(url, localPath)
        console.error(`  ✓ Frame ${f} downloaded (${(size / 1024).toFixed(0)} KB)`)
        framePaths.push(localPath)
      }

      if (framePaths.length < 2) {
        console.error(`  ⚠ Only 1 image available — creating static WebP (single frame)`)
        // Fall back to single-frame WebP if dataset only has 1 image
        framePaths.push(framePaths[0])
      }

      // 4. Create animated WebP via FFmpeg WASM
      const webpPath = join(TMP_DIR, `${animKey}.webp`)
      await createAnimatedWebP(framePaths[0], framePaths[1], webpPath)
      const webpSize = readFileSync(webpPath).length
      console.error(`  ✓ Animated WebP created (${(webpSize / 1024).toFixed(0)} KB)`)

      // 5. Upload to Supabase
      const publicUrl = await uploadToSupabase(webpPath, `${animKey}.webp`, 'image/webp')
      console.error(`  ✓ Uploaded → ${publicUrl}`)
      resultMap[animKey] = publicUrl

    } catch (err) {
      console.error(`  ✗ ERROR: ${err.message}`)
      resultMap[animKey] = undefined
    }

    await sleep(200) // be polite to GitHub CDN
  }

  // ── Generate animationMap.ts ──────────────────────────────────────────────
  const sections = {
    '── Pectoraux ──────────────────────────────────────────────────────────────': [
      'bench_press_barbell', 'bench_press_dumbbell', 'incline_bench_press',
      'push_ups', 'cable_flyes', 'dips_chest',
    ],
    '── Dos ────────────────────────────────────────────────────────────────────': [
      'pull_ups', 'barbell_row', 'lat_pulldown', 'deadlift', 'seated_cable_row',
    ],
    '── Jambes ─────────────────────────────────────────────────────────────────': [
      'back_squat', 'leg_press', 'leg_extension', 'dumbbell_lunges',
      'bulgarian_split_squat', 'romanian_deadlift', 'lying_leg_curl', 'barbell_hip_thrust',
    ],
    '── Épaules ────────────────────────────────────────────────────────────────': [
      'overhead_press', 'lateral_raises', 'face_pull',
    ],
    '── Biceps ─────────────────────────────────────────────────────────────────': [
      'dumbbell_curl', 'ez_bar_curl', 'hammer_curl',
    ],
    '── Triceps ────────────────────────────────────────────────────────────────': [
      'triceps_pushdown', 'skull_crushers',
    ],
    '── Abdominaux ─────────────────────────────────────────────────────────────': [
      'crunch', 'plank', 'leg_raises',
    ],
  }

  const SUPABASE_BASE = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}`

  let tsContent = `/**
 * animationMap — Mapping animationKey → URL WebP animé de démonstration (Supabase Storage)
 *
 * Source    : free-exercise-db (https://github.com/yuhonas/free-exercise-db)
 *             Licence CC0 — 873 exercices, 2 images JPG par exercice (départ + arrivée)
 * Format    : WebP animé 2 frames (1fps, loop infini) — généré via ffmpeg-static
 * Hébergement : Supabase Storage (bucket public "exercise-animations")
 *   ${SUPABASE_BASE}/
 *
 * Régénérer : node scripts/build-exercise-animations.mjs > mobile/src/model/utils/animationMap.ts 2>scripts/build-log.txt
 *
 * Fallback  : undefined → ExerciseInfoSheet affiche l'icône barbell
 * Cache     : expo-image cachePolicy="memory-disk" → offline après premier chargement
 */
export const ANIMATION_MAP: Record<string, string | undefined> = {
`

  for (const [sectionLabel, sectionKeys] of Object.entries(sections)) {
    tsContent += `  // ${sectionLabel}\n`
    for (const key of sectionKeys) {
      const url = resultMap[key]
      if (url) {
        tsContent += `  ${key}:\n    '${url}',\n`
      } else {
        tsContent += `  ${key}: undefined, // non trouvé dans free-exercise-db\n`
      }
    }
    tsContent += '\n'
  }

  tsContent = tsContent.trimEnd() + '\n}\n'
  process.stdout.write(tsContent)

  const found = Object.values(resultMap).filter(Boolean).length
  const total = Object.keys(resultMap).length
  console.error('')
  console.error(`[done] ${found}/${total} exercises mapped successfully`)
  console.error('[done] animationMap.ts content written to stdout')
  console.error('[hint] Redirect stdout to update the file:')
  console.error('       node scripts/build-exercise-animations.mjs > mobile/src/model/utils/animationMap.ts 2>scripts/build-log.txt')
}

main().catch((err) => {
  console.error('[fatal]', err)
  process.exit(1)
})
