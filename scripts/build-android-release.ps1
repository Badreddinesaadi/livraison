<#
.SYNOPSIS
  Builds a signed Android release APK for the SDK Wood Expo app.

.DESCRIPTION
  Regenerates the native Android project (unless -SkipPrebuild), restores the
  release signing configuration from credentials.json, builds app:assembleRelease
  with JDK 17 and copies the APK to builds/android/.

  The keystore is stored outside the generated android/ folder at
  credentials/android/keystore.jks so that `expo prebuild --clean` cannot
  delete it. On first run it is seeded from the path in credentials.json or
  from an existing keystore in android/app/.

.PARAMETER SkipPrebuild
  Reuse the current android/ folder instead of running expo prebuild --clean.
  Signing is still restored before building.

.PARAMETER ApiUrl
  Value for EXPO_PUBLIC_API_URL in this build. Overrides .env for this run only.

.PARAMETER Architectures
  Comma separated ABIs, e.g. "arm64-v8a". Defaults to reactNativeArchitectures
  from android/gradle.properties (all ABIs).

.PARAMETER OutputDirectory
  Where to copy the final APK, relative to the repository root.
  Defaults to builds/android.

.PARAMETER PrepareOnly
  Regenerate and configure the native project, then stop before Gradle runs.

.EXAMPLE
  .\scripts\build-android-release.ps1

.EXAMPLE
  .\scripts\build-android-release.ps1 -SkipPrebuild -Architectures "arm64-v8a"

.EXAMPLE
  .\scripts\build-android-release.ps1 -ApiUrl "https://api.example.com"
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory = $false)]
  [switch]$SkipPrebuild,

  [Parameter(Mandatory = $false)]
  [string]$ApiUrl,

  [Parameter(Mandatory = $false)]
  [string]$Architectures,

  [Parameter(Mandatory = $false)]
  [string]$OutputDirectory = "builds/android",

  [Parameter(Mandatory = $false)]
  [switch]$PrepareOnly
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($env:NODE_ENV)) {
  $env:NODE_ENV = "production"
  Write-Host "NODE_ENV not set; using production for this release build"
}

if ([string]::IsNullOrWhiteSpace($env:SENTRY_AUTH_TOKEN) -and [string]::IsNullOrWhiteSpace($env:SENTRY_DISABLE_AUTO_UPLOAD)) {
  $env:SENTRY_DISABLE_AUTO_UPLOAD = "true"
  Write-Host "SENTRY_AUTH_TOKEN not set; skipping Sentry source map upload"
}

$RepoRoot = (Resolve-Path -Path (Join-Path -Path $PSScriptRoot -ChildPath "..")).Path
$CredentialsPath = Join-Path -Path $RepoRoot -ChildPath "credentials.json"
$AndroidDir = Join-Path -Path $RepoRoot -ChildPath "android"
$GradlePropertiesPath = Join-Path -Path $AndroidDir -ChildPath "gradle.properties"
$BuildGradlePath = Join-Path -Path $AndroidDir -ChildPath "app/build.gradle"
$StoreFileName = "keystore.jks"

function Ensure-FileExists {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Path,
    [Parameter(Mandatory = $true)]
    [string]$Description
  )

  if (-not (Test-Path -Path $Path -PathType Leaf)) {
    throw "$Description not found at: $Path"
  }
}

function Read-Credentials {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Path
  )

  Ensure-FileExists -Path $Path -Description "Android credentials file"

  try {
    $credentials = Get-Content -Path $Path -Raw | ConvertFrom-Json
  }
  catch {
    throw "Could not parse ${Path} as JSON: $($_.Exception.Message)"
  }

  if ($null -eq $credentials.android -or $null -eq $credentials.android.keystore) {
    throw "credentials.json is missing the android.keystore section."
  }

  $keystore = $credentials.android.keystore
  foreach ($required in @("keystorePassword", "keyAlias", "keyPassword")) {
    if ([string]::IsNullOrWhiteSpace($keystore.$required)) {
      throw "credentials.json is missing android.keystore.$required"
    }
  }

  $keystorePath = $keystore.keystorePath
  if ([string]::IsNullOrWhiteSpace($keystorePath)) {
    $keystorePath = "credentials/android/keystore.jks"
  }
  if (-not [System.IO.Path]::IsPathRooted($keystorePath)) {
    $keystorePath = Join-Path -Path $RepoRoot -ChildPath $keystorePath
  }

  return [pscustomobject]@{
    KeystorePath = [System.IO.Path]::GetFullPath($keystorePath)
    Password     = $keystore.keystorePassword
    KeyAlias     = $keystore.keyAlias
    KeyPassword  = $keystore.keyPassword
  }
}

