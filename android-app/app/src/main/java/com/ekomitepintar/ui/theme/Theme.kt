package com.ekomitepintar.ui.theme

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Shapes
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

// ============================================
// Material3 Light Color Scheme — Emerald Theme
// ============================================

private val EKomiteColorScheme = lightColorScheme(
    primary = Emerald600,
    onPrimary = Color.White,
    primaryContainer = Emerald100,
    onPrimaryContainer = Emerald900,

    secondary = Emerald500,
    onSecondary = Color.White,
    secondaryContainer = Emerald50,
    onSecondaryContainer = Emerald700,

    tertiary = Slate500,
    onTertiary = Color.White,
    tertiaryContainer = Color(0xFFE2E8F0), // Missing? Let's use Color(0xFFE2E8F0) inline
    onTertiaryContainer = Slate800,

    background = BackgroundLight,
    onBackground = Slate800,
    
    surface = CardWhite,
    onSurface = Slate800,
    
    surfaceVariant = Color(0xFFF1F5F9), // Slate100
    onSurfaceVariant = Slate500,

    error = Rose600,
    onError = Color.White,
    errorContainer = Rose50,
    onErrorContainer = Rose600,
    
    outline = Color(0xFFE2E8F0), // Color(0xFFE2E8F0)
    outlineVariant = Color(0xFFF1F5F9) // Slate100
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
