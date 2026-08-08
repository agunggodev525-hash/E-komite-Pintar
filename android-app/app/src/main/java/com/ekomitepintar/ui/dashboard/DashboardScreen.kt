package com.ekomitepintar.ui.dashboard

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Logout
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.rounded.Payments
import androidx.compose.material.icons.rounded.Receipt
import androidx.compose.material3.*
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.ekomitepintar.model.Tagihan
import com.ekomitepintar.model.TagihanSummary
import com.ekomitepintar.ui.theme.*
import com.ekomitepintar.viewmodel.DashboardViewModel
import kotlinx.coroutines.delay
import java.text.NumberFormat
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    viewModel: DashboardViewModel,
    onLogout: () -> Unit,
    onNavigateToVoting: () -> Unit,
    onNavigateToPayment: (String) -> Unit,
    onNavigateToTransparansi: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    // Navigate on logout
    LaunchedEffect(uiState.isLoggedOut) {
        if (uiState.isLoggedOut) onLogout()
    }

    // Snackbar state for general errors if needed
    val snackbarHostState = remember { SnackbarHostState() }

    // Navigate on checkout token
    LaunchedEffect(uiState.checkoutUrl) {
        uiState.checkoutUrl?.let { url ->
            val encodedUrl = java.net.URLEncoder.encode(url, "UTF-8")
            onNavigateToPayment(encodedUrl)
            viewModel.clearCheckoutUrl()
        }
    }

    // Tampilkan error di Snackbar jika ada
    LaunchedEffect(uiState.errorMessage) {
        uiState.errorMessage?.let { msg ->
            if (uiState.tagihanList.isNotEmpty()) {
                snackbarHostState.showSnackbar(msg)
                viewModel.clearError()
            }
        }
    }

    // Animasi masuk & Load Data Awal
    var showContent by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) {
        viewModel.loadTagihan("dummy-siswa-id")
        delay(100)
        showContent = true
    }

    Scaffold(
        containerColor = Navy900,
        snackbarHost = {
            SnackbarHost(snackbarHostState) { data ->
                Snackbar(
                    snackbarData = data,
                    containerColor = Navy600,
                    contentColor = White,
                    actionColor = Gold400,
                    shape = MaterialTheme.shapes.medium
                )
            }
        },
        topBar = {
            TopAppBar(
                title = {},
                actions = {
                    IconButton(onClick = viewModel::onLogout) {
                        Icon(
                            Icons.AutoMirrored.Filled.Logout,
                            contentDescription = "Logout",
                            tint = White60
                        )
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
            onRefresh = {
                // TODO: ganti dengan siswaId yang sebenarnya
                viewModel.onRefresh("dummy-siswa-id")
            },
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(horizontal = 20.dp, vertical = 8.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // ============================================
                // Header: Sapaan
                // ============================================
                item {
                    AnimatedVisibility(
                        visible = showContent,
                        enter = fadeIn() + slideInVertically(initialOffsetY = { -30 })
                    ) {
                        GreetingSection(userName = uiState.userName)
                    }
                }

                // ============================================
                // Summary Cards
                // ============================================
                item {
                    AnimatedVisibility(
                        visible = showContent,
                        enter = fadeIn() + slideInVertically(initialOffsetY = { 40 })
                    ) {
                        uiState.summary?.let { summary ->
                            SummarySection(summary = summary)
                        } ?: SummaryPlaceholder()
                    }
                }

                // ============================================
                // Menu E-Voting & Transparansi
                // ============================================
                item {
                    AnimatedVisibility(
                        visible = showContent,
                        enter = fadeIn() + slideInVertically(initialOffsetY = { 50 })
                    ) {
                        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                shape = MaterialTheme.shapes.medium,
                                colors = CardDefaults.cardColors(containerColor = Gold400),
                                onClick = onNavigateToVoting
                            ) {
                                Row(
                                    modifier = Modifier.padding(16.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(
                                        Icons.Filled.HowToVote,
                                        contentDescription = "E-Voting",
                                        tint = Navy900,
                                        modifier = Modifier.size(32.dp)
                                    )
                                    Spacer(modifier = Modifier.width(16.dp))
                                    Column {
                                        Text(
                                            text = "E-Voting Komite",
                                            style = MaterialTheme.typography.titleMedium,
                                            color = Navy900,
                                            fontWeight = FontWeight.Bold
                                        )
                                        Text(
                                            text = "Beri suara untuk keputusan sekolah",
                                            style = MaterialTheme.typography.bodySmall,
                                            color = Navy900.copy(alpha = 0.8f)
                                        )
                                    }
                                }
                            }
                            
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                shape = MaterialTheme.shapes.medium,
                                colors = CardDefaults.cardColors(containerColor = White),
                                onClick = onNavigateToTransparansi
                            ) {
                                Row(
                                    modifier = Modifier.padding(16.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(
                                        Icons.Filled.AccountBalanceWallet,
                                        contentDescription = "Transparansi",
                                        tint = Navy900,
                                        modifier = Modifier.size(32.dp)
                                    )
                                    Spacer(modifier = Modifier.width(16.dp))
                                    Column {
                                        Text(
                                            text = "Transparansi Keuangan",
                                            style = MaterialTheme.typography.titleMedium,
                                            color = Navy900,
                                            fontWeight = FontWeight.Bold
                                        )
                                        Text(
                                            text = "Lihat laporan kas & pengeluaran komite",
                                            style = MaterialTheme.typography.bodySmall,
                                            color = Navy900.copy(alpha = 0.8f)
                                        )
                                    }
                                }
                            }
                        }
                    }
                }

                // ============================================
                // Section Header: Tagihan Aktif
                // ============================================
                item {
                    Spacer(modifier = Modifier.height(4.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            Icons.Rounded.Receipt,
                            contentDescription = null,
                            tint = Gold400,
                            modifier = Modifier.size(22.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Tagihan Aktif",
                            style = MaterialTheme.typography.titleLarge,
                            color = White,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }

                // ============================================
                // Loading State
                // ============================================
                if (uiState.isLoading && uiState.tagihanList.isEmpty()) {
                    item {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(200.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            CircularProgressIndicator(
                                color = Gold400,
                                strokeWidth = 3.dp
                            )
                        }
                    }
                }

                // ============================================
                // Error State
                // ============================================
                if (uiState.errorMessage != null && uiState.tagihanList.isEmpty()) {
                    item {
                        ErrorCard(
                            message = uiState.errorMessage!!,
                            onRetry = { viewModel.loadTagihan("dummy-siswa-id") }
                        )
                    }
                }

                // ============================================
                // Empty State
                // ============================================
                if (!uiState.isLoading && uiState.tagihanList.isEmpty() && uiState.errorMessage == null) {
                    item {
                        EmptyState()
                    }
                }

                // ============================================
                // Tagihan Cards
                // ============================================
                itemsIndexed(
                    items = uiState.tagihanList,
                    key = { _, tagihan -> tagihan.id }
                ) { index, tagihan ->
                    AnimatedVisibility(
                        visible = showContent,
                        enter = fadeIn(initialAlpha = 0f) + slideInVertically(
                            initialOffsetY = { 80 + (index * 20) }
                        )
                    ) {
                        TagihanCard(
                            tagihan = tagihan,
                            onBayarClicked = {
                                viewModel.onBayarClicked(tagihan.id, "dummy-siswa-id")
                            }
                        )
                    }
                }

                // Bottom spacing
                item { Spacer(modifier = Modifier.height(24.dp)) }
            }
        }
    }
}

// ============================================
// Greeting Section
// ============================================
@Composable
private fun GreetingSection(userName: String) {
    Column {
        Text(
            text = "Halo, $userName! 👋",
            style = MaterialTheme.typography.headlineLarge,
            color = White,
            fontWeight = FontWeight.Bold
        )
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            text = "Berikut ringkasan tagihan anak Anda",
            style = MaterialTheme.typography.bodyLarge,
            color = White60
        )
    }
}

// ============================================
// Summary Section — 3 mini cards
// ============================================
@Composable
private fun SummarySection(summary: TagihanSummary) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        SummaryMiniCard(
            modifier = Modifier.weight(1f),
            icon = Icons.Filled.Description,
            value = summary.totalTagihan.toString(),
            label = "Total",
            accentColor = Gold400,
            containerColor = Gold400.copy(alpha = 0.12f)
        )
        SummaryMiniCard(
            modifier = Modifier.weight(1f),
            icon = Icons.Filled.CheckCircle,
            value = summary.lunas.toString(),
            label = "Lunas",
            accentColor = StatusLunas,
            containerColor = StatusLunas.copy(alpha = 0.12f)
        )
        SummaryMiniCard(
            modifier = Modifier.weight(1f),
            icon = Icons.Filled.Warning,
            value = (summary.pending + summary.belumBayar).toString(),
            label = "Belum",
            accentColor = StatusBelumBayar,
            containerColor = StatusBelumBayar.copy(alpha = 0.12f)
        )
    }
}

@Composable
private fun SummaryMiniCard(
    modifier: Modifier = Modifier,
    icon: ImageVector,
    value: String,
    label: String,
    accentColor: Color,
    containerColor: Color
) {
    Surface(
        modifier = modifier,
        shape = MaterialTheme.shapes.medium,
        color = Navy700,
        tonalElevation = 2.dp,
        shadowElevation = 4.dp
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Surface(
                shape = MaterialTheme.shapes.small,
                color = containerColor,
                modifier = Modifier.size(40.dp)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(
                        icon,
                        contentDescription = null,
                        tint = accentColor,
                        modifier = Modifier.size(22.dp)
                    )
                }
            }
            Spacer(modifier = Modifier.height(10.dp))
            Text(
                text = value,
                style = MaterialTheme.typography.headlineMedium,
                color = White,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = label,
                style = MaterialTheme.typography.labelMedium,
                color = White60
            )
        }
    }
}

