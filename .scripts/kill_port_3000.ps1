$port = 3000
$lines = netstat -ano | findstr ":$port"
if (-not $lines) {
  Write-Output "No process found on port $port"
  exit 0
}
$pids = $lines -split "`n" | ForEach-Object { $_.Trim() -replace '\s+',' ' } | ForEach-Object { ($_.Split(' '))[-1] } | Sort-Object -Unique
foreach ($kpid in $pids) {
  Write-Output "Killing PID $kpid"
  try {
    Stop-Process -Id $kpid -Force -ErrorAction Stop
  } catch {
    Start-Process -FilePath taskkill -ArgumentList "/PID $kpid /F" -NoNewWindow -Wait
  }
}
Write-Output "Done"