function Resolve-ReleaseKeystore {
  param(
    [Parameter(Mandatory = $true)]
    [pscustomobject]$Credentials
  )

  $targetPath = $Credentials.KeystorePath

  if (Test-Path -Path $targetPath -PathType Leaf) {
    return $targetPath
  }

  $candidates = @()
  $appDir = Join-Path -Path $AndroidDir -ChildPath "app"
  if (Test-Path -Path $appDir -PathType Container) {
    $candidates = @(Get-ChildItem -Path $appDir -Filter "*.jks" -File -ErrorAction SilentlyContinue |
      Where-Object { $_.Name -ne "debug.keystore" })
  }

  if ($candidates.Count -eq 0) {
    throw "Release keystore not found. Expected it at: $targetPath`nPlace the release keystore there (it is gitignored) and run the script again."
  }

  if ($candidates.Count -gt 1) {
    $names = ($candidates | ForEach-Object { $_.Name }) -join ", "
    throw "More than one candidate release keystore found in ${appDir}: $names`nSet android.keystore.keystorePath in credentials.json to the correct file."
  }

  $parent = Split-Path -Path $targetPath -Parent
  if (-not (Test-Path -Path $parent -PathType Container)) {
    New-Item -Path $parent -ItemType Directory -Force | Out-Null
  }

  Copy-Item -Path $candidates[0].FullName -Destination $targetPath -Force
  Write-Host "Seeded release keystore at $targetPath from $($candidates[0].FullName)"
  return $targetPath
}

function Set-GradleProperties {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Path,
    [Parameter(Mandatory = $true)]
    [System.Collections.IDictionary]$Values
  )

  Ensure-FileExists -Path $Path -Description "Android gradle.properties"

  $targetLines = @(Get-Content -Path $Path)
  $filteredLines = New-Object System.Collections.Generic.List[string]

  foreach ($line in $targetLines) {
    $dropLine = $false
    if ($line -match "^\s*([A-Za-z0-9_.-]+)\s*=") {
      if ($Values.Contains($Matches[1])) {
        $dropLine = $true
      }
    }

    if (-not $dropLine) {
      [void]$filteredLines.Add($line)
    }
  }

  while ($filteredLines.Count -gt 0 -and [string]::IsNullOrWhiteSpace($filteredLines[$filteredLines.Count - 1])) {
    $filteredLines.RemoveAt($filteredLines.Count - 1)
  }

  $newLines = New-Object System.Collections.Generic.List[string]
  foreach ($line in $filteredLines) {
    [void]$newLines.Add($line)
  }
  if ($newLines.Count -gt 0) {
    [void]$newLines.Add("")
  }
  foreach ($key in $Values.Keys) {
    [void]$newLines.Add("$key=$($Values[$key])")
  }

  $newContent = ($newLines -join "`n").TrimEnd() + "`n"
  Set-Content -Path $Path -Value $newContent -Encoding utf8NoBOM
}

function Get-GradleBlock {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Content,
    [Parameter(Mandatory = $true)]
    [string]$BlockName
  )

  $startMatch = [regex]::Match($Content, "$([regex]::Escape($BlockName))\s*\{")
  if (-not $startMatch.Success) {
    return $null
  }

  $braceStartIndex = $Content.IndexOf('{', $startMatch.Index)
  if ($braceStartIndex -lt 0) {
    return $null
  }

  $depth = 0
  for ($i = $braceStartIndex; $i -lt $Content.Length; $i++) {
    $char = $Content[$i]
    if ($char -eq '{') {
      $depth++
    }
    elseif ($char -eq '}') {
      $depth--
      if ($depth -eq 0) {
        $text = $Content.Substring($startMatch.Index, $i - $startMatch.Index + 1)
        return [pscustomobject]@{
          StartIndex = $startMatch.Index
          EndIndex   = $i
          Text       = $text
        }
      }
    }
  }

  return $null
}

