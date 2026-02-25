# run-verrif.ps1 — Verification complete autonome (mode nuit)
#
# USAGE :
#   .\run-verrif.ps1              → mode full (defaut)
#   .\run-verrif.ps1 -mode safe   → corrige seulement les critiques
#   .\run-verrif.ps1 -mode full   → corrige tout (critique > warning > suggestion)
#   .\run-verrif.ps1 -mode scan   → scan seul, aucune correction

param(
    [ValidateSet("safe", "full", "scan")]
    [string]$mode = "full"
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# --- Helpers UTF-8 ---
function Write-File {
    param($path, $content)
    [System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::UTF8)
}
function Append-File {
    param($path, $content)
    [System.IO.File]::AppendAllText($path, "$content`r`n", [System.Text.Encoding]::UTF8)
}

# --- Desactiver la mise en veille ---
powercfg /change standby-timeout-ac 0
powercfg /change monitor-timeout-ac 5
Write-Host "[NUIT] Mise en veille desactivee, ecran off dans 5min" -ForegroundColor Magenta

$timestamp = Get-Date -Format "yyyyMMdd-HHmm"
$verifDir = "docs/bmad/verrif/$timestamp"
mkdir -Force $verifDir | Out-Null
mkdir -Force "docs/bmad/git-history" | Out-Null

$statusFile = "$verifDir/STATUS.md"
$scoreFile = "docs/bmad/verrif/HEALTH.md"
$tempPrompt = "$env:TEMP\verrif-prompt-$timestamp.txt"

# ============================================================
# FONCTIONS UTILITAIRES
# ============================================================

function Write-Status {
    param($phase, $result)
    Append-File $statusFile "| $phase | $result | $(Get-Date -Format 'HH:mm:ss') |"
}

function Run-Passe {
    param($num, $name, $promptText, $tools)
    
    Write-Host "`n[$num] $name" -ForegroundColor Yellow
    
    try {
        Write-File $tempPrompt $promptText
        
        $toolArgs = $tools -split ' ' | ForEach-Object { "--allowedTools"; $_ }
        $output = & claude -p (Get-Content $tempPrompt -Raw -Encoding UTF8) @toolArgs 2>&1
        if ($LASTEXITCODE -ne 0) { throw "Exit code: $LASTEXITCODE" }
        Write-Host $output
        Write-Status "$num - $name" "OK"
        return $true
    }
    catch {
        Write-Host "[ERREUR] $num echouee: $_" -ForegroundColor Red
        Write-Status "$num - $name" "ECHEC - $_"
        return $false
    }
}

function Run-PasseFromFile {
    param($num, $name, $filePath, $tools)
    
    Write-Host "`n[$num] $name" -ForegroundColor Yellow
    
    if (-not (Test-Path $filePath)) {
        Write-Host "[ERREUR] Fichier introuvable: $filePath" -ForegroundColor Red
        Write-Status "$num - $name" "ECHEC - fichier introuvable"
        return $false
    }

    try {
        $promptContent = Get-Content $filePath -Raw -Encoding UTF8
        $promptContent = $promptContent -replace '\$timestamp', $timestamp
        Write-File $tempPrompt $promptContent
        
        $toolArgs = $tools -split ' ' | ForEach-Object { "--allowedTools"; $_ }
        $output = & claude -p (Get-Content $tempPrompt -Raw -Encoding UTF8) @toolArgs 2>&1
        if ($LASTEXITCODE -ne 0) { throw "Exit code: $LASTEXITCODE" }
        Write-Host $output
        Write-Status "$num - $name" "OK"
        return $true
    }
    catch {
        Write-Host "[ERREUR] $num echouee: $_" -ForegroundColor Red
        Write-Status "$num - $name" "ECHEC - $_"
        return $false
    }
}

function Run-QuickCheck {
    param($label)
    Write-Host "`n--- QUICK CHECK $label ---" -ForegroundColor Cyan

    $checkPrompt = "Lance npx tsc --noEmit et npm test dans mobile/. Si les deux passent sans erreur, reponds exactement CLEAN. Sinon reponds DIRTY suivi de la liste des erreurs. Rien d autre. Ne me pose aucune question."
    
    try {
        Write-File $tempPrompt $checkPrompt
        $output = & claude -p (Get-Content $tempPrompt -Raw -Encoding UTF8) --allowedTools "Bash(npx:*)" --allowedTools "Bash(npm:*)" --allowedTools "Read" 2>&1
        $outputStr = $output -join " "
        if ($outputStr -match "CLEAN") {
            Write-Host "[CHECK] CLEAN" -ForegroundColor Green
            Write-Status "CHECK $label" "CLEAN"
            return $true
        } else {
            Write-Host "[CHECK] DIRTY" -ForegroundColor Red
            Write-Status "CHECK $label" "DIRTY"
            return $false
        }
    }
    catch {
        Write-Host "[ERREUR] Quick check echoue: $_" -ForegroundColor Red
        Write-Status "CHECK $label" "ECHEC - $_"
        return $false
    }
}

function Run-FixLevel {
    param($level, $levelName, $description)

    Write-Host "`n========== FIX NIVEAU $level - $levelName ==========" -ForegroundColor Cyan

    $filesBefore = git diff --name-only 2>$null

    $cmdFix = @"
Relis tous les rapports dans docs/bmad/verrif/$timestamp/.
Corrige UNIQUEMENT les problemes de niveau $levelName : $description.
NE FAIS AUCUN COMMIT. Modifie les fichiers sans commiter.
Ne modifie PAS le comportement fonctionnel.
Si une correction est risquee, ne la fais pas et note pourquoi.
Sauvegarde le rapport dans docs/bmad/verrif/$timestamp/07-fix-niveau$level.md.
Ne me pose aucune question.
"@
    
    $fixOk = Run-Passe "FIX-N$level" $levelName $cmdFix '"Bash(mkdir:*)" "Bash(npx:*)" "Bash(npm:*)" "Write" "Read" "Edit"'
    
    if (-not $fixOk) {
        Write-Status "FIX-N$level" "ECHEC - pas de correction"
        return $false
    }

    $clean = Run-QuickCheck "apres niveau $level"
    
    if (-not $clean) {
        Write-Host "[ROLLBACK] Niveau $level a casse le build/tests, annulation..." -ForegroundColor Red
        
        $filesAfter = git diff --name-only 2>$null
        $newFiles = $filesAfter | Where-Object { $filesBefore -notcontains $_ }
        foreach ($f in $newFiles) {
            git checkout -- $f 2>$null
        }
        
        Write-Status "FIX-N$level" "ROLLBACK - corrections annulees"
        return $false
    }

    Write-Status "FIX-N$level" "OK - corrections appliquees"
    return $true
}

function Calculate-Score {
    Write-Host "`n========== SCORE DE SANTE ==========" -ForegroundColor Cyan

    $cmdScore = @"
Analyse l etat du projet et donne un score de sante sur 100.
Reponds UNIQUEMENT avec un JSON, rien d autre :
{"score": X, "build": X, "tests": X, "bugs": X, "qualite": X, "coverage": X}

Criteres (chaque sous-score sur 20) :
- build : 20 si tsc clean, 0 si erreurs
- tests : 20 si tous passent, -2 par test fail
- bugs : 20 si aucun bug silencieux, -3 par bug critique, -1 par warning
- qualite : 20 si pas de code mort/any/hardcoded, -1 par probleme
- coverage : 0 a 20 proportionnel au pourcentage de couverture (11% = 2, 50% = 10, 100% = 20)

Base-toi sur les rapports dans docs/bmad/verrif/$timestamp/. Ne me pose aucune question.
"@

    try {
        Write-File $tempPrompt $cmdScore
        $output = & claude -p (Get-Content $tempPrompt -Raw -Encoding UTF8) --allowedTools "Read" 2>&1
        $outputStr = ($output -join " ").Trim()
        
        if ($outputStr -match '\{[^}]+\}') {
            $json = $Matches[0]
            $scoreData = $json | ConvertFrom-Json
            $score = $scoreData.score

            Write-Host "[SCORE] Sante du projet : $score/100" -ForegroundColor $(if ($score -ge 80) {"Green"} elseif ($score -ge 50) {"Yellow"} else {"Red"})
            Write-Host "  Build: $($scoreData.build)/20 | Tests: $($scoreData.tests)/20 | Bugs: $($scoreData.bugs)/20 | Qualite: $($scoreData.qualite)/20 | Coverage: $($scoreData.coverage)/20"
            
            Write-Status "SCORE" "$score/100"

            $scoreEntry = "| $timestamp | $score | $($scoreData.build) | $($scoreData.tests) | $($scoreData.bugs) | $($scoreData.qualite) | $($scoreData.coverage) | $mode |"
            
            if (-not (Test-Path $scoreFile)) {
                $header = @"
# Historique de sante du projet Kore

| Run | Score | Build | Tests | Bugs | Qualite | Coverage | Mode |
|-----|-------|-------|-------|------|---------|----------|------|
"@
                Write-File $scoreFile $header
            }
            Append-File $scoreFile $scoreEntry
            
            return $score
        }
    }
    catch {
        Write-Host "[ERREUR] Calcul du score echoue: $_" -ForegroundColor Red
        Write-Status "SCORE" "ECHEC"
    }
    return -1
}

# ============================================================
# SCAN
# ============================================================

function Run-Scan {
    Write-Host "`n========== SCAN ==========" -ForegroundColor Cyan
    
    $scanTools = '"Bash(mkdir:*)" "Bash(npx:*)" "Bash(npm:*)" "Write" "Read"'
    $readTools = '"Write" "Read"'

    Run-PasseFromFile "SCAN-1" "Build et TypeScript" ".claude/commands/verrif-build.md" $scanTools | Out-Null
    Run-PasseFromFile "SCAN-2" "Tests" ".claude/commands/verrif-tests.md" $scanTools | Out-Null
    Run-PasseFromFile "SCAN-3" "Code Review" ".claude/commands/verrif-code-review.md" $readTools | Out-Null
    Run-PasseFromFile "SCAN-4" "Bugs silencieux" ".claude/commands/verrif-bugs.md" $readTools | Out-Null
    Run-PasseFromFile "SCAN-5" "Coherence WatermelonDB" ".claude/commands/verrif-db.md" $readTools | Out-Null
    Run-PasseFromFile "SCAN-6" "Code mort et qualite" ".claude/commands/verrif-qualite.md" $readTools | Out-Null
}

# ============================================================
# MAIN
# ============================================================

$statusHeader = @"
# Statut du run verrif $timestamp
# Mode : $mode

| Passe | Resultat | Heure |
|-------|----------|-------|
"@
Write-File $statusFile $statusHeader

Write-Host "[RUN] Verrif $timestamp - Mode $mode" -ForegroundColor Cyan

# --- SCAN ---
Run-Scan

# --- SCORE AVANT corrections ---
$scoreBefore = Calculate-Score

# --- MODE SCAN : on s'arrete la ---
if ($mode -eq "scan") {
    Append-File $statusFile "`n## RESULTAT : SCAN UNIQUEMENT (mode scan)`n## Score : $scoreBefore/100`nAucune correction appliquee."
    Remove-Item $tempPrompt -ErrorAction SilentlyContinue
    powercfg /change standby-timeout-ac 30
    powercfg /change monitor-timeout-ac 10
    Write-Host "`n[NUIT] Mise en veille reactivee (30min)" -ForegroundColor Magenta
    Write-Host "[OK] Scan termine. Score: $scoreBefore/100" -ForegroundColor Green
    exit 0
}

# --- CORRECTIONS PAR NIVEAU ---
Write-Host "`n========== CORRECTIONS PAR NIVEAU ==========" -ForegroundColor Cyan

$n1ok = Run-FixLevel 1 "CRITIQUES" "erreurs de build TypeScript, tests qui fail, bugs silencieux (mutations hors write, fuites memoire, async sans catch), incoherences WatermelonDB schema vs modeles"

$n2ok = $false
if ($mode -eq "full" -and $n1ok) {
    $n2ok = Run-FixLevel 2 "WARNINGS" "any TypeScript restants, console.log hors __DEV__, couleurs et valeurs hardcodees au lieu des tokens du theme, code mort (imports, fonctions, styles inutilises)"
} elseif ($mode -eq "safe") {
    Write-Host "`n[SKIP] Niveau 2 (mode safe)" -ForegroundColor DarkYellow
    Write-Status "FIX-N2" "SKIP - mode safe"
}

$n3ok = $false
if ($mode -eq "full" -and $n2ok) {
    $n3ok = Run-FixLevel 3 "SUGGESTIONS" "incoherences de nommage (camelCase/snake_case), code commente ou TODOs oublies, optimisations mineures de performance"
} elseif ($mode -eq "safe" -or -not $n2ok) {
    Write-Host "`n[SKIP] Niveau 3" -ForegroundColor DarkYellow
    Write-Status "FIX-N3" "SKIP"
}

# --- VERIFICATION FINALE ---
$finalClean = Run-QuickCheck "FINAL"

# --- SCORE APRES corrections ---
$scoreAfter = Calculate-Score

if ($finalClean) {
    Write-Host "`n[OK] Projet clean ! Commit et push..." -ForegroundColor Green

    $cmdPush = @"
Le code a ete verifie et corrige.
Commit et push :
1) git add UNIQUEMENT les fichiers corriges + les rapports dans docs/bmad/verrif/$timestamp/ + docs/bmad/git-history/
   NE FAIS JAMAIS git add . ou git add -A
   Ajoute chaque fichier individuellement avec git add [fichier]
2) Ne stage PAS node_modules, .env, builds, keystores, coverage
3) Verifie avec git diff --cached --name-only que seuls tes fichiers sont stages
4) Fais des commits atomiques par type : fix(scope) pour les bugs, refactor(scope) pour la qualite, chore(verrif) pour les rapports
5) git push origin (branche courante)
6) Si le push echoue (remote ahead) alors git pull --rebase puis re-push
7) Sauvegarde un rapport dans docs/bmad/git-history/$timestamp-verrif.md
Ne me pose aucune question.
"@

    Run-Passe "PUSH" "Git commit et push" $cmdPush '"Bash(mkdir:*)" "Bash(git:*)" "Bash(npx:*)" "Bash(npm:*)" "Write" "Read"' | Out-Null

    $niveaux = "N1"
    if ($n2ok) { $niveaux += " + N2" }
    if ($n3ok) { $niveaux += " + N3" }
    Append-File $statusFile "`n## RESULTAT : CLEAN ET PUSH`n## Score : $scoreBefore -> $scoreAfter / 100`n## Niveaux appliques : $niveaux`n`nCorrections verifiees (build + tests) puis commitees et pushees."
    Write-Host "[OK] Run termine. Score: $scoreBefore -> $scoreAfter/100" -ForegroundColor Green

} else {
    Write-Host "`n[STOP] Pas clean apres corrections. Annulation du code..." -ForegroundColor Red
    
    git checkout -- mobile/ 2>$null

    # --- Generer le plan d'action avec parallelisation ---
    Write-Host "`n========== PLAN D ACTION ==========" -ForegroundColor Cyan

    $cmdPlan = @"
Lis tous les rapports dans docs/bmad/verrif/$timestamp/.
Liste TOUS les problemes non corriges.
Pour chaque probleme, indique les fichiers concernes.
Puis analyse quels problemes peuvent etre corriges en parallele (pas les memes fichiers).

Reponds UNIQUEMENT avec ce format markdown, rien d autre :

### Problemes a corriger

| # | Probleme | Fichiers | Effort | Groupe |
|---|----------|----------|--------|--------|
| 1 | ... | ... | Xmin | A |
| 2 | ... | ... | Xmin | A |
| 3 | ... | ... | Xmin | B |

### Parallelisation

Les groupes avec la meme lettre touchent les memes fichiers : les lancer en SEQUENCE.
Les groupes avec des lettres differentes touchent des fichiers differents : les lancer en PARALLELE.

Exemple :
- Claude Code 1 : Groupe A (problemes 1, 2)
- Claude Code 2 : Groupe B (probleme 3)
- Claude Code 3 : Groupe C (problemes 4, 5)

Ne me pose aucune question.
"@

    Run-Passe "PLAN" "Plan d action" $cmdPlan '"Read"' | Out-Null

    # Lire le plan genere et l'ajouter au STATUS
    $planFile = "docs/bmad/verrif/$timestamp/08-plan-action.md"

    $n1s = if ($n1ok) { "OK" } else { "FAIL" }
    $n2s = if ($n2ok) { "OK" } else { "FAIL/SKIP" }
    $n3s = if ($n3ok) { "OK" } else { "FAIL/SKIP" }
    $dirtyResult = @"

## RESULTAT : PAS CLEAN - AUCUN COMMIT
## Score : $scoreBefore -> $scoreAfter / 100
## Niveaux tentes : N1 $n1s | N2 $n2s | N3 $n3s

Les corrections automatiques n ont pas suffi.
Le code a ete revert. Les rapports sont conserves.

### Action requise le matin :
1. /morning pour voir l etat
2. Lis le plan dans docs/bmad/verrif/$timestamp/08-plan-action.md
3. Lance les groupes en parallele avec /do [description] dans plusieurs Claude Code
4. /review pour verifier
5. /gitgo quand c est clean
"@
    Append-File $statusFile $dirtyResult
    Write-Host "[STOP] Aucun commit. Plan dans docs/bmad/verrif/$timestamp/08-plan-action.md" -ForegroundColor Red
}

# --- Cleanup ---
Remove-Item $tempPrompt -ErrorAction SilentlyContinue

# --- Reactiver la mise en veille ---
powercfg /change standby-timeout-ac 30
powercfg /change monitor-timeout-ac 10
Write-Host "`n[NUIT] Mise en veille reactivee (30min)" -ForegroundColor Magenta