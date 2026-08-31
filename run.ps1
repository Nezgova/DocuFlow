<#!
  Starts the API and web client in separate PowerShell processes.
  Prerequisites: MySQL running with a `docuflow` database, Java 21, Maven, and Node.js.
  Configure backend environment values in your terminal before running this script.
#>
$projectRoot = $PSScriptRoot
if (-not (Get-Command java -ErrorAction SilentlyContinue)) { throw 'Java 21 was not found on PATH.' }
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) { throw 'Node.js/npm was not found on PATH.' }
$maven = Get-Command mvn -ErrorAction SilentlyContinue
if (-not $maven) {
  $ideaMaven = 'C:\Program Files\JetBrains\IntelliJ IDEA 2024.3.4\plugins\maven\lib\maven3\bin\mvn.cmd'
  if (Test-Path $ideaMaven) { $mavenPath = $ideaMaven } else { throw 'Maven was not found. Install Maven or add mvn to PATH.' }
} else { $mavenPath = $maven.Source }
$javaPath = (Get-Command java).Source
$env:JAVA_HOME = Split-Path (Split-Path $javaPath -Parent) -Parent

if (-not $env:DB_PASSWORD) { Write-Warning 'DB_PASSWORD is not set. Set it before starting if MySQL requires one.' }
if (-not $env:JWT_SECRET) { $env:JWT_SECRET = 'development-secret-development-secret-32'; Write-Warning 'Using the development JWT secret. Set JWT_SECRET for any shared environment.' }

Start-Process powershell -ArgumentList '-NoExit','-Command', "`$env:JAVA_HOME='$env:JAVA_HOME'; Set-Location '$projectRoot\backend'; & '$mavenPath' spring-boot:run"
Start-Process powershell -ArgumentList '-NoExit','-Command', "Set-Location '$projectRoot\frontend'; if (!(Test-Path node_modules)) { npm install }; npm run dev"
Write-Host 'Starting DocuFlow API at http://localhost:8080/api and web app at http://localhost:5173'
