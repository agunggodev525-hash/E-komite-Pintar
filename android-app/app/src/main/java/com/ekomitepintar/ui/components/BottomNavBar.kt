package com.ekomitepintar.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.Icon
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.ekomitepintar.ui.navigation.Routes
import com.ekomitepintar.ui.theme.*

@Composable
fun BottomNavBar(
    currentRoute: String,
    onNavigate: (String) -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .navigationBarsPadding() // Safe area for system navigation
            .height(105.dp) // Height includes space for floating button + extra padding
    ) {
        // Bottom Bar Background
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .align(Alignment.BottomCenter)
                .height(65.dp),
            color = CardWhite,
            shadowElevation = 8.dp
        ) {
            Row(
                modifier = Modifier.fillMaxSize(),
                horizontalArrangement = Arrangement.SpaceEvenly,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // 1. Beranda
                NavItem(
                    icon = Icons.Filled.Home,
                    label = "Beranda",
                    isSelected = currentRoute == Routes.DASHBOARD,
                    onClick = { if (currentRoute != Routes.DASHBOARD) onNavigate(Routes.DASHBOARD) }
                )
                // 2. Riwayat
                NavItem(
                    icon = Icons.Filled.EventNote,
                    label = "Riwayat",
                    isSelected = currentRoute == Routes.RIWAYAT,
                    onClick = { if (currentRoute != Routes.RIWAYAT) onNavigate(Routes.RIWAYAT) }
                )

                // 3. Spacer for FAB
                Spacer(modifier = Modifier.width(60.dp))

                // 4. Bantuan
                NavItem(
                    icon = Icons.Filled.ErrorOutline,
                    label = "Bantuan",
                    isSelected = currentRoute == Routes.BANTUAN,
                    onClick = { if (currentRoute != Routes.BANTUAN) onNavigate(Routes.BANTUAN) }
                )
                // 5. Saya (Profil)
                NavItem(
                    icon = Icons.Filled.AccountCircle,
                    label = "Saya",
                    isSelected = currentRoute == Routes.PROFIL,
                    onClick = { if (currentRoute != Routes.PROFIL) onNavigate(Routes.PROFIL) }
                )
            }
        }

        // Floating Action Button (Komite) - Center
        Column(
            modifier = Modifier
                .align(Alignment.TopCenter)
                .offset(y = (-10).dp)
                .clickable(
                    interactionSource = remember { MutableInteractionSource() },
                    indication = null,
                    onClick = { if (currentRoute != Routes.KOMITE) onNavigate(Routes.KOMITE) }
                ),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Box(
                modifier = Modifier
                    .size(60.dp)
                    .shadow(12.dp, CircleShape, spotColor = Emerald900, ambientColor = Emerald900)
                    .background(CardWhite, CircleShape) // Outer border
                    .padding(4.dp) // Thickness of the white border
                    .background(Color(0xFF059669), CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Filled.AccountBox,
                    contentDescription = "Komite",
                    tint = Color.White,
                    modifier = Modifier.size(28.dp)
                )
            }
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "Komite",
                color = Slate800,
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold
            )
        }
    }
}

@Composable
fun NavItem(
    icon: ImageVector,
    label: String,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    val color = if (isSelected) Emerald600 else Slate400
    
    Column(
        modifier = Modifier
            .clickable(
                interactionSource = remember { MutableInteractionSource() },
                indication = null,
                onClick = onClick
            )
            .padding(horizontal = 12.dp, vertical = 8.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(
            imageVector = icon,
            contentDescription = label,
            tint = color,
            modifier = Modifier.size(24.dp)
        )
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            text = label,
            color = color,
            fontSize = 10.sp,
            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
        )
    }
}
