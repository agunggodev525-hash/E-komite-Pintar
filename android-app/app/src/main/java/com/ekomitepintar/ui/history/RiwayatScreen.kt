package com.ekomitepintar.ui.history

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Description
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.ekomitepintar.ui.components.BottomNavBar
import com.ekomitepintar.ui.components.shimmerEffect
import androidx.compose.ui.draw.clip
import com.ekomitepintar.ui.navigation.Routes
import com.ekomitepintar.ui.theme.*
import com.ekomitepintar.viewmodel.RiwayatViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.ekomitepintar.model.Tagihan
import java.text.NumberFormat
import java.util.Locale
import androidx.compose.animation.*
import kotlinx.coroutines.delay

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RiwayatScreen(
    viewModel: RiwayatViewModel,
    onNavigate: (String) -> Unit
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    var selectedFilter by remember { mutableStateOf("Semua") }
    val filters = listOf("Semua", "Berhasil", "Menunggu")
    var showContent by remember { mutableStateOf(false) }
    
    LaunchedEffect(uiState.tagihanList) {
        if (!uiState.isLoading) {
            delay(100)
            showContent = true
        }
    }

    Scaffold(
        containerColor = BackgroundLight,
        bottomBar = {
            BottomNavBar(
                currentRoute = Routes.RIWAYAT,
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
                text = "Riwayat Transaksi",
                color = Slate800,
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold
            )
            
            Spacer(modifier = Modifier.height(20.dp))
            
            // Filter Pills
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                filters.forEach { filter ->
                    FilterPill(
                        text = filter,
                        isSelected = selectedFilter == filter,
                        onClick = { selectedFilter = filter }
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(24.dp))
            
            // Transaction List
            val filteredTransactions = if (selectedFilter == "Semua") {
                uiState.tagihanList
            } else if (selectedFilter == "Berhasil") {
                uiState.tagihanList.filter { it.statusBayar == "LUNAS" }
            } else {
                uiState.tagihanList.filter { it.statusBayar != "LUNAS" }
            }
            
            if (uiState.isLoading) {
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(16.dp),
                    contentPadding = PaddingValues(bottom = 24.dp)
                ) {
                    items(5) {
                        RiwayatSkeletonCard()
                    }
                }
            } else if (filteredTransactions.isEmpty()) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text("Belum ada riwayat transaksi.", color = Slate500)
                }
            } else {
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(16.dp),
                    contentPadding = PaddingValues(bottom = 24.dp)
                ) {
                    items(filteredTransactions.size) { index ->
                        AnimatedVisibility(
                            visible = showContent,
                            enter = fadeIn() + slideInVertically(initialOffsetY = { 50 + (index * 20) })
                        ) {
                            RiwayatCard(filteredTransactions[index])
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun FilterPill(text: String, isSelected: Boolean, onClick: () -> Unit) {
    Surface(
        shape = CircleShape,
        color = if (isSelected) Emerald600 else CardWhite,
        border = androidx.compose.foundation.BorderStroke(1.dp, if (isSelected) Color.Transparent else Color(0xFFE2E8F0)),
        onClick = onClick
    ) {
        Text(
            text = text,
            color = if (isSelected) Color.White else Slate500,
            style = MaterialTheme.typography.labelLarge,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(horizontal = 20.dp, vertical = 10.dp)
        )
    }
}

@Composable
fun RiwayatCard(data: Tagihan) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = CardWhite),
        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFF3F4F6)),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Icon
            Surface(
                shape = RoundedCornerShape(12.dp),
                color = Emerald50,
                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFD1FAE5)),
                modifier = Modifier.size(48.dp)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(
                        imageVector = Icons.Filled.Description,
                        contentDescription = null,
                        tint = Emerald600,
                        modifier = Modifier.size(24.dp)
                    )
                }
            }
            
            Spacer(modifier = Modifier.width(16.dp))
            
            // Content
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = data.judul,
                    color = Slate800,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = data.pembayaran?.tanggalBayar ?: data.tenggatWaktu,
                    color = Slate500,
                    style = MaterialTheme.typography.bodySmall
                )
                Spacer(modifier = Modifier.height(4.dp))
                val formatter = NumberFormat.getCurrencyInstance(Locale("id", "ID"))
                formatter.maximumFractionDigits = 0
                val amountStr = formatter.format(data.nominal).replace("Rp", "Rp ")
                Text(
                    text = amountStr,
                    color = Emerald600,
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.ExtraBold
                )
            }
            
            // Status Pill
            val isSuccess = data.statusBayar == "LUNAS"
            val statusText = if (isSuccess) "BERHASIL" else "MENUNGGU"
            Surface(
                shape = CircleShape,
                color = if (isSuccess) Emerald50 else Rose50,
                border = androidx.compose.foundation.BorderStroke(1.dp, if (isSuccess) Color(0xFFD1FAE5) else Color(0xFFFFE4E6))
            ) {
                Text(
                    text = statusText,
                    color = if (isSuccess) Emerald600 else Rose600,
                    style = MaterialTheme.typography.labelSmall,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                )
            }
        }
    }
}

@Composable
fun RiwayatSkeletonCard() {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = CardWhite),
        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFF3F4F6)),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Icon Skeleton
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .shimmerEffect()
            )
            
            Spacer(modifier = Modifier.width(16.dp))
            
            // Content Skeleton
            Column(modifier = Modifier.weight(1f)) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth(0.7f)
                        .height(18.dp)
                        .clip(RoundedCornerShape(4.dp))
                        .shimmerEffect()
                )
                Spacer(modifier = Modifier.height(8.dp))
                Box(
                    modifier = Modifier
                        .fillMaxWidth(0.4f)
                        .height(14.dp)
                        .clip(RoundedCornerShape(4.dp))
                        .shimmerEffect()
                )
                Spacer(modifier = Modifier.height(8.dp))
                Box(
                    modifier = Modifier
                        .fillMaxWidth(0.5f)
                        .height(16.dp)
                        .clip(RoundedCornerShape(4.dp))
                        .shimmerEffect()
                )
            }
            
            // Status Pill Skeleton
            Box(
                modifier = Modifier
                    .width(80.dp)
                    .height(28.dp)
                    .clip(CircleShape)
                    .shimmerEffect()
            )
        }
    }
}
