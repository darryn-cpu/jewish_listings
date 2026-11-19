Add-Type -AssemblyName System.Drawing

function New-Point([double]$x, [double]$y, [double]$scale) {
  New-Object System.Drawing.PointF ([single]($x * $scale)), ([single]($y * $scale))
}

function New-Awning([double]$scale) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $path.AddLine((New-Point 112 188 $scale), (New-Point 176 112 $scale))
  $path.AddLine((New-Point 176 112 $scale), (New-Point 336 112 $scale))
  $path.AddLine((New-Point 336 112 $scale), (New-Point 400 188 $scale))
  $path.AddArc(([single](304 * $scale)), ([single](140 * $scale)), ([single](96 * $scale)), ([single](96 * $scale)), 0, 180)
  $path.AddArc(([single](208 * $scale)), ([single](140 * $scale)), ([single](96 * $scale)), ([single](96 * $scale)), 0, 180)
  $path.AddArc(([single](112 * $scale)), ([single](140 * $scale)), ([single](96 * $scale)), ([single](96 * $scale)), 0, 180)
  $path.CloseFigure()
  return $path
}

function New-Wall([double]$scale) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $path.AddRectangle((New-Object System.Drawing.RectangleF ([single](140 * $scale)), ([single](258 * $scale)), ([single](232 * $scale)), ([single](140 * $scale))))
  return $path
}

function New-Door([double]$scale) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $path.AddArc(([single](221 * $scale)), ([single](300 * $scale)), ([single](70 * $scale)), ([single](36 * $scale)), 180, 180)
  $path.AddLine((New-Point 291 318 $scale), (New-Point 291 398 $scale))
  $path.AddLine((New-Point 291 398 $scale), (New-Point 221 398 $scale))
  $path.CloseFigure()
  return $path
}

function Export-Icon([int]$size, [string]$path) {
  $bitmap = New-Object System.Drawing.Bitmap $size, $size
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

  $scale = $size / 512.0
  $origin = New-Object System.Drawing.Point 0, 0
  $far = New-Object System.Drawing.Point $size, $size
  $gold = New-Object System.Drawing.Drawing2D.LinearGradientBrush $origin, $far, ([System.Drawing.Color]::FromArgb(255, 255, 229, 122)), ([System.Drawing.Color]::FromArgb(255, 255, 140, 18))
  $blend = New-Object System.Drawing.Drawing2D.ColorBlend 3
  $blend.Colors = @(
    [System.Drawing.Color]::FromArgb(255, 255, 229, 122),
    [System.Drawing.Color]::FromArgb(255, 255, 179, 28),
    [System.Drawing.Color]::FromArgb(255, 255, 140, 18)
  )
  $blend.Positions = [single[]](0.0, 0.48, 1.0)
  $gold.InterpolationColors = $blend
  $graphics.FillRectangle($gold, 0, 0, $size, $size)

  $glowPath = New-Object System.Drawing.Drawing2D.GraphicsPath
  $glowPath.AddEllipse(0, 0, ([single]($size * 0.92)), ([single]($size * 0.72)))
  $glow = New-Object System.Drawing.Drawing2D.PathGradientBrush $glowPath
  $glow.CenterColor = [System.Drawing.Color]::FromArgb(150, 255, 248, 220)
  $glow.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 255, 248, 220))
  $glow.CenterPoint = New-Object System.Drawing.PointF ([single]($size * 0.24)), ([single]($size * 0.14))
  $graphics.FillPath($glow, $glowPath)

  $awning = New-Awning $scale
  $wall = New-Wall $scale
  $door = New-Door $scale
  $ink = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 29, 21, 0))
  $shadow = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(36, 29, 21, 0))

  $graphics.TranslateTransform(0, ([single](10 * $scale)))
  $graphics.FillPath($shadow, $awning)
  $graphics.FillPath($shadow, $wall)
  $graphics.ResetTransform()

  $graphics.FillPath($ink, $awning)
  $graphics.FillPath($ink, $wall)
  $graphics.FillPath($gold, $door)

  $bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $graphics.Dispose()
  $bitmap.Dispose()
  $gold.Dispose()
  $glow.Dispose()
  $ink.Dispose()
  $shadow.Dispose()
}

$root = Split-Path $PSScriptRoot -Parent
Export-Icon 512 (Join-Path $root "public\icon-512.png")
Export-Icon 192 (Join-Path $root "public\icon-192.png")
Write-Output "wrote icons"
