package com.ekomitepintar.ui.profile

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.NotificationsActive
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.ekomitepintar.ui.theme.*
import com.ekomitepintar.viewmodel.NotifikasiViewModel
import java.text.SimpleDateFormat
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NotifikasiScreen(
    onNavigateBack: () -> Unit,
    viewModel: NotifikasiViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    // Mark as read when screen is opened
    androidx.compose.runtime.LaunchedEffect(Unit) {
        viewModel.fetchNotifikasi() // fetch fresh
        viewModel.markAllAsRead()
    }
    Scaffold(
        containerColor = BackgroundLight,
        topBar = {
            TopAppBar(
                title = { Text("Notifikasi", color = Slate800, fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Kembali", tint = Slate800)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.Transparent)
            )
        }
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 20.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
            contentPadding = PaddingValues(bottom = 24.dp)
        ) {
            item { Spacer(modifier = Modifier.height(8.dp)) }
            
            if (uiState.isLoading && uiState.notifikasiList.isEmpty()) {
                item {
                    Box(modifier = Modifier.fillMaxWidth().padding(32.dp), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator(color = Emerald600)
                    }
                }
            } else if (uiState.notifikasiList.isEmpty()) {
                item {
                    Box(modifier = Modifier.fillMaxWidth().padding(32.dp), contentAlignment = Alignment.Center) {
                        Text("Belum ada notifikasi", color = Slate500)
                    }
                }
            } else {
                uiState.notifikasiList.forEach { notif ->
                    item {
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = MaterialTheme.shapes.medium,
                            colors = CardDefaults.cardColors(containerColor = if (notif.isRead) BackgroundLight else CardWhite),
                            border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFF3F4F6)),
                            elevation = CardDefaults.cardElevation(defaultElevation = if (notif.isRead) 0.dp else 2.dp)
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(16.dp),
                                verticalAlignment = Alignment.Top
                            ) {
                                Surface(
                                    shape = CircleShape,
                                    color = if (notif.tipe == "SUCCESS") Emerald600.copy(alpha = 0.12f) else Color(0xFFE2E8F0),
                                    modifier = Modifier.size(40.dp)
                                ) {
                                    Box(contentAlignment = Alignment.Center) {
                                        Icon(
                                            imageVector = Icons.Filled.NotificationsActive,
                                            contentDescription = null,
                                            tint = if (notif.tipe == "SUCCESS") Emerald600 else Slate500,
                                            modifier = Modifier.size(20.dp)
                                        )
                                    }
                                }
                                
                                Spacer(modifier = Modifier.width(16.dp))
                                
                                Column {
                                    Text(
                                        text = notif.judul,
                                        color = if (notif.isRead) Slate600 else Slate800,
                                        style = MaterialTheme.typography.titleMedium,
                                        fontWeight = if (notif.isRead) FontWeight.Normal else FontWeight.Bold
                                    )
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text(
                                        text = notif.pesan,
                                        color = Slate500,
                                        style = MaterialTheme.typography.bodyMedium
                                    )
                                    Spacer(modifier = Modifier.height(8.dp))
                                    
                                    val formattedTime = try {
                                        val parser = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault())
                                        val date = parser.parse(notif.createdAt)
                                        val formatter = SimpleDateFormat("dd MMM yyyy, HH:mm", Locale("id", "ID"))
                                        if (date != null) formatter.format(date) else notif.createdAt
                                    } catch (e: Exception) { notif.createdAt }
                                    
                                    Text(
                                        text = formattedTime,
                                        color = Slate400,
                                        fontSize = 11.sp
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
