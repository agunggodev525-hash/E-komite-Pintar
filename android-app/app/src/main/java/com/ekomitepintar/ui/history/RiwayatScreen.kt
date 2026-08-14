package com.ekomitepintar.ui.history

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
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
        containerColor = Navy900,
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
                color = White,
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
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = Gold400)
                }
            } else if (filteredTransactions.isEmpty()) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text("Belum ada riwayat transaksi.", color = White60)
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
        color = if (isSelected) Gold400 else Navy700,
        onClick = onClick
    ) {
        Text(
            text = text,
            color = if (isSelected) Navy900 else White60,
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
        shape = MaterialTheme.shapes.medium,
        colors = CardDefaults.cardColors(containerColor = Navy700)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Icon
            Surface(
                shape = MaterialTheme.shapes.small,
                color = Gold400.copy(alpha = 0.12f),
                modifier = Modifier.size(48.dp)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(
                        imageVector = Icons.Filled.Description,
                        contentDescription = null,
                        tint = Gold400,
                        modifier = Modifier.size(24.dp)
                    )
                }
            }
            
            Spacer(modifier = Modifier.width(16.dp))
            
            // Content
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = data.judul,
                    color = White,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = data.pembayaran?.tanggalBayar ?: data.tenggatWaktu,
                    color = White60,
                    style = MaterialTheme.typography.bodySmall
                )
                Spacer(modifier = Modifier.height(4.dp))
                val formatter = NumberFormat.getCurrencyInstance(Locale("id", "ID"))
                formatter.maximumFractionDigits = 0
                val amountStr = formatter.format(data.nominal).replace("Rp", "Rp ")
                Text(
                    text = amountStr,
                    color = Gold400,
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold
                )
            }
            
            // Status Pill
            val isSuccess = data.statusBayar == "LUNAS"
            val statusText = if (isSuccess) "BERHASIL" else "MENUNGGU"
            Surface(
                shape = CircleShape,
                color = if (isSuccess) StatusLunasContainer else StatusPendingContainer
            ) {
                Text(
                    text = statusText,
                    color = if (isSuccess) StatusLunas else StatusPending,
                    style = MaterialTheme.typography.labelSmall,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                )
            }
        }
    }
}
