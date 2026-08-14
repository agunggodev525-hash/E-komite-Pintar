package com.ekomitepintar.ui.components

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.Group
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.unit.dp
import com.ekomitepintar.ui.navigation.Routes
import com.ekomitepintar.ui.theme.Gold400
import com.ekomitepintar.ui.theme.Navy700
import com.ekomitepintar.ui.theme.Navy900
import com.ekomitepintar.ui.theme.White60

@Composable
fun BottomNavBar(
    currentRoute: String,
    onNavigate: (String) -> Unit
) {
    NavigationBar(
        containerColor = Navy900,
        contentColor = Gold400,
        tonalElevation = 8.dp
    ) {
        NavigationBarItem(
            selected = currentRoute == Routes.DASHBOARD,
            onClick = { if (currentRoute != Routes.DASHBOARD) onNavigate(Routes.DASHBOARD) },
            icon = { Icon(Icons.Filled.Home, contentDescription = "Beranda") },
            label = { Text("Beranda") },
            colors = NavigationBarItemDefaults.colors(
                selectedIconColor = Gold400,
                selectedTextColor = Gold400,
                indicatorColor = Navy700,
                unselectedIconColor = White60,
                unselectedTextColor = White60
            )
        )
        NavigationBarItem(
            selected = currentRoute == Routes.RIWAYAT,
            onClick = { if (currentRoute != Routes.RIWAYAT) onNavigate(Routes.RIWAYAT) },
            icon = { Icon(Icons.Filled.CalendarMonth, contentDescription = "Riwayat") },
            label = { Text("Riwayat") },
            colors = NavigationBarItemDefaults.colors(
                selectedIconColor = Gold400,
                selectedTextColor = Gold400,
                indicatorColor = Navy700,
                unselectedIconColor = White60,
                unselectedTextColor = White60
            )
        )
        NavigationBarItem(
            selected = currentRoute == Routes.KOMITE,
            onClick = { if (currentRoute != Routes.KOMITE) onNavigate(Routes.KOMITE) },
            icon = { Icon(Icons.Filled.Group, contentDescription = "Komite") },
            label = { Text("Komite") },
            colors = NavigationBarItemDefaults.colors(
                selectedIconColor = Gold400,
                selectedTextColor = Gold400,
                indicatorColor = Navy700,
                unselectedIconColor = White60,
                unselectedTextColor = White60
            )
        )
        NavigationBarItem(
            selected = currentRoute == Routes.PROFIL,
            onClick = { if (currentRoute != Routes.PROFIL) onNavigate(Routes.PROFIL) },
            icon = { Icon(Icons.Filled.Person, contentDescription = "Profil") },
            label = { Text("Profil") },
            colors = NavigationBarItemDefaults.colors(
                selectedIconColor = Gold400,
                selectedTextColor = Gold400,
                indicatorColor = Navy700,
                unselectedIconColor = White60,
                unselectedTextColor = White60
            )
        )
    }
}
