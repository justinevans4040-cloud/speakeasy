param(
  [Parameter(Mandatory = $false)]
  [string]$BuildDirectory = "./electron/build"
)

$ErrorActionPreference = "Stop"
$expectedName = "ForgeFrontSystems.SpeakEasybyForgeFront"
$expectedPublisher = "CN=8E906094-1F36-496B-A889-858E25A1FCB3"
$expectedPublisherDisplayName = "ForgeFront Systems"

$packages = @(Get-ChildItem -Path $BuildDirectory -Filter "*.appx" -File)
if ($packages.Count -ne 1) {
  throw "Expected exactly one AppX package in '$BuildDirectory'; found $($packages.Count)."
}

$package = $packages[0]
$inspectionRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("speakeasy-appx-" + [guid]::NewGuid().ToString("N"))
$zipPath = Join-Path $inspectionRoot "package.zip"
$expandedPath = Join-Path $inspectionRoot "expanded"

try {
  New-Item -ItemType Directory -Path $inspectionRoot | Out-Null
  Copy-Item -LiteralPath $package.FullName -Destination $zipPath
  Expand-Archive -LiteralPath $zipPath -DestinationPath $expandedPath

  $manifestPath = Join-Path $expandedPath "AppxManifest.xml"
  if (-not (Test-Path -LiteralPath $manifestPath)) {
    throw "AppxManifest.xml is missing from the package."
  }

  [xml]$manifest = Get-Content -LiteralPath $manifestPath -Raw
  $identity = $manifest.Package.Identity
  $properties = $manifest.Package.Properties

  if ($identity.Name -ne $expectedName) {
    throw "Package identity Name mismatch. Expected '$expectedName'; found '$($identity.Name)'."
  }
  if ($identity.Publisher -ne $expectedPublisher) {
    throw "Package identity Publisher mismatch. Expected '$expectedPublisher'; found '$($identity.Publisher)'."
  }
  if ($properties.PublisherDisplayName -ne $expectedPublisherDisplayName) {
    throw "PublisherDisplayName mismatch. Expected '$expectedPublisherDisplayName'; found '$($properties.PublisherDisplayName)'."
  }

  $hash = Get-FileHash -LiteralPath $package.FullName -Algorithm SHA256
  $checksumPath = "$($package.FullName).sha256"
  "$($hash.Hash)  $($package.Name)" | Set-Content -LiteralPath $checksumPath -Encoding ascii

  Write-Host "Verified Microsoft Store package identity."
  Write-Host "Package: $($package.Name)"
  Write-Host "Version: $($identity.Version)"
  Write-Host "SHA-256: $($hash.Hash)"
}
finally {
  if (Test-Path -LiteralPath $inspectionRoot) {
    Remove-Item -LiteralPath $inspectionRoot -Recurse -Force
  }
}