function Ensure-ReleaseSigningSections {
  param(
    [Parameter(Mandatory = $true)]
    [string]$BuildGradlePath
  )

  $content = Get-Content -Path $BuildGradlePath -Raw
  $updated = $false

  $releaseSigningConfigBlock = @"
        release {
            if (project.hasProperty('MYAPP_UPLOAD_STORE_FILE')) {
                storeFile file(MYAPP_UPLOAD_STORE_FILE)
                storePassword MYAPP_UPLOAD_STORE_PASSWORD
                keyAlias MYAPP_UPLOAD_KEY_ALIAS
                keyPassword MYAPP_UPLOAD_KEY_PASSWORD
            }
        }
"@

  $signingConfigsBlock = Get-GradleBlock -Content $content -BlockName "signingConfigs"
  if ($null -eq $signingConfigsBlock) {
    throw "Could not find signingConfigs block in $BuildGradlePath"
  }

  if ($signingConfigsBlock.Text -notmatch "MYAPP_UPLOAD_STORE_FILE") {
    $insertIndex = $signingConfigsBlock.Text.LastIndexOf("}")
    if ($insertIndex -lt 0) {
      throw "Could not determine insertion point in signingConfigs block for $BuildGradlePath"
    }

    $updatedSigningConfigsBlock = $signingConfigsBlock.Text.Insert($insertIndex, "`n$releaseSigningConfigBlock")

    if ($updatedSigningConfigsBlock -eq $signingConfigsBlock.Text) {
      throw "Could not add signingConfigs.release block in $BuildGradlePath"
    }

    $content = $content.Substring(0, $signingConfigsBlock.StartIndex) + $updatedSigningConfigsBlock + $content.Substring($signingConfigsBlock.EndIndex + 1)
    $updated = $true
  }

  $buildTypesBlock = Get-GradleBlock -Content $content -BlockName "buildTypes"
  if ($null -eq $buildTypesBlock) {
    throw "Could not find buildTypes block in $BuildGradlePath"
  }

  if ($buildTypesBlock.Text -notmatch '(?s)release\s*\{[\s\S]*?signingConfig\s+signingConfigs\.release') {
    $updatedBuildTypesBlock = [regex]::Replace(
      $buildTypesBlock.Text,
      '(?s)(release\s*\{[\s\S]*?signingConfig\s+)signingConfigs\.debug',
      '$1signingConfigs.release',
      1
    )

    if ($updatedBuildTypesBlock -eq $buildTypesBlock.Text) {
      $updatedBuildTypesBlock = [regex]::Replace(
        $buildTypesBlock.Text,
        '(?s)(release\s*\{)',
        "$1`n            signingConfig signingConfigs.release",
        1
      )
    }

    if ($updatedBuildTypesBlock -eq $buildTypesBlock.Text) {
      throw "Could not enforce buildTypes.release signingConfig line in $BuildGradlePath"
    }

    $content = $content.Substring(0, $buildTypesBlock.StartIndex) + $updatedBuildTypesBlock + $content.Substring($buildTypesBlock.EndIndex + 1)
    $updated = $true
  }

  $requiredTokens = @(
    "MYAPP_UPLOAD_STORE_FILE",
    "storeFile file(MYAPP_UPLOAD_STORE_FILE)",
    "storePassword MYAPP_UPLOAD_STORE_PASSWORD",
    "keyAlias MYAPP_UPLOAD_KEY_ALIAS",
    "keyPassword MYAPP_UPLOAD_KEY_PASSWORD",
    "signingConfig signingConfigs.release"
  )

  foreach ($token in $requiredTokens) {
    if ($content -notmatch [regex]::Escape($token)) {
      throw "Required release signing token is missing in ${BuildGradlePath}: $token"
    }
  }

  if ($content -notmatch '(?s)release\s*\{[\s\S]*?signingConfig\s+signingConfigs\.release') {
    throw "Required buildTypes.release signingConfig line is missing in $BuildGradlePath"
  }

  if ($updated) {
    Set-Content -Path $BuildGradlePath -Value $content -Encoding utf8NoBOM
    Write-Host "Patched release signing configuration in $BuildGradlePath"
  }
}

function Get-JavaMajorVersion {
  param(
    [Parameter(Mandatory = $true)]
    [string]$JavaHome
  )

  $javaExe = Join-Path -Path $JavaHome -ChildPath "bin/java.exe"
  if (-not (Test-Path -Path $javaExe -PathType Leaf)) {
    return $null
  }

  $versionOutput = & $javaExe -version 2>&1 | Out-String
  $match = [regex]::Match($versionOutput, 'version "(?:1\.)?(\d+)')
  if ($match.Success) {
    return [int]$match.Groups[1].Value
  }

  return $null
}

