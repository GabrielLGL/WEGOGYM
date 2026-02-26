Set-Location 'C:\Users\gabri\Desktop\kore-app\mobile'

Write-Host "=== TSC ==="
$tscOut = & npx tsc --noEmit 2>&1
$tscExit = $LASTEXITCODE
foreach ($line in ($tscOut | Select-Object -Last 60)) { Write-Host $line }
Write-Host "TSC_EXIT=$tscExit"

Write-Host "=== TESTS WorkoutExerciseCard|SessionExerciseItem ==="
$testOut = & npm test -- --testPathPattern="WorkoutExerciseCard|SessionExerciseItem" --no-coverage --forceExit 2>&1
$testExit = $LASTEXITCODE
foreach ($line in $testOut) { Write-Host $line }
Write-Host "TEST_EXIT=$testExit"
