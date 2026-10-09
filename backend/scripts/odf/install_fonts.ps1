# Installs, for the current Windows user only (no admin rights needed), the
# fonts used by the ODF Word documents so that Word renders them as designed
# when prepare_odf_books.py exports them to PDF:
#   - Cairo        (page de garde)  — static v2.010 instances, Word handles
#                                     static families better than the variable font
#   - Amiri        (corps arabe)
#   - EB Garamond  (corps français)
# All three are under the SIL Open Font License. "Traditional Arabic" is a
# Windows optional font (admin only); prepare_odf_books.py maps it to Amiri.
#
# Usage: powershell -ExecutionPolicy Bypass -File install_fonts.ps1
# Word must be restarted afterwards.

$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$cairo = 'https://raw.githubusercontent.com/google/fonts/e77afb398e8fcccc0d4531600b1bd8a201bbb232/ofl/cairo'
$amiri = 'https://raw.githubusercontent.com/google/fonts/main/ofl/amiri'
$garamond = 'https://raw.githubusercontent.com/octaviopardo/EBGaramond12/master/fonts/ttf'

$fonts = @(
  "$cairo/Cairo-ExtraLight.ttf", "$cairo/Cairo-Light.ttf", "$cairo/Cairo-Regular.ttf",
  "$cairo/Cairo-SemiBold.ttf", "$cairo/Cairo-Bold.ttf", "$cairo/Cairo-Black.ttf",
  "$amiri/Amiri-Regular.ttf", "$amiri/Amiri-Bold.ttf", "$amiri/Amiri-Italic.ttf", "$amiri/Amiri-BoldItalic.ttf",
  "$garamond/EBGaramond-Regular.ttf", "$garamond/EBGaramond-Italic.ttf",
  "$garamond/EBGaramond-Medium.ttf", "$garamond/EBGaramond-MediumItalic.ttf",
  "$garamond/EBGaramond-SemiBold.ttf", "$garamond/EBGaramond-SemiBoldItalic.ttf",
  "$garamond/EBGaramond-Bold.ttf", "$garamond/EBGaramond-BoldItalic.ttf"
)

$cache = Join-Path $env:LOCALAPPDATA 'odfw\fonts'
$userFonts = Join-Path $env:LOCALAPPDATA 'Microsoft\Windows\Fonts'
$regKey = 'HKCU:\Software\Microsoft\Windows NT\CurrentVersion\Fonts'
New-Item -ItemType Directory -Force -Path $cache, $userFonts | Out-Null
if (-not (Test-Path $regKey)) { New-Item -Path $regKey -Force | Out-Null }

$installed = 0
foreach ($url in $fonts) {
  $name = [IO.Path]::GetFileName($url)
  $cached = Join-Path $cache $name
  if (-not (Test-Path $cached) -or (Get-Item $cached).Length -lt 10000) {
    Invoke-WebRequest -Uri $url -OutFile "$cached.part" -UseBasicParsing
    Move-Item -Force "$cached.part" $cached
  }
  $target = Join-Path $userFonts $name
  if (-not (Test-Path $target)) { Copy-Item $cached $target }
  $valueName = ([IO.Path]::GetFileNameWithoutExtension($name)) + ' (TrueType)'
  Set-ItemProperty -Path $regKey -Name $valueName -Value $target
  $installed++
}

# Tell running applications that the font table changed.
Add-Type -Namespace OdfFonts -Name Native -MemberDefinition @'
[DllImport("user32.dll", SetLastError = true)]
public static extern System.IntPtr SendMessageTimeout(System.IntPtr hWnd, uint Msg, System.UIntPtr wParam, System.IntPtr lParam, uint fuFlags, uint uTimeout, out System.UIntPtr lpdwResult);
'@
$result = [UIntPtr]::Zero
[OdfFonts.Native]::SendMessageTimeout([IntPtr]0xffff, 0x001D, [UIntPtr]::Zero, [IntPtr]::Zero, 2, 1000, [ref]$result) | Out-Null

Write-Output "$installed polices installees dans $userFonts"
