package com.example.ui.theme

import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color

val AppBg = Color(0xFFF7F4EC)
val AppSurface = Color(0xFFFFFFFF)
val AppSurface2 = Color(0xFFF2EEE3)
val AppSurface3 = Color(0xFFE6E0D0)
val AppText = Color(0xFF14152A)
val AppText2 = Color(0xFF4A4D68)
val AppText3 = Color(0xFF8A8DA6)
val AppLine = Color(0x1714152A) // 9% opacity
val AppLine2 = Color(0x2B14152A) // 17% opacity

val AppAccent = Color(0xFFFFBD1F)
val AppAccent2 = Color(0xFFFF8F1F)
val AppAccentInk = Color(0xFF1D1500)
val AppAccentText = Color(0xFF8F5C00)
val AppAccentSoft = Color(0x33FFBD1F) // 20% opacity
val AppAccentLine = Color(0x73B47300) // 45% opacity

val AppOk = Color(0xFF14804F)
val AppOkBg = Color(0x1F14804F) // 12% opacity
val AppWarn = Color(0xFF8F5C00)
val AppWarnBg = Color(0x38FFB547) // 22% opacity
val AppErr = Color(0xFFC4382F)
val AppErrBg = Color(0x1AC4382F) // 10% opacity

val GlassBg = Color(0xB8FFFFFF) // 72% opacity
val Glass2Bg = Color(0x0D14152A) // 5% opacity

val Aur1 = Color(0x66FFA633)
val Aur2 = Color(0x4DFFA8B8)
val Aur3 = Color(0x4770EAFF)

val GoldGradient = Brush.verticalGradient(listOf(AppAccent, AppAccent2))
val GoldLinear135 = Brush.linearGradient(listOf(Color(0xFFFFE27A), Color(0xFFFFB02E), Color(0xFFFF8A2B)))
val KosherTextGradient = Brush.horizontalGradient(listOf(AppAccent, AppAccent2))

// Kashrut badge styles
val MeatBg = Color(0x29FF7A7A)
val MeatText = Color(0xFF9A3030)
val DairyBg = Color(0x297DB0FF)
val DairyText = Color(0xFF1C4F8A)
val ParevBg = AppOkBg
val ParevText = AppOk
val CYBg = AppAccentSoft
val CYText = AppAccentText
val MehadrinText = AppAccentInk
