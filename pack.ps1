# TL -> POJ Extension Packing Script
# Creates a clean 'extension.zip' ready for Chrome Web Store upload

$timestamp = Get-Date -Format "yyyyMMdd_HHmm"
$zipName = "packed/extension_$timestamp.zip"
$tempDir = "dist_temp"

# 1. Clean up previous build
if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }

# 2. Create temp directory
New-Item -ItemType Directory -Force -Path $tempDir | Out-Null

# 3. Define files to include (Allow-list approach for safety)
$files = @(
    "manifest.json",
    "background.js",
    "content_script.js",
    "converter.js",
    "pdf.min.js",
    "pdf.worker.min.js",
    "readability.js",
    "sidepanel.js",
    "turndown.js",
    "turndown-plugin-gfm.js",
    "ui_config.js",
    "sidepanel.html",
    "styles.css",
    "theme.css",
    "LICENSE",
    "README.md"
)

$folders = @(
    "icons",
    "fonts",
    "docs"
)

# 4. Copy Files
Write-Host "Copying files..." -ForegroundColor Cyan
foreach ($file in $files) {
    if (Test-Path $file) {
        Copy-Item $file -Destination $tempDir
    }
    else {
        Write-Warning "File not found: $file"
    }
}

# 5. Copy Folders
Write-Host "Copying folders..." -ForegroundColor Cyan
foreach ($folder in $folders) {
    if (Test-Path $folder) {
        Copy-Item $folder -Destination $tempDir -Recurse
    }
    else {
        Write-Warning "Folder not found: $folder"
    }
}

# 6. Create Zip
Write-Host "Zipping extension to $zipName..." -ForegroundColor Green
Compress-Archive -Path "$tempDir/*" -DestinationPath $zipName

# 7. Cleanup Temp
Remove-Item $tempDir -Recurse -Force

Write-Host "Done! Created $zipName" -ForegroundColor Green
Write-Host "You can now upload $zipName to the Chrome Web Store." -ForegroundColor Gray