@Composable
private fun SummaryPlaceholder() {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        repeat(3) {
            Surface(
                modifier = Modifier
                    .weight(1f)
                    .height(110.dp),
                shape = MaterialTheme.shapes.medium,
                color = Navy700.copy(alpha = 0.5f)
            ) {}
        }
    }
}

// ============================================
// Tagihan Card — Floating Material3 Card
// ============================================
@Composable
private fun TagihanCard(
    tagihan: Tagihan,
    onBayarClicked: () -> Unit
) {
    val isLunas = tagihan.statusBayar == "LUNAS"
    val statusColor = when (tagihan.statusBayar) {
        "LUNAS" -> StatusLunas
        "PENDING" -> StatusPending
        else -> StatusBelumBayar
    }
    val statusContainerColor = when (tagihan.statusBayar) {
        "LUNAS" -> StatusLunasContainer
        "PENDING" -> StatusPendingContainer
        else -> StatusBelumBayarContainer
    }
    val statusText = when (tagihan.statusBayar) {
        "LUNAS" -> "LUNAS"
        "PENDING" -> "PENDING"
        else -> "BELUM BAYAR"
    }

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = MaterialTheme.shapes.large,
        colors = CardDefaults.cardColors(
            containerColor = Navy700
        ),
        elevation = CardDefaults.cardElevation(
            defaultElevation = 8.dp,
            pressedElevation = 4.dp
        )
    ) {
        Column(
            modifier = Modifier.padding(20.dp)
        ) {
            // Row 1: Judul + Status Badge
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = tagihan.judul,
                    style = MaterialTheme.typography.titleMedium,
                    color = White,
                    fontWeight = FontWeight.SemiBold,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.weight(1f)
                )
                Spacer(modifier = Modifier.width(12.dp))
                Surface(
                    shape = MaterialTheme.shapes.small,
                    color = statusContainerColor
                ) {
                    Text(
                        text = statusText,
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                        style = MaterialTheme.typography.labelSmall,
                        color = statusColor,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Row 2: Nominal (besar, emas)
            Text(
                text = formatRupiah(tagihan.nominal),
                style = MaterialTheme.typography.headlineMedium,
                color = Gold400,
                fontWeight = FontWeight.Bold
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Row 3: Tenggat waktu
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    Icons.Filled.CalendarToday,
                    contentDescription = null,
                    tint = White40,
                    modifier = Modifier.size(16.dp)
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = "Tenggat: ${formatDate(tagihan.tenggatWaktu)}",
                    style = MaterialTheme.typography.bodyMedium,
                    color = White60
                )
            }

            // Tombol Bayar — hanya tampil jika BELUM LUNAS
            if (!isLunas) {
                Spacer(modifier = Modifier.height(20.dp))

                HorizontalDivider(color = DividerColor)

                Spacer(modifier = Modifier.height(16.dp))

                Button(
                    onClick = onBayarClicked,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp),
                    shape = MaterialTheme.shapes.medium,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Gold400,
                        contentColor = Navy900
                    ),
                    elevation = ButtonDefaults.buttonElevation(
                        defaultElevation = 6.dp,
                        pressedElevation = 2.dp
                    )
                ) {
                    Icon(
                        Icons.Rounded.Payments,
                        contentDescription = null,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Bayar Sekarang",
                        style = MaterialTheme.typography.labelLarge,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}

// ============================================
// Error Card
// ============================================
@Composable
private fun ErrorCard(message: String, onRetry: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = MaterialTheme.shapes.large,
        colors = CardDefaults.cardColors(containerColor = Navy700)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(28.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                Icons.Filled.CloudOff,
                contentDescription = null,
                tint = ErrorRed,
                modifier = Modifier.size(48.dp)
            )
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = message,
                style = MaterialTheme.typography.bodyMedium,
                color = White80,
                textAlign = androidx.compose.ui.text.style.TextAlign.Center
            )
            Spacer(modifier = Modifier.height(20.dp))
            OutlinedButton(
                onClick = onRetry,
                colors = ButtonDefaults.outlinedButtonColors(contentColor = Gold400),
                border = ButtonDefaults.outlinedButtonBorder(enabled = true).copy(
                    brush = Brush.linearGradient(listOf(Gold400, Gold300))
                )
            ) {
                Text("Coba Lagi")
            }
        }
    }
}

