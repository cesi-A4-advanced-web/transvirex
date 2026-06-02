# Run as Administrator to add local development hosts entries
# Usage: .\development\setup-hosts.ps1

$hostsFile = "C:\Windows\System32\drivers\etc\hosts"

$entries = @(
    "127.0.0.1   transvirex.local",
    "127.0.0.1   www.transvirex.local",
    "127.0.0.1   rabbitmq.transvirex.local"
)

if (-not ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Start-Process powershell "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`"" -Verb RunAs
    exit
}

$current = Get-Content $hostsFile

$added = 0
foreach ($entry in $entries) {
    $domain = ($entry -split "\s+")[1]
    if ($current -notmatch [regex]::Escape($domain)) {
        Add-Content -Path $hostsFile -Value $entry
        Write-Host "Added: $entry"
        $added++
    } else {
        Write-Host "Already exists: $domain"
    }
}

if ($added -gt 0) {
    Write-Host "`n$added entry/entries added. You can now access http://transvirex.local"
} else {
    Write-Host "`nAll entries already present. Nothing to do."
}
