package com.ekomitepintar.ui.komite

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Event
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.ekomitepintar.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProgramKerjaScreen(
    onNavigateBack: () -> Unit
) {
    Scaffold(
        containerColor = BackgroundLight,
        topBar = {
            TopAppBar(
                title = { Text("Program Kerja", color = Slate800, fontWeight = FontWeight.Bold) },
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
            
            val programs = listOf(
                Pair("Rapat Pleno Awal Tahun", "Q3 2026 - Penyusunan anggaran dan sosialisasi program sekolah kepada orang tua."),
                Pair("Penggalangan Dana Perpus", "Q4 2026 - Pengadaan buku tambahan dan renovasi rak perpustakaan sekolah."),
                Pair("Seminar Parenting", "Q1 2027 - Mengundang psikolog anak untuk edukasi parenting di era digital."),
                Pair("Pentas Seni Tahunan", "Q2 2027 - Kolaborasi antara siswa, guru, dan komite sekolah dalam acara pensi.")
            )
            
            programs.forEachIndexed { index, (title, desc) ->
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.Top
                    ) {
                        // Timeline marker
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            modifier = Modifier.width(40.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(32.dp)
                                    .clip(CircleShape)
                                    .background(if (index == 0) Emerald600 else CardWhite),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    Icons.Filled.Event,
                                    contentDescription = null,
                                    tint = if (index == 0) BackgroundLight else Slate500,
                                    modifier = Modifier.size(16.dp)
                                )
                            }
                            if (index < programs.size - 1) {
                                Box(
                                    modifier = Modifier
                                        .width(2.dp)
                                        .height(80.dp)
                                        .background(CardWhite)
                                )
                            }
                        }
                        
                        Spacer(modifier = Modifier.width(12.dp))
                        
                        // Content Card
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = MaterialTheme.shapes.medium,
                            colors = CardDefaults.cardColors(containerColor = CardWhite),
        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFF3F4F6)),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                        ) {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(16.dp)
                            ) {
                                Text(
                                    text = title,
                                    color = Slate800,
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.Bold
                                )
                                Spacer(modifier = Modifier.height(8.dp))
                                Text(
                                    text = desc,
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
}
