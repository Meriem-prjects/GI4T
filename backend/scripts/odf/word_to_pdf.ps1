# Exporte des documents Word en PDF avec une seule instance de Word (invisible,
# sans boîte de dialogue). Appelé par prepare_odf_books.py, lot par lot.
#
#   -JobFile  fichier texte UTF-8 : une ligne par document, "<docx>`t<pdf>"
#
# Sortie (une ligne par événement, lue par le script Python qui surveille les
# blocages) : WORDPID <pid> | START <i> | OK <i> <ms> | ERR <i> <message> | FATAL <message>
param([Parameter(Mandatory = $true)][string]$JobFile)

$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [Text.Encoding]::UTF8

function Say([string]$s) { [Console]::Out.WriteLine($s); [Console]::Out.Flush() }

# Word renvoie « appel rejeté » quand il est occupé : on réessaie.
function Invoke-Word([scriptblock]$Action) {
  for ($try = 0; $try -lt 40; $try++) {
    try { return & $Action }
    catch {
      $h = $_.Exception.HResult
      if ($h -eq -2147418111 -or $h -eq -2147417846) { Start-Sleep -Milliseconds 500; continue }
      throw
    }
  }
  throw 'Word reste occupé'
}

$before = @(Get-Process WINWORD -ErrorAction SilentlyContinue | ForEach-Object { $_.Id })
$word = New-Object -ComObject Word.Application
Start-Sleep -Milliseconds 500
$after = @(Get-Process WINWORD -ErrorAction SilentlyContinue | ForEach-Object { $_.Id })
$new = @($after | Where-Object { $before -notcontains $_ })
Say ("WORDPID " + ($new -join ' '))

try {
  $word.Visible = $false
  $word.DisplayAlerts = 0            # wdAlertsNone
  $word.ScreenUpdating = $false
  $word.AutomationSecurity = 3       # macros désactivées
  $word.Options.CheckSpellingAsYouType = $false
  $word.Options.CheckGrammarAsYouType = $false
  $word.Options.UpdateLinksAtOpen = $false
  $word.Options.ConfirmConversions = $false
  $word.Options.SaveNormalPrompt = $false

  $installed = @{}
  foreach ($f in $word.FontNames) { $installed[$f] = $true }
  foreach ($need in @('Cairo', 'Amiri', 'EB Garamond')) {
    if (-not $installed.ContainsKey($need)) { Say "FATAL police manquante : $need (lancer install_fonts.ps1 puis relancer)"; exit 3 }
  }

  $missing = [Type]::Missing
  $jobs = Get-Content -LiteralPath $JobFile -Encoding UTF8 | Where-Object { $_.Trim() }
  $i = 0
  foreach ($line in $jobs) {
    $parts = $line -split "`t"
    $src = $parts[0]; $dst = $parts[1]
    $tmp = $dst + '.tmp.pdf'
    Say "START $i"
    $sw = [Diagnostics.Stopwatch]::StartNew()
    $doc = $null
    try {
      if (Test-Path -LiteralPath $tmp) { Remove-Item -LiteralPath $tmp -Force }
      # Open(FileName, ConfirmConversions, ReadOnly, AddToRecentFiles, PasswordDocument,
      #      PasswordTemplate, Revert, WritePasswordDocument, WritePasswordTemplate, Format,
      #      Encoding, Visible, OpenAndRepair, DocumentDirection, NoEncodingDialog)
      $doc = Invoke-Word { $word.Documents.Open($src, $false, $true, $false, 'x', 'x', $false, 'x', 'x', 0, $missing, $false, $false, $missing, $true) }
      Invoke-Word { $doc.Repaginate() } | Out-Null
      # ExportAsFixedFormat(Output, PDF=17, OpenAfter, OptimizeFor=print, Range=all, From, To,
      #      Item=content, IncludeDocProps, KeepIRM, CreateBookmarks=headings, DocStructureTags,
      #      BitmapMissingFonts, UseISO19005_1)
      # PDF/A (UseISO19005_1) : Word intègre alors toutes les polices, y compris
      # Times New Roman et Arial qu'il omet sinon (« polices système courantes »).
      Invoke-Word { $doc.ExportAsFixedFormat($tmp, 17, $false, 0, 0, 1, 1, 0, $false, $true, 1, $true, $true, $true) } | Out-Null
      Invoke-Word { $doc.Close(0) } | Out-Null
      [void][Runtime.InteropServices.Marshal]::ReleaseComObject($doc)
      $doc = $null
      Move-Item -LiteralPath $tmp -Destination $dst -Force
      Say ("OK $i " + [int]$sw.ElapsedMilliseconds)
    }
    catch {
      $msg = ($_.Exception.Message -replace "[\r\n]+", ' ')
      Say "ERR $i $msg"
      if ($doc) { try { $doc.Close(0) } catch {} }
    }
    $i++
  }
}
finally {
  try { $word.Quit(0) } catch {}
  try { [void][Runtime.InteropServices.Marshal]::ReleaseComObject($word) } catch {}
}
