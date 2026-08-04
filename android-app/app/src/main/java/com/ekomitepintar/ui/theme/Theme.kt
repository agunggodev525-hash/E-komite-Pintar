package com.ekomitepintar.ui.theme

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Shapes
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.unit.dp

// ============================================
// Material3 Dark Color Scheme — Navy + Gold
// ============================================

private val EKomiteColorScheme = darkColorScheme(
    // Primary — Gold (aksen utama, tombol CTA)
    primary = Gold400,
    onPrimary = Navy900,
    primaryContainer = Gold500,
    onPrimaryContainer = Gold100,

    // Secondary — Navy medium
    secondary = Navy500,
    onSecondary = White,
    secondaryContainer = Navy600,
    onSecondaryContainer = IceBlue,

    // Tertiary — Gold lighter
    tertiary = Gold300,
    onTertiary = Navy900,
    tertiaryContainer = Gold200,
    onTertiaryContainer = Navy800,

    // Background & Surface
    background = Navy900,
    onBackground = White,
    surface = Navy800,
    onSurface = White,
    surfaceVariant = Navy700,
    onSurfaceVariant = White80,

    // Outline
    outline = Navy400,
    outlineVariant = Navy500,

    // Error
    error = ErrorRed,
    onError = Navy900,

    // Inverse
    inverseSurface = White,
    inverseOnSurface = Navy900,
    inversePrimary = Gold500,

    // Surface containers (M3 extended tones)
    surfaceContainerLowest = Navy900,
    surfaceContainerLow = Navy800,
    surfaceContainer = Navy700,
    surfaceContainerHigh = Navy600,
    surfaceContainerHighest = Navy500,
)

// ============================================
// Custom Shapes
// ============================================

private val EKomiteShapes = Shapes(
    extraSmall = RoundedCornerShape(4.dp),
    small = RoundedCornerShape(8.dp),
    medium = RoundedCornerShape(16.dp),
    large = RoundedCornerShape(24.dp),
    extraLarge = RoundedCornerShape(32.dp)
)

// ============================================
// Theme Composable
// ============================================

@Composable
fun EKomitePintarTheme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = EKomiteColorScheme,
        typography = EKomiteTypography,
        shapes = EKomiteShapes,
        content = content
    )
}