function Resolve-Jdk17 {
  $candidates = New-Object System.Collections.Generic.List[string]

  if (-not [string]::IsNullOrWhiteSpace($env:JAVA_HOME)) {
    $candidates.Add($env:JAVA_HOME)
  }

  foreach ($jabbaRoot in @((Join-Path -Path $HOME -ChildPath ".jabba/jdk"), (Join-Path -Path $env:USERPROFILE -ChildPath ".jabba/jdk"))) {
    if (Test-Path -Path $jabbaRoot -PathType Container) {
      Get-ChildItem -Path $jabbaRoot -Directory -ErrorAction SilentlyContinue |
        Where-Object { $_.Name -match '17' } |
        Sort-Object -Property Name -Descending |
        ForEach-Object { $candidates.Add($_.FullName) }
    }
  }

  foreach ($root in @(
      (Join-Path -Path $env:LOCALAPPDATA -ChildPath "Programs/Eclipse Adoptium"),
      "C:\Program Files\Eclipse Adoptium",
      "C:\Program Files\Java",
      "C:\Program Files\Microsoft",
      "C:\Program Files\Android\Android Studio\jbr"
    )) {
    if (Test-Path -Path $root -PathType Container) {
      if (Test-Path -Path (Join-Path -Path $root -ChildPath "bin/java.exe") -PathType Leaf) {
        $candidates.Add($root)
        continue
      }

      Get-ChildItem -Path $root -Directory -ErrorAction SilentlyContinue |
        Where-Object { $_.Name -match 'jdk|jbr' } |
        Sort-Object -Property Name -Descending |
        ForEach-Object { $candidates.Add($_.FullName) }
    }
  }

  foreach ($candidate in ($candidates | Select-Object -Unique)) {
    $major = Get-JavaMajorVersion -JavaHome $candidate
    if ($null -ne $major -and $major -ge 17) {
      return [pscustomobject]@{
        JavaHome = $candidate
        Major    = $major
      }
    }
  }

  $jabbaCommand = Get-Command -Name "jabba" -ErrorAction SilentlyContinue
  if ($null -ne $jabbaCommand) {
    Write-Host "Selecting JDK with jabba use openjdk@1.17.0"
    & jabba use openjdk@1.17.0
    if ($LASTEXITCODE -eq 0) {
      $jabbaHome = Join-Path -Path $HOME -ChildPath ".jabba/jdk/openjdk@1.17.0"
      if (Test-Path -Path (Join-Path -Path $jabbaHome -ChildPath "bin/java.exe") -PathType Leaf) {
        return [pscustomobject]@{
          JavaHome = $jabbaHome
          Major    = 17
        }
      }
    }
  }

  throw "No JDK 17 or newer found. Install JDK 17 (https://adoptium.net) or point JAVA_HOME at one, then run the script again."
}

function Use-Jdk {
  param(
    [Parameter(Mandatory = $true)]
    [pscustomobject]$Jdk
  )

  $env:JAVA_HOME = $Jdk.JavaHome
  $javaBin = Join-Path -Path $Jdk.JavaHome -ChildPath "bin"
  $pathEntries = $env:PATH -split ";"
  if ($pathEntries -notcontains $javaBin) {
    $env:PATH = "$javaBin;$env:PATH"
  }

  Write-Host "Using JDK $($Jdk.Major) at $($Jdk.JavaHome)"
}

$Credentials = Read-Credentials -Path $CredentialsPath
$KeystoreSourcePath = Resolve-ReleaseKeystore -Credentials $Credentials

if (-not [string]::IsNullOrWhiteSpace($ApiUrl)) {
  if ($ApiUrl -notmatch '^https?://') {
    throw "ApiUrl must start with http:// or https:// (got: $ApiUrl)"
  }
  $env:EXPO_PUBLIC_API_URL = $ApiUrl
  Write-Host "Using EXPO_PUBLIC_API_URL=$ApiUrl for this build"
}

if ($SkipPrebuild) {
  Write-Host "Skipping prebuild step (SkipPrebuild)"
}
else {
  Write-Host "Running expo prebuild --clean --platform android in $RepoRoot"
  Push-Location -Path $RepoRoot
  try {
    & npx expo prebuild --clean --platform android
    if ($LASTEXITCODE -ne 0) {
      throw "expo prebuild failed with exit code $LASTEXITCODE"
    }
  }
  finally {
    Pop-Location
  }
}

Ensure-FileExists -Path $GradlePropertiesPath -Description "Android gradle.properties"
Ensure-FileExists -Path $BuildGradlePath -Description "Android app build.gradle"

$signingProperties = [ordered]@{
  "MYAPP_UPLOAD_STORE_FILE"     = $StoreFileName
  "MYAPP_UPLOAD_STORE_PASSWORD" = $Credentials.Password
  "MYAPP_UPLOAD_KEY_ALIAS"      = $Credentials.KeyAlias
  "MYAPP_UPLOAD_KEY_PASSWORD"   = $Credentials.KeyPassword
}

Write-Host "Writing release signing properties into $GradlePropertiesPath"
Set-GradleProperties -Path $GradlePropertiesPath -Values $signingProperties

