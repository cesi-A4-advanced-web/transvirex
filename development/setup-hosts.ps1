# Run as Administrator to add local development hosts entries
# Usage: .\development\setup-hosts.ps1

$hostsFile = "C:\Windows\System32\drivers\etc\hosts"

$entries = @(
    "127.0.0.1   transvirex.local",
    "127.0.0.1   www.transvirex.local",
    "127.0.0.1   rabbitmq.transvirex.local",
    "127.0.0.1   pgadmin.transvirex.local",
    "127.0.0.1   redis.transvirex.local"
)

if (-not ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Start-Process powershell "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`"" -Verb RunAs
    exit
}

$managedDomains = $entries | ForEach-Object { ($_ -split "\s+")[1] }

# Supprimer toutes les lignes qui concernent nos domaines (nettoie les doublons)
$lines = Get-Content $hostsFile
$cleaned = $lines | Where-Object {
    $line = $_.Trim()
    $isManaged = $false
    foreach ($domain in $managedDomains) {
        if ($line -match [regex]::Escape($domain)) {
            $isManaged = $true
            break
        }
    }
    -not $isManaged
}

# Réécrire le fichier proprement + ajouter toutes les entrées
($cleaned + $entries) | Set-Content -Path $hostsFile -Encoding ASCII

Write-Host "Hosts file updated (doublons supprimés) :"
foreach ($entry in $entries) {
    Write-Host "  $entry"
}
Write-Host "`nAccès disponibles :"
Write-Host "  http://transvirex.local"
Write-Host "  http://pgadmin.transvirex.local"
Write-Host "  http://rabbitmq.transvirex.local"
Write-Host "  http://redis.transvirex.local"
