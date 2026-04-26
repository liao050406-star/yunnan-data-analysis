const { execFileSync } = require('node:child_process');
const path = require('node:path');

const cwd = process.cwd();
const workspaceName = path.basename(cwd);

if (process.platform !== 'win32') {
  console.log('dev:reset currently cleans Windows dev processes only. Start with npm run dev.');
  process.exit(0);
}

const ps = `
$ErrorActionPreference = 'SilentlyContinue'
$cwd = ${JSON.stringify(cwd)}
$workspaceName = ${JSON.stringify(workspaceName)}
$selfPid = ${process.pid}
$ports = @(3000, 3001, 3002)
$pids = New-Object System.Collections.Generic.HashSet[int]

Get-CimInstance Win32_Process -Filter "name = 'node.exe'" |
  Where-Object {
    $_.ProcessId -ne $selfPid -and (
      $_.CommandLine -like "*$cwd*" -or
      $_.CommandLine -like "*$workspaceName*"
    )
  } |
  ForEach-Object { [void]$pids.Add([int]$_.ProcessId) }

Get-NetTCPConnection -LocalPort $ports -State Listen |
  ForEach-Object {
    $proc = Get-CimInstance Win32_Process -Filter "ProcessId = $($_.OwningProcess)"
    if ($proc -and ($proc.CommandLine -like "*$cwd*" -or $proc.CommandLine -like "*$workspaceName*")) {
      [void]$pids.Add([int]$_.OwningProcess)
    }
  }

if ($pids.Count -eq 0) {
  Write-Host "No existing project dev processes found on ports 3000/3001/3002."
  exit 0
}

foreach ($pid in $pids) {
  Write-Host "Stopping project dev process $pid"
  Stop-Process -Id $pid -Force
}
Start-Sleep -Seconds 1
`;

execFileSync('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', ps], {
  stdio: 'inherit',
});
