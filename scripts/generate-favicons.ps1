$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
namespace Win32 {
  public static class User32 {
    [DllImport("user32.dll", SetLastError=true)]
    public static extern bool DestroyIcon(IntPtr hIcon);
  }
}
"@

function New-SquareBitmapFromImage {
    param(
        [Parameter(Mandatory = $true)][System.Drawing.Image]$Image
    )

    $size = [Math]::Min($Image.Width, $Image.Height)
    $srcX = [int](($Image.Width - $size) / 2)
    $srcY = [int](($Image.Height - $size) / 2)

    $square = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($square)
    try {
        $g.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceOver
        $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $g.Clear([System.Drawing.Color]::Transparent)

        $destRect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
        $srcRect = New-Object System.Drawing.Rectangle($srcX, $srcY, $size, $size)
        $g.DrawImage($Image, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
    } finally {
        $g.Dispose()
    }

    return $square
}

function New-ResizedBitmap {
    param(
        [Parameter(Mandatory = $true)][System.Drawing.Bitmap]$Source,
        [Parameter(Mandatory = $true)][int]$Size
    )

    $bmp = New-Object System.Drawing.Bitmap($Size, $Size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    try {
        $g.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceOver
        $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $g.Clear([System.Drawing.Color]::Transparent)
        $g.DrawImage($Source, 0, 0, $Size, $Size)
    } finally {
        $g.Dispose()
    }

    return $bmp
}

function Save-Png {
    param(
        [Parameter(Mandatory = $true)][System.Drawing.Bitmap]$Bitmap,
        [Parameter(Mandatory = $true)][string]$OutPath
    )
    $dir = Split-Path -Parent $OutPath
    if ($dir -and !(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir | Out-Null
    }
    $Bitmap.Save($OutPath, [System.Drawing.Imaging.ImageFormat]::Png)
}

function Save-IcoFromBitmap {
    param(
        [Parameter(Mandatory = $true)][System.Drawing.Bitmap]$Bitmap,
        [Parameter(Mandatory = $true)][string]$OutPath
    )

    $dir = Split-Path -Parent $OutPath
    if ($dir -and !(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir | Out-Null
    }

    $hIcon = $Bitmap.GetHicon()
    try {
        $icon = [System.Drawing.Icon]::FromHandle($hIcon)
        try {
            $fs = [System.IO.File]::Open($OutPath, [System.IO.FileMode]::Create, [System.IO.FileAccess]::Write)
            try {
                $icon.Save($fs)
            } finally {
                $fs.Dispose()
            }
        } finally {
            $icon.Dispose()
        }
    } finally {
        [void][Win32.User32]::DestroyIcon($hIcon)
    }
}

$repoRoot = Split-Path -Parent $PSScriptRoot
$sourceLogo = Join-Path $repoRoot "public/assets/ewf-logo.png"
if (!(Test-Path $sourceLogo)) {
    throw "Source logo not found: $sourceLogo"
}

$faviconDir = Join-Path $repoRoot "public/favicon"

$src = [System.Drawing.Image]::FromFile($sourceLogo)
try {
    $square = New-SquareBitmapFromImage -Image $src
    try {
        $png16 = New-ResizedBitmap -Source $square -Size 16
        $png32 = New-ResizedBitmap -Source $square -Size 32
        $png48 = New-ResizedBitmap -Source $square -Size 48
        $png180 = New-ResizedBitmap -Source $square -Size 180
        $png192 = New-ResizedBitmap -Source $square -Size 192
        $png512 = New-ResizedBitmap -Source $square -Size 512

        try {
            Save-Png -Bitmap $png16 -OutPath (Join-Path $faviconDir "favicon-16x16.png")
            Save-Png -Bitmap $png32 -OutPath (Join-Path $faviconDir "favicon-32x32.png")
            Save-Png -Bitmap $png48 -OutPath (Join-Path $faviconDir "favicon-48x48.png")
            Save-Png -Bitmap $png180 -OutPath (Join-Path $faviconDir "apple-touch-icon.png")
            Save-Png -Bitmap $png192 -OutPath (Join-Path $faviconDir "android-chrome-192x192.png")
            Save-Png -Bitmap $png512 -OutPath (Join-Path $faviconDir "android-chrome-512x512.png")

            Save-IcoFromBitmap -Bitmap $png48 -OutPath (Join-Path $faviconDir "favicon.ico")
            Save-IcoFromBitmap -Bitmap $png48 -OutPath (Join-Path $repoRoot "public/favicon.ico")
        } finally {
            $png16.Dispose()
            $png32.Dispose()
            $png48.Dispose()
            $png180.Dispose()
            $png192.Dispose()
            $png512.Dispose()
        }
    } finally {
        $square.Dispose()
    }
} finally {
    $src.Dispose()
}

Write-Host "Favicons generated from: $sourceLogo"