Write-Host "Ensuring release signing blocks in $BuildGradlePath"
Ensure-ReleaseSigningSections -BuildGradlePath $BuildGradlePath

$TargetKeystorePath = Join-Path -Path (Join-Path -Path $AndroidDir -ChildPath "app") -ChildPath $StoreFileName
Write-Host "Copying keystore to $TargetKeystorePath"
Copy-Item -Path $KeystoreSourcePath -Destination $TargetKeystorePath -Force

if ($PrepareOnly) {
  Write-Host "PrepareOnly set — stopping before Gradle build." -ForegroundColor Yellow
  return
}

$autolinkingPath = Join-Path -Path $AndroidDir -ChildPath "build/generated/autolinking/autolinking.json"
if (Test-Path -Path $autolinkingPath -PathType Leaf) {
  try {
    $autolinking = Get-Content -Path $autolinkingPath -Raw | ConvertFrom-Json
    if ($autolinking.root -and $autolinking.root -ne $RepoRoot) {
      Write-Warning "Removing stale autolinking cache generated for $($autolinking.root)"
      Remove-Item -Path (Split-Path -Path $autolinkingPath -Parent) -Recurse -Force
    }
  }
  catch {
    Write-Warning "Could not inspect ${autolinkingPath}: $($_.Exception.Message)"
  }
}

$Jdk = Resolve-Jdk17
Use-Jdk -Jdk $Jdk

$buildStartTime = Get-Date

Push-Location -Path $AndroidDir
try {
  $gradlew = $null
  if (Test-Path -Path ".\gradlew.bat" -PathType Leaf) {
    $gradlew = ".\gradlew.bat"
  }
  elseif (Test-Path -Path ".\gradlew" -PathType Leaf) {
    $gradlew = ".\gradlew"
  }
  else {
    throw "Gradle wrapper was not found in $AndroidDir"
  }

  $gradleArgs = @("app:assembleRelease")
  if (-not [string]::IsNullOrWhiteSpace($Architectures)) {
    $gradleArgs += "-PreactNativeArchitectures=$Architectures"
  }

  Write-Host "Running $gradlew $($gradleArgs -join ' ')"
  & $gradlew @gradleArgs

  if ($LASTEXITCODE -ne 0) {
    throw "Gradle release build failed with exit code $LASTEXITCODE"
  }
}
finally {
  Pop-Location
}

$releaseApkPath = Join-Path -Path $AndroidDir -ChildPath "app/build/outputs/apk/release/app-release.apk"
Ensure-FileExists -Path $releaseApkPath -Description "Release APK"

$apkFile = Get-Item -Path $releaseApkPath
if ($apkFile.LastWriteTime -lt $buildStartTime.AddSeconds(-1)) {
  Write-Warning "Release APK was not rewritten by this build (last write: $($apkFile.LastWriteTime)). Gradle reported success, so the existing APK is up to date."
}

$versionName = "1.0.0"
$versionCode = "1"
$metadataPath = Join-Path -Path (Split-Path -Path $releaseApkPath -Parent) -ChildPath "output-metadata.json"
if (Test-Path -Path $metadataPath -PathType Leaf) {
  try {
    $metadata = Get-Content -Path $metadataPath -Raw | ConvertFrom-Json
    if ($metadata.elements -and $metadata.elements.Count -gt 0) {
      $versionName = $metadata.elements[0].versionName
      $versionCode = $metadata.elements[0].versionCode
    }
  }
  catch {
    Write-Warning "Could not read version info from ${metadataPath}: $($_.Exception.Message)"
  }
}

$outputRoot = $OutputDirectory
if (-not [System.IO.Path]::IsPathRooted($outputRoot)) {
  $outputRoot = Join-Path -Path $RepoRoot -ChildPath $outputRoot
}
if (-not (Test-Path -Path $outputRoot -PathType Container)) {
  New-Item -Path $outputRoot -ItemType Directory -Force | Out-Null
}

$outputPath = Join-Path -Path $outputRoot -ChildPath "SDKWood-$versionName-$versionCode.apk"
Copy-Item -Path $releaseApkPath -Destination $outputPath -Force

$sizeMb = [math]::Round((Get-Item -Path $outputPath).Length / 1MB, 1)

Write-Host ""
Write-Host "Release APK build completed successfully" -ForegroundColor Green
Write-Host "  Application : SDK Wood (com.anubus298.SDKWood)"
Write-Host "  Version     : $versionName ($versionCode)"
Write-Host "  Signed with : $($Credentials.KeyAlias)"
Write-Host "  APK         : $outputPath"
Write-Host "  Size        : $sizeMb MB"
