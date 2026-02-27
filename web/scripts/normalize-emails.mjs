/**
 * normalize-emails.mjs
 * Normalise tous les emails de la table subscribers en lowercase.
 * En cas de doublon après normalisation, conserve l'entrée la plus ancienne.
 *
 * Usage:
 *   node scripts/normalize-emails.mjs
 *   node scripts/normalize-emails.mjs --dry-run
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// --- Load .env.local ---
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env.local");
try {
  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    process.env[key] = value;
  }
} catch {
  console.error("⚠️  .env.local introuvable — variables d'env requises.");
  process.exit(1);
}

const DRY_RUN = process.argv.includes("--dry-run");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

async function run() {
  console.log(DRY_RUN ? "🔍 Mode dry-run — aucune modification.\n" : "🚀 Mode live — modifications appliquées.\n");

  // 1. Récupère tous les subscribers
  const { data: rows, error } = await supabase
    .from("subscribers")
    .select("id, email, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Erreur lecture Supabase:", error.message);
    process.exit(1);
  }

  console.log(`📋 ${rows.length} subscriber(s) trouvé(s).\n`);

  // 2. Identifie les emails qui ne sont pas déjà en lowercase
  const toUpdate = rows.filter((r) => r.email !== r.email.toLowerCase());
  console.log(`✏️  ${toUpdate.length} email(s) à normaliser.`);

  // 3. Détecte les doublons potentiels après normalisation
  const seenEmails = new Map(); // lowercase email → id (le plus ancien, déjà traité)
  for (const r of rows) {
    const lower = r.email.toLowerCase();
    if (!seenEmails.has(lower)) {
      seenEmails.set(lower, r.id);
    }
  }

  let updated = 0;
  let deleted = 0;

  for (const row of toUpdate) {
    const lower = row.email.toLowerCase();
    const keepId = seenEmails.get(lower);

    if (keepId !== row.id) {
      // Un autre enregistrement avec cet email lowercase existe déjà → doublon, supprimer
      console.log(`  🗑  DOUBLON supprimé : "${row.email}" (id: ${row.id}) → déjà présent en "${lower}"`);
      if (!DRY_RUN) {
        const { error: delErr } = await supabase
          .from("subscribers")
          .delete()
          .eq("id", row.id);
        if (delErr) console.error(`     Erreur suppression: ${delErr.message}`);
        else deleted++;
      } else {
        deleted++;
      }
    } else {
      // Mettre à jour l'email en lowercase
      console.log(`  ✅ UPDATE : "${row.email}" → "${lower}"`);
      if (!DRY_RUN) {
        const { error: updErr } = await supabase
          .from("subscribers")
          .update({ email: lower })
          .eq("id", row.id);
        if (updErr) console.error(`     Erreur update: ${updErr.message}`);
        else updated++;
      } else {
        updated++;
      }
    }
  }

  console.log(`\n${DRY_RUN ? "[DRY-RUN] " : ""}Résultat :`);
  console.log(`  ✅ ${updated} email(s) normalisé(s)`);
  console.log(`  🗑  ${deleted} doublon(s) supprimé(s)`);
  console.log(`  ⏭  ${rows.length - toUpdate.length} email(s) déjà corrects`);
}

run();
