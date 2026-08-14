package com.ekomitepintar.ui.dashboard

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.Canvas
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.border
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.ekomitepintar.model.Tagihan
import com.ekomitepintar.model.TagihanSummary
import com.ekomitepintar.ui.components.BottomNavBar
import com.ekomitepintar.ui.navigation.Routes
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
    onNavigateToTransparansi: () -> Unit,
    onNavigateBottomTab: (String) -> Unit
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
                    containerColor = Navy800.copy(alpha = 0.9f),
                    contentColor = White,
                    actionColor = Gold400,
                    shape = MaterialTheme.shapes.medium
                )
            }
        },
        topBar = {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 12.dp),
                horizontalArrangement = Arrangement.End,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Bell Icon with Dot
                Box(contentAlignment = Alignment.TopEnd) {
                    IconButton(onClick = { onNavigateBottomTab(Routes.NOTIFIKASI) }) {
                        Icon(
                            Icons.Filled.Notifications,
                            contentDescription = "Notifications",
                            tint = White,
                            modifier = Modifier.size(26.dp)
                        )
                    }
                }
                Spacer(modifier = Modifier.width(8.dp))
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .clip(CircleShape)
                        .border(2.dp, Gold400, CircleShape)
                        .background(Navy700)
                        .clickable { onNavigateBottomTab(Routes.PROFIL) },
                    contentAlignment = Alignment.Center
                ) {
                    if (uiState.fotoProfil != null) {
                        AsyncImage(
                            model = ImageRequest.Builder(LocalContext.current)
                                .data(uiState.fotoProfil)
                                .crossfade(true)
                                .build(),
                            contentDescription = "Foto Profil",
                            contentScale = ContentScale.Crop,
                            modifier = Modifier.fillMaxSize()
                        )
                    } else {
                        Icon(
                            Icons.Filled.Person,
                            contentDescription = "Profile",
                            tint = White,
                            modifier = Modifier.size(24.dp)
                        )
                    }
                }
            }
        },
        bottomBar = {
            BottomNavBar(
                currentRoute = Routes.DASHBOARD,
                onNavigate = onNavigateBottomTab
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
            // Background Glowing Orbs
            Box(modifier = Modifier.fillMaxSize()) {
                Canvas(modifier = Modifier.fillMaxSize()) {
                    drawCircle(
                        brush = Brush.radialGradient(
                            colors = listOf(BlueGlow.copy(alpha = 0.35f), Color.Transparent),
                            center = androidx.compose.ui.geometry.Offset(size.width * -0.1f, size.height * -0.1f),
                            radius = size.width * 0.8f
                        )
                    )
                    drawCircle(
                        brush = Brush.radialGradient(
                            colors = listOf(PurpleGlow.copy(alpha = 0.3f), Color.Transparent),
                            center = androidx.compose.ui.geometry.Offset(size.width * 1.1f, size.height * 0.6f),
                            radius = size.width * 0.7f
                        )
                    )
                }
            }

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
                            SummarySection(summary = summary, tagihanList = uiState.tagihanList)
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
                                shape = MaterialTheme.shapes.large,
                                colors = CardDefaults.cardColors(containerColor = Navy800.copy(alpha = 0.5f)),
                                border = androidx.compose.foundation.BorderStroke(1.dp, White10),
                                onClick = onNavigateToVoting
                            ) {
                                Row(
                                    modifier = Modifier.padding(16.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    // Gradient Icon Box
                                    Box(
                                        modifier = Modifier
                                            .size(48.dp)
                                            .clip(CircleShape)
                                            .background(Brush.linearGradient(listOf(Gold300, Gold500))),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Icon(
                                            Icons.Filled.HowToVote,
                                            contentDescription = "E-Voting",
                                            tint = Navy900,
                                            modifier = Modifier.size(28.dp)
                                        )
                                    }
                                    Spacer(modifier = Modifier.width(16.dp))
                                    Column {
                                        Text(
                                            text = "E-Voting Komite",
                                            style = MaterialTheme.typography.titleMedium,
                                            color = White,
                                            fontWeight = FontWeight.Bold
                                        )
                                        Text(
                                            text = "Beri suara untuk keputusan sekolah",
                                            style = MaterialTheme.typography.bodySmall,
                                            color = White60
                                        )
                                    }
                                }
                            }
                            
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                shape = MaterialTheme.shapes.large,
                                colors = CardDefaults.cardColors(containerColor = Navy800.copy(alpha = 0.5f)),
                                border = androidx.compose.foundation.BorderStroke(1.dp, White10),
                                onClick = onNavigateToTransparansi
                            ) {
                                Row(
                                    modifier = Modifier.padding(16.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .size(48.dp)
                                            .clip(CircleShape)
                                            .background(Brush.linearGradient(listOf(Color(0xFF64B5F6), Color(0xFF1E88E5)))),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Icon(
                                            Icons.Filled.AccountBalanceWallet,
                                            contentDescription = "Transparansi",
                                            tint = Navy900,
                                            modifier = Modifier.size(28.dp)
                                        )
                                    }
                                    Spacer(modifier = Modifier.width(16.dp))
                                    Column {
                                        Text(
                                            text = "Transparansi Keuangan",
                                            style = MaterialTheme.typography.titleMedium,
                                            color = White,
                                            fontWeight = FontWeight.Bold
                                        )
                                        Text(
                                            text = "Lihat laporan kas & pengeluaran komite",
                                            style = MaterialTheme.typography.bodySmall,
                                            color = White60
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
                            fontWeight = FontWeight.SemiBold,
                            modifier = Modifier.weight(1f)
                        )
                        var expandedFilter by remember { mutableStateOf(false) }
                        Box {
                            IconButton(onClick = { expandedFilter = true }) {
                                Icon(
                                    Icons.Filled.FilterList,
                                    contentDescription = "Filter",
                                    tint = if (uiState.currentFilter == "Semua") White60 else Gold400
                                )
                            }
                            DropdownMenu(
                                expanded = expandedFilter,
                                onDismissRequest = { expandedFilter = false },
                                modifier = Modifier.background(Navy700)
                            ) {
                                listOf("Semua", "Belum Bayar", "Lunas").forEach { filterOption ->
                                    DropdownMenuItem(
                                        text = {
                                            Text(
                                                text = filterOption,
                                                color = if (uiState.currentFilter == filterOption) Gold400 else White,
                                                fontWeight = if (uiState.currentFilter == filterOption) FontWeight.Bold else FontWeight.Normal
                                            )
                                        },
                                        onClick = {
                                            viewModel.setFilter(filterOption)
                                            expandedFilter = false
                                        }
                                    )
                                }
                            }
                        }
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
private fun SummarySection(summary: TagihanSummary, tagihanList: List<Tagihan>) {
    val totalItems = tagihanList.size
    val lunasItems = tagihanList.count { it.statusBayar == "LUNAS" }
    val belumItems = tagihanList.count { it.statusBayar != "LUNAS" }

    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        SummaryMiniCard(
            modifier = Modifier.weight(1f),
            icon = Icons.Filled.Description,
            value = formatRupiah(summary.totalTagihan.toDouble()),
            subtitle = "$totalItems Item",
            label = "Total",
            badgeCount = totalItems.toString(),
            badgeColor = Gold400,
            accentColor = Gold400,
            containerColor = Gold400.copy(alpha = 0.12f)
        )
        SummaryMiniCard(
            modifier = Modifier.weight(1f),
            icon = Icons.Filled.CheckCircle,
            value = formatRupiah(summary.lunas.toDouble()),
            subtitle = "$lunasItems Item",
            label = "Lunas",
            badgeCount = lunasItems.toString(),
            badgeColor = StatusLunas,
            accentColor = StatusLunas,
            containerColor = StatusLunas.copy(alpha = 0.12f)
        )
        SummaryMiniCard(
            modifier = Modifier.weight(1f),
            icon = Icons.Filled.Warning,
            value = formatRupiah((summary.pending + summary.belumBayar).toDouble()),
            subtitle = "$belumItems Item",
            label = "Belum",
            badgeCount = belumItems.toString(),
            badgeColor = StatusBelumBayar,
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
    subtitle: String,
    label: String,
    badgeCount: String,
    badgeColor: Color,
    accentColor: Color,
    containerColor: Color
) {
    Surface(
        modifier = modifier.wrapContentHeight(),
        shape = MaterialTheme.shapes.medium,
        color = Navy800.copy(alpha = 0.5f),
        border = androidx.compose.foundation.BorderStroke(1.dp, White5),
        tonalElevation = 0.dp,
        shadowElevation = 0.dp
    ) {
        Column(
            modifier = Modifier.padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            // Icon with Badge
            Box(contentAlignment = Alignment.TopEnd) {
                Surface(
                    shape = MaterialTheme.shapes.medium,
                    color = containerColor,
                    modifier = Modifier.size(44.dp)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(
                            icon,
                            contentDescription = null,
                            tint = accentColor,
                            modifier = Modifier.size(24.dp)
                        )
                    }
                }
                // Badge
                Box(
                    modifier = Modifier
                        .offset(x = 6.dp, y = (-6).dp)
                        .size(20.dp)
                        .clip(CircleShape)
                        .background(badgeColor),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = badgeCount,
                        style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp),
                        color = Navy900,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
            Spacer(modifier = Modifier.height(12.dp))
            
            // Label Row (Total >)
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = label,
                    style = MaterialTheme.typography.titleMedium,
                    color = White,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.width(4.dp))
                Icon(
                    Icons.Filled.ChevronRight,
                    contentDescription = null,
                    tint = White60,
                    modifier = Modifier.size(16.dp)
                )
            }
            
            Spacer(modifier = Modifier.height(2.dp))
            
            // Subtitle (5 Item)
            Text(
                text = subtitle,
                style = MaterialTheme.typography.labelMedium,
                color = White60
            )
            
            Spacer(modifier = Modifier.height(4.dp))
            
            // Value (Rp 200.000)
            Text(
                text = value,
                style = MaterialTheme.typography.titleSmall,
                color = White,
                fontWeight = FontWeight.SemiBold
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
    val isTerlambat = tagihan.statusBayar == "TERLAMBAT"
    
    val statusColor = when {
        isLunas -> StatusLunas
        tagihan.statusBayar == "PENDING" -> StatusPending
        else -> StatusBelumBayar
    }
    val statusContainerColor = when {
        isLunas -> StatusLunasContainer
        tagihan.statusBayar == "PENDING" -> StatusPendingContainer
        else -> StatusBelumBayarContainer
    }
    val statusText = when {
        isLunas -> "LUNAS"
        tagihan.statusBayar == "PENDING" -> "PENDING"
        isTerlambat -> "TERLAMBAT"
        else -> "BELUM BAYAR"
    }

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = MaterialTheme.shapes.large,
        colors = CardDefaults.cardColors(
            containerColor = Navy800.copy(alpha = 0.6f)
        ),
        border = androidx.compose.foundation.BorderStroke(1.dp, White10),
        elevation = CardDefaults.cardElevation(
            defaultElevation = 0.dp
        )
    ) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(start = 20.dp, top = 20.dp, bottom = 20.dp, end = 20.dp),
            verticalAlignment = Alignment.Top
        ) {
            
            Column(
                modifier = Modifier.weight(1f)
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
    
                Spacer(modifier = Modifier.height(12.dp))
    
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
    
                    Button(
                        onClick = onBayarClicked,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(48.dp)
                            .background(
                                brush = Brush.linearGradient(listOf(Gold300, Gold500)),
                                shape = CircleShape
                            ),
                        shape = CircleShape,
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color.Transparent,
                            contentColor = Navy900
                        ),
                        contentPadding = PaddingValues(),
                        elevation = ButtonDefaults.buttonElevation(
                            defaultElevation = 0.dp,
                            pressedElevation = 0.dp
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
