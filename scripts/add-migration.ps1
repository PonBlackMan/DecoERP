#!/usr/bin/env pwsh
# Usage: .\scripts\add-migration.ps1 -Name <MigrationName>
# Generates a new EF Core migration using the .NET 10 SDK Docker image,
# then writes the .cs file into the local Migrations folder.

param(
    [Parameter(Mandatory = $true)]
    [string]$Name
)

$repoRoot = Split-Path $PSScriptRoot -Parent
$backendPath = Join-Path $repoRoot "backend"
$migrationsPath = Join-Path $backendPath "src\DecoERP.Infrastructure\Persistence\Migrations"

Write-Host "Generating migration '$Name' via Docker..." -ForegroundColor Cyan

docker run --rm `
    -v "${repoRoot}:/repo" `
    -w /repo `
    mcr.microsoft.com/dotnet/sdk:10.0 `
    sh -c "dotnet tool install --global dotnet-ef && export PATH=`$PATH:/root/.dotnet/tools && dotnet ef migrations add $Name --project backend/src/DecoERP.Infrastructure/DecoERP.Infrastructure.csproj --startup-project backend/src/DecoERP.Api/DecoERP.Api.csproj --output-dir Persistence/Migrations"

if ($LASTEXITCODE -ne 0) {
    Write-Error "Migration generation failed."
    exit 1
}

Write-Host "Migration '$Name' created in $migrationsPath" -ForegroundColor Green
Write-Host "Remember to review the generated file before pushing." -ForegroundColor Yellow
