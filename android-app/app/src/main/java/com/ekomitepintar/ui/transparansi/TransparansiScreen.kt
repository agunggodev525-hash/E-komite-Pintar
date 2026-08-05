package com.ekomitepintar.ui.transparansi

import androidx.compose.animation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.ArrowDownward
import androidx.compose.material.icons.filled.ArrowUpward
import androidx.compose.material3.*
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.ekomitepintar.model.TransparansiData
import com.ekomitepintar.model.TransparansiHistory
import com.ekomitepintar.ui.theme.*
import com.ekomitepintar.viewmodel.TransparansiViewModel
import kotlinx.coroutines.delay
import java.text.NumberFormat
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TransparansiScreen(
    viewModel: TransparansiViewModel,
    onNavigateBack: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    var showContent by remember { mutableStateOf(false) }
    
    LaunchedEffect(uiState.data) {
        if (uiState.data != null) {
            delay(100)
            showContent = true
        }
    }

    Scaffold(
        containerColor = Navy900,
        topBar = {
            TopAppBar(
                title = { 
                    Text("Transparansi Dana", color = White, fontWeight = FontWeight.Bold) 
                },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Kembali", tint = White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color.Transparent
                )
            )
        }
    ) { paddingValues ->
        PullToRefreshBox(
            isRefreshing = uiState.isRefreshing,
            onRefresh = viewModel::onRefresh,
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            if (uiState.isLoading && uiState.data == null) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = Gold400)
                }
            } else if (uiState.errorMessage != null && uiState.data == null) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text(text = uiState.errorMessage!!, color = ErrorRed)
                }
            } else if (uiState.data != null) {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(horizontal = 20.dp, vertical = 8.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    // Summary Section
                    item {
                        AnimatedVisibility(
                            visible = showContent,
                            enter = fadeIn() + slideInVertically(initialOffsetY = { -30 })
                        ) {
                            TransparansiSummaryCard(uiState.data!!)
                        }
                    }

                    // Riwayat Transaksi Header
                    item {
                        AnimatedVisibility(
                            visible = showContent,
                            enter = fadeIn() + slideInVertically(initialOffsetY = { 30 })
                        ) {
                            Text(
                                text = "Riwayat Transaksi",
                                style = MaterialTheme.typography.titleMedium,
                                color = White,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(top = 8.dp)
                            )
                        }
                    }

                    // Transaksi Items
                    if (uiState.data!!.history.isEmpty()) {
                        item {
                            Text(
                                text = "Belum ada transaksi.",
                                color = White60,
                                modifier = Modifier.padding(top = 16.dp)
                            )
                        }
                    } else {
                        itemsIndexed(
                            items = uiState.data!!.history,
                            key = { _, item -> item.id + item.jenis }
                        ) { index, item ->
                            AnimatedVisibility(
                                visible = showContent,
                                enter = fadeIn() + slideInVertically(initialOffsetY = { 50 + (index * 20) })
                            ) {
                                TransaksiCard(item)
                            }
                        }
                    }
                    
                    item { Spacer(modifier = Modifier.height(24.dp)) }
                }
            }
        }
    }
}

@Composable
fun TransparansiSummaryCard(data: TransparansiData) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = MaterialTheme.shapes.large,
        colors = CardDefaults.cardColors(containerColor = Navy700)
    ) {
        Column(modifier = Modifier.padding(20.dp)) {
            Text(
                text = "Saldo Kas Komite",
                style = MaterialTheme.typography.bodyMedium,
                color = White60
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = formatRupiah(data.saldoAkhir),
                style = MaterialTheme.typography.headlineLarge,
                color = Gold400,
                fontWeight = FontWeight.Bold
            )
            
            Spacer(modifier = Modifier.height(24.dp))
            
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Column(modifier = Modifier.weight(1f)) {
                    Text("Pemasukan", color = White60, style = MaterialTheme.typography.labelMedium)
                    Text(
                        text = formatRupiah(data.totalPemasukan), 
                        color = StatusLunas, 
                        fontWeight = FontWeight.Bold
                    )
                }
                Column(modifier = Modifier.weight(1f), horizontalAlignment = Alignment.End) {
                    Text("Pengeluaran", color = White60, style = MaterialTheme.typography.labelMedium)
                    Text(
                        text = formatRupiah(data.totalPengeluaran), 
                        color = StatusBelumBayar, 
                        fontWeight = FontWeight.Bold
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Progress Bar
            val totalDana = data.totalPemasukan
            val terpakai = data.totalPengeluaran
            val percentage = if (totalDana > 0) (terpakai / totalDana).toFloat() else 0f
            
            LinearProgressIndicator(
                progress = { percentage },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(8.dp),
                color = StatusBelumBayar,
                trackColor = StatusLunas,
            )
            Spacer(modifier = Modifier.height(8.dp))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text("${(percentage * 100).toInt()}% Terpakai", color = StatusBelumBayar, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                Text("${((1 - percentage) * 100).toInt()}% Tersisa", color = StatusLunas, fontSize = 10.sp, fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
fun TransaksiCard(item: TransparansiHistory) {
    val isPemasukan = item.jenis == "PEMASUKAN"
    val icon = if (isPemasukan) Icons.Filled.ArrowDownward else Icons.Filled.ArrowUpward
    val color = if (isPemasukan) StatusLunas else StatusBelumBayar
    val containerColor = if (isPemasukan) StatusLunasContainer else StatusBelumBayarContainer

    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = Navy700),
        shape = MaterialTheme.shapes.medium
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Surface(
                shape = CircleShape,
                color = containerColor,
                modifier = Modifier.size(48.dp)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(icon, contentDescription = null, tint = color)
                }
            }
            Spacer(modifier = Modifier.width(16.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = item.keterangan,
                    style = MaterialTheme.typography.bodyLarge,
                    color = White,
                    fontWeight = FontWeight.Bold,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Spacer(modifier = Modifier.height(4.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = formatDate(item.tanggal),
                        style = MaterialTheme.typography.bodySmall,
                        color = White60
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = item.jenis,
                        style = MaterialTheme.typography.labelSmall,
                        color = color
                    )
                }
            }
            Spacer(modifier = Modifier.width(16.dp))
            Text(
                text = "${if(isPemasukan) "+" else "-"}${formatRupiah(item.nominal)}",
                style = MaterialTheme.typography.titleMedium,
                color = color,
                fontWeight = FontWeight.Bold
            )
        }
    }
}

private fun formatRupiah(amount: Double): String {
    val formatter = NumberFormat.getCurrencyInstance(Locale("id", "ID"))
    return formatter.format(amount).replace(",00", "")
}

private fun formatDate(isoDate: String): String {
    return try {
        val inputFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        val outputFormat = SimpleDateFormat("dd MMM yyyy", Locale("id", "ID"))
        val date = inputFormat.parse(isoDate.take(10))
        date?.let { outputFormat.format(it) } ?: isoDate
    } catch (_: Exception) {
        isoDate
    }
}
