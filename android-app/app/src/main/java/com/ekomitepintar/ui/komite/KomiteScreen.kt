package com.ekomitepintar.ui.komite

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import kotlinx.coroutines.launch
import androidx.compose.animation.*
import kotlinx.coroutines.delay
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.ekomitepintar.ui.components.BottomNavBar
import com.ekomitepintar.ui.navigation.Routes
import com.ekomitepintar.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun KomiteScreen(
    onNavigate: (String) -> Unit
) {
    val menuItems = listOf(
        KomiteMenu("Pengurus", Icons.Filled.People),
        KomiteMenu("Laporan Keuangan", Icons.Filled.AccountBalanceWallet),
        KomiteMenu("Hasil E-Voting", Icons.Filled.HowToVote),
        KomiteMenu("Program Kerja", Icons.Filled.Event)
    )

    val snackbarHostState = remember { SnackbarHostState() }
    val coroutineScope = rememberCoroutineScope()
    
    val onCardClick = { item: KomiteMenu ->
        when (item.title) {
            "Laporan Keuangan" -> onNavigate(Routes.TRANSPARANSI)
            "Hasil E-Voting" -> onNavigate(Routes.VOTING_LIST)
            "Pengurus" -> onNavigate(Routes.PENGURUS)
            "Program Kerja" -> onNavigate(Routes.PROGRAM_KERJA)
        }
    }

    var showContent by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) {
        delay(100)
        showContent = true
    }

    Scaffold(
        containerColor = BackgroundLight,
        snackbarHost = {
            SnackbarHost(snackbarHostState) { data ->
                Snackbar(
                    snackbarData = data,
                    containerColor = Color(0xFFF1F5F9),
                    contentColor = Slate800,
                    actionColor = Emerald600,
                    shape = MaterialTheme.shapes.medium
                )
            }
        },
        bottomBar = {
            BottomNavBar(
                currentRoute = Routes.KOMITE,
                onNavigate = onNavigate
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 20.dp)
        ) {
            Spacer(modifier = Modifier.height(24.dp))
            
            Text(
                text = "Komite Sekolah",
                color = Slate800,
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold
            )
            
            Spacer(modifier = Modifier.height(24.dp))
            
            // Grid 2x2 Static
            AnimatedVisibility(
                visible = showContent,
                enter = fadeIn() + scaleIn(initialScale = 0.9f)
            ) {
                Column(
                    verticalArrangement = Arrangement.spacedBy(16.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(16.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Box(modifier = Modifier.weight(1f)) {
                            KomiteCard(menuItems[0], onClick = { onCardClick(menuItems[0]) })
                        }
                        Box(modifier = Modifier.weight(1f)) {
                            KomiteCard(menuItems[1], onClick = { onCardClick(menuItems[1]) })
                        }
                    }
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(16.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Box(modifier = Modifier.weight(1f)) {
                            KomiteCard(menuItems[2], onClick = { onCardClick(menuItems[2]) })
                        }
                        Box(modifier = Modifier.weight(1f)) {
                            KomiteCard(menuItems[3], onClick = { onCardClick(menuItems[3]) })
                        }
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(32.dp))
            
            Text(
                text = "Pengumuman Terbaru",
                color = Slate800,
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Announcement Card
            AnimatedVisibility(
                visible = showContent,
                enter = fadeIn() + slideInVertically(initialOffsetY = { 50 })
            ) {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = MaterialTheme.shapes.medium,
                    colors = CardDefaults.cardColors(containerColor = CardWhite),
        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFF3F4F6)),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalAlignment = Alignment.Top
                    ) {
                        Surface(
                            shape = CircleShape,
                            color = Emerald600.copy(alpha = 0.12f),
                            modifier = Modifier.size(40.dp)
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Icon(
                                    imageVector = Icons.Filled.NotificationsActive,
                                    contentDescription = null,
                                    tint = Emerald600,
                                    modifier = Modifier.size(20.dp)
                                )
                            }
                        }
                        
                        Spacer(modifier = Modifier.width(16.dp))
                        
                        Column {
                            Text(
                                text = "Rapat Pleno Semester 1",
                                color = Slate800,
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "Akan diadakan pada hari Sabtu, 20 Agustus 2026. Kehadiran Bapak/Ibu sangat diharapkan.",
                                color = Slate500,
                                style = MaterialTheme.typography.bodyMedium
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun KomiteCard(item: KomiteMenu, onClick: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth().aspectRatio(1f),
        shape = MaterialTheme.shapes.large,
        colors = CardDefaults.cardColors(containerColor = CardWhite),
        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFF3F4F6)),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        onClick = onClick
    ) {
        Column(
            modifier = Modifier.fillMaxSize().padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Surface(
                shape = CircleShape,
                color = Emerald600.copy(alpha = 0.12f),
                modifier = Modifier.size(56.dp)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(
                        imageVector = item.icon,
                        contentDescription = item.title,
                        tint = Emerald600,
                        modifier = Modifier.size(32.dp)
                    )
                }
            }
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = item.title,
                color = Slate800,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                textAlign = androidx.compose.ui.text.style.TextAlign.Center
            )
        }
    }
}

data class KomiteMenu(val title: String, val icon: ImageVector)