// ============================================
// Empty State
// ============================================
@Composable
private fun EmptyState() {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = MaterialTheme.shapes.large,
        colors = CardDefaults.cardColors(containerColor = Navy700)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(40.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                Icons.Filled.CheckCircle,
                contentDescription = null,
                tint = StatusLunas,
                modifier = Modifier.size(56.dp)
            )
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = "Tidak ada tagihan",
                style = MaterialTheme.typography.titleMedium,
                color = White,
                fontWeight = FontWeight.SemiBold
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "Semua tagihan sudah terbayar 🎉",
                style = MaterialTheme.typography.bodyMedium,
                color = White60
            )
        }
    }
}

// ============================================
// Utility Functions
// ============================================

/**
 * Format angka ke format Rupiah: Rp 1.500.000
 */
private fun formatRupiah(amount: Double): String {
    val formatter = NumberFormat.getCurrencyInstance(Locale("id", "ID"))
    return formatter.format(amount).replace(",00", "")
}

/**
 * Format ISO date string ke format Indonesia: 15 Agustus 2026
 */
private fun formatDate(isoDate: String): String {
    return try {
        val inputFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault())
        val outputFormat = SimpleDateFormat("dd MMMM yyyy", Locale("id", "ID"))
        val date = inputFormat.parse(isoDate)
        date?.let { outputFormat.format(it) } ?: isoDate
    } catch (e: Exception) {
        try {
            val inputFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
            val outputFormat = SimpleDateFormat("dd MMMM yyyy", Locale("id", "ID"))
            val date = inputFormat.parse(isoDate)
            date?.let { outputFormat.format(it) } ?: isoDate
        } catch (e2: Exception) {
            isoDate
        }
    }
}
