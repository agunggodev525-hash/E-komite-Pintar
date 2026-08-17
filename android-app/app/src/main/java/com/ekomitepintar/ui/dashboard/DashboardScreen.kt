package com.ekomitepintar.ui.dashboard

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.rounded.Payments
import androidx.compose.material.icons.rounded.Receipt
import androidx.compose.material3.*
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
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
import com.ekomitepintar.ui.components.shimmerEffect
import com.ekomitepintar.ui.navigation.Routes
import com.ekomitepintar.ui.theme.*
import com.ekomitepintar.viewmodel.DashboardViewModel
import kotlinx.coroutines.delay
import java.text.NumberFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    viewModel: DashboardViewModel,
    onLogout: () -> Unit,
    onNavigateToVoting: () -> Unit,
    onNavigateToPayment: (String) -> Unit,
    onNavigateToTransparansi: () -> Unit,
    onNavigateToNotifikasi: () -> Unit,
    onNavigateBottomTab: (String) -> Unit
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val context = LocalContext.current

    LaunchedEffect(uiState.isLoggedOut) { if (uiState.isLoggedOut) onLogout() }

    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(uiState.checkoutUrl) {
        uiState.checkoutUrl?.let { url ->
            val encodedUrl = java.net.URLEncoder.encode(url, "UTF-8")
            onNavigateToPayment(encodedUrl)
            viewModel.clearCheckoutUrl()
        }
    }

    var showContent by remember { mutableStateOf(false) }
    var showDonasiDialog by remember { mutableStateOf(false) }
    
    LaunchedEffect(Unit) {
        viewModel.loadTagihan("dummy-siswa-id")
        delay(100)
        showContent = true
    }

    Scaffold(
        containerColor = BackgroundLight,
        snackbarHost = { SnackbarHost(snackbarHostState) },
        bottomBar = {
            BottomNavBar(
                currentRoute = Routes.DASHBOARD,
                onNavigate = onNavigateBottomTab
            )
        }
    ) { paddingValues ->
        PullToRefreshBox(
            isRefreshing = uiState.isRefreshing,
            onRefresh = { viewModel.onRefresh("dummy-siswa-id") },
            modifier = Modifier.fillMaxSize().padding(paddingValues)
        ) {
            val pendingTagihan = uiState.tagihanList.firstOrNull { it.statusBayar == "PENDING" || it.statusBayar == "BELUM_BAYAR" }
            val otherTagihan = uiState.tagihanList.filter { it.id != pendingTagihan?.id && (it.statusBayar == "PENDING" || it.statusBayar == "BELUM_BAYAR") }

            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(bottom = 120.dp),
                verticalArrangement = Arrangement.spacedBy(24.dp)
            ) {
                // Header (Emerald Gradient) + Urgent Tagihan (Overlap)
                item {
                    // True Z-Stack Overlapping
                    Box(modifier = Modifier.fillMaxWidth()) {
                        // LAYER BAWAH (Z-Index 0): Background Hijau
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(220.dp)
                                .background(Brush.linearGradient(listOf(Color(0xFF10B981), Color(0xFF059669), Color(0xFF0D9488))))
                        ) {
                            // Dekorasi cahaya
                            Box(
                                modifier = Modifier
                                    .size(160.dp)
                                    .offset(x = 100.dp, y = (-20).dp)
                                    .align(Alignment.TopEnd)
                                    .background(Emerald400.copy(alpha = 0.2f), CircleShape)
                            )
                        }
                        
                        // LAYER ATAS (Z-Index 1): Konten Header & Kartu
                        Column(modifier = Modifier.fillMaxWidth()) {
                            // Header Text & Avatar
                            AnimatedVisibility(visible = showContent, enter = fadeIn() + slideInVertically(initialOffsetY = { -20 })) {
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(start = 20.dp, end = 20.dp, top = 40.dp), // margin atas
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column {
                                        Text(
                                            text = "Selamat datang kembali,",
                                            style = MaterialTheme.typography.bodySmall,
                                            color = Emerald50,
                                            fontWeight = FontWeight.Medium,
                                            letterSpacing = 0.5.sp
                                        )
                                        Spacer(modifier = Modifier.height(4.dp))
                                        Text(
                                            text = uiState.userName,
                                            style = MaterialTheme.typography.titleLarge,
                                            color = Color.White,
                                            fontWeight = FontWeight.ExtraBold,
                                            fontSize = 24.sp
                                        )
                                    }
                                    
                                    Box(
                                        modifier = Modifier
                                            .size(52.dp)
                                            .shadow(12.dp, CircleShape, spotColor = Color.White, ambientColor = Color.White)
                                            .background(Color.White.copy(alpha = 0.2f), CircleShape)
                                            .clip(CircleShape)
                                            .clickable { onNavigateBottomTab(Routes.PROFIL) },
                                        contentAlignment = Alignment.Center
                                    ) {
                                        if (uiState.fotoProfil != null) {
                                            AsyncImage(
                                                model = ImageRequest.Builder(LocalContext.current)
                                                    .data(uiState.fotoProfil).crossfade(true).build(),
                                                contentDescription = "Profil",
                                                contentScale = ContentScale.Crop,
                                                modifier = Modifier.fillMaxSize()
                                            )
                                        } else {
                                            Icon(
                                                Icons.Filled.PersonOutline,
                                                contentDescription = "Profile",
                                                tint = Emerald50,
                                                modifier = Modifier.size(28.dp)
                                            )
                                        }
                                    }
                                }
                            }
                            
                            // Memberi jarak agar kartu tumpang tindih di perbatasan hijau dan abu-abu
                            Spacer(modifier = Modifier.height(32.dp))

                            // Hero Section: Kartu Tagihan (Menimpa)
                            AnimatedVisibility(visible = showContent, enter = fadeIn() + slideInVertically(initialOffsetY = { 30 })) {
                                
                                Box(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(horizontal = 20.dp)
                                ) {
                                    if (uiState.isLoading) {
                                        SkeletonHeroBillCard()
                                    } else if (pendingTagihan != null) {
                                        HeroBillCard(
                                            tagihan = pendingTagihan,
                                            onBayarClicked = { viewModel.onBayarClicked(pendingTagihan.id, "dummy-siswa-id") }
                                        )
                                    } else if (uiState.errorMessage == null) {
                                        NoUrgentBillCard()
                                    }
                                }
                            }
                        }
                    }
                }

                // Menu Utama Grid dengan SVG Heroicons
                item {
                    AnimatedVisibility(visible = showContent, enter = fadeIn() + slideInVertically(initialOffsetY = { 40 })) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 20.dp)
                        ) {
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(16.dp),
                                colors = CardDefaults.cardColors(containerColor = CardWhite),
                                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFF3F4F6)),
                                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                            ) {
                                Column(modifier = Modifier.padding(20.dp)) {
                                    Text(
                                        text = "Layanan Komite",
                                        style = MaterialTheme.typography.titleMedium,
                                        color = Slate800,
                                        fontWeight = FontWeight.Bold
                                    )
                                    Spacer(modifier = Modifier.height(16.dp))
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween
                                    ) {
                                        SuperAppServiceItem(icon = Icons.Filled.CheckBox, iconColor = Color(0xFF118EEA), label = "E-Voting", onClick = onNavigateToVoting)
                                        SuperAppServiceItem(icon = Icons.Filled.AccountBalanceWallet, iconColor = Color(0xFFF57C00), label = "Keuangan", onClick = onNavigateToTransparansi)
                                        SuperAppServiceItem(icon = Icons.Filled.FavoriteBorder, iconColor = Color(0xFFE91E63), label = "Donasi", onClick = {
                                            showDonasiDialog = true
                                        })
                                        SuperAppServiceItem(icon = Icons.Filled.NotificationsNone, iconColor = Color(0xFF9C27B0), label = "Informasi", hasBadge = true, onClick = onNavigateToNotifikasi)
                                    }
                                }
                            }
                        }
                    }
                }

                // Ringkasan Keuangan (Bawah)
                item {
                    AnimatedVisibility(visible = showContent, enter = fadeIn() + slideInVertically(initialOffsetY = { 50 })) {
                        uiState.summary?.let { summary ->
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(horizontal = 20.dp),
                                horizontalArrangement = Arrangement.spacedBy(16.dp)
                            ) {
                                SummaryCard(
                                    modifier = Modifier.weight(1f),
                                    icon = Icons.Filled.Check,
                                    iconTint = Emerald600,
                                    iconBgColor = Emerald50,
                                    iconBorderColor = Emerald100,
                                    label = "SUDAH LUNAS",
                                    amount = "${summary.lunas} Tagihan"
                                )
                                SummaryCard(
                                    modifier = Modifier.weight(1f),
                                    icon = Icons.Filled.Schedule,
                                    iconTint = Rose600,
                                    iconBgColor = Rose50,
                                    iconBorderColor = Color(0xFFFFE4E6), // Rose100
                                    label = "SISA TAGIHAN",
                                    amount = "${summary.pending + summary.belumBayar} Tagihan"
                                )
                            }
                        }
                    }
                }

                // Tagihan Lainnya
                item {
                    val pendingTagihan = uiState.tagihanList.firstOrNull { it.statusBayar == "PENDING" || it.statusBayar == "BELUM_BAYAR" }
                    val otherTagihan = uiState.tagihanList.filter { it.statusBayar != "LUNAS" && it.id != pendingTagihan?.id }
                    if (otherTagihan.isNotEmpty()) {
                        Spacer(modifier = Modifier.height(32.dp))
                        Text(
                            text = "Tagihan Lainnya",
                            style = MaterialTheme.typography.titleMedium,
                            color = Slate800,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(horizontal = 20.dp)
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                    }
                }

                itemsIndexed(
                    items = uiState.tagihanList.filter { it.statusBayar != "LUNAS" && it.id != (uiState.tagihanList.firstOrNull { t -> t.statusBayar == "PENDING" || t.statusBayar == "BELUM_BAYAR" }?.id) },
                    key = { _, tagihan -> tagihan.id }
                ) { index, tagihan ->
                    AnimatedVisibility(visible = showContent, enter = fadeIn() + slideInVertically(initialOffsetY = { 80 + (index * 20) })) {
                        Box(modifier = Modifier.padding(horizontal = 20.dp).padding(bottom = 12.dp)) {
                            OtherBillCard(
                                tagihan = tagihan,
                                onBayarClicked = { viewModel.onBayarClicked(tagihan.id, "dummy-siswa-id") }
                            )
                        }
                    }
                }
            }
        }
    }
    
    if (showDonasiDialog) {
        DonasiDialog(
            onDismiss = { showDonasiDialog = false },
            onSubmit = { nominal ->
                showDonasiDialog = false
                viewModel.onDonasiClicked("dummy-siswa-id", nominal)
            }
        )
    }
}

@Composable
fun DonasiDialog(onDismiss: () -> Unit, onSubmit: (String) -> Unit) {
    var nominal by remember { mutableStateOf("") }
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Donasi Sukarela", fontWeight = FontWeight.Bold, color = Slate800) },
        text = {
            Column {
                Text("Masukkan nominal donasi Anda untuk mendukung program komite:", color = Slate600, fontSize = 14.sp)
                Spacer(modifier = Modifier.height(16.dp))
                OutlinedTextField(
                    value = nominal,
                    onValueChange = { if (it.all { char -> char.isDigit() }) nominal = it },
                    label = { Text("Nominal (Rp)") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            Button(
                onClick = { if (nominal.isNotEmpty()) onSubmit(nominal) },
                colors = ButtonDefaults.buttonColors(containerColor = Emerald600)
            ) {
                Text("Lanjut Bayar")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Batal", color = Slate500) }
        },
        containerColor = Color.White
    )
}

@Composable
fun HeroBillCard(tagihan: Tagihan, onBayarClicked: () -> Unit) {
    var isOptimisticPaid by remember { mutableStateOf(false) }
    
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(24.dp), // rounded-3xl
        colors = CardDefaults.cardColors(containerColor = CardWhite),
        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFF3F4F6)), // border-gray-100
        elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
    ) {
        Column(modifier = Modifier.padding(24.dp)) {
            // flex justify-between items-center mb-3
            Row(
                modifier = Modifier.fillMaxWidth().padding(bottom = 12.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        Icons.Filled.Schedule,
                        contentDescription = null,
                        tint = Emerald500,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "TAGIHAN MENDESAK",
                        style = MaterialTheme.typography.labelSmall,
                        color = Slate500,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.sp
                    )
                }
                
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = if (isOptimisticPaid) Emerald50 else Rose50,
                    border = androidx.compose.foundation.BorderStroke(1.dp, if (isOptimisticPaid) Color(0xFFD1FAE5) else Color(0xFFFFE4E6))
                ) {
                    Text(
                        text = if (isOptimisticPaid) "MEMPROSES" else tagihan.statusBayar.replace("_", " "),
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                        style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp),
                        color = if (isOptimisticPaid) Emerald600 else Rose600,
                        fontWeight = FontWeight.ExtraBold
                    )
                }
            }
            
            // text-4xl font-black text-slate-800 mb-1
            Text(
                text = formatRupiah(tagihan.nominal),
                style = MaterialTheme.typography.headlineLarge,
                color = Slate800,
                fontWeight = FontWeight.Black,
                fontSize = 36.sp
            )
            
            // text-slate-400 text-sm font-medium mb-6
            Text(
                text = tagihan.judul,
                style = MaterialTheme.typography.bodySmall,
                color = Slate400,
                fontWeight = FontWeight.Medium,
                modifier = Modifier.padding(bottom = 24.dp)
            )
            
            // Tombol Aksen
            Button(
                onClick = {
                    isOptimisticPaid = true
                    onBayarClicked()
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp)
                    .background(
                        if (isOptimisticPaid) Brush.linearGradient(listOf(Slate400, Slate500))
                        else Brush.linearGradient(listOf(Emerald500, Emerald600)), 
                        RoundedCornerShape(16.dp)
                    ),
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent),
                contentPadding = PaddingValues(),
                enabled = !isOptimisticPaid
            ) {
                if (isOptimisticPaid) {
                    Icon(
                        Icons.Filled.CheckCircle,
                        contentDescription = null,
                        modifier = Modifier.size(20.dp),
                        tint = Color.White
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Berhasil, memuat...",
                        style = MaterialTheme.typography.labelLarge,
                        fontWeight = FontWeight.ExtraBold,
                        color = Color.White
                    )
                } else {
                    Icon(
                        Icons.Rounded.Payments,
                        contentDescription = null,
                        modifier = Modifier.size(20.dp),
                        tint = Color.White
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Bayar Sekarang",
                        style = MaterialTheme.typography.labelLarge,
                        fontWeight = FontWeight.ExtraBold,
                        color = Color.White
                    )
                }
            }
        }
    }
}

@Composable
fun ServiceItem(icon: ImageVector, label: String, hasBadge: Boolean = false, onClick: () -> Unit) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier.clickable { onClick() }
    ) {
        Box {
            // bg-white w-[64px] h-[64px] rounded-[18px] shadow-sm border border-gray-100
            Surface(
                modifier = Modifier.size(64.dp),
                shape = RoundedCornerShape(18.dp),
                color = CardWhite,
                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFF3F4F6)),
                shadowElevation = 2.dp
            ) {
                Box(contentAlignment = Alignment.Center, modifier = Modifier.fillMaxSize()) {
                    Icon(
                        icon,
                        contentDescription = label,
                        tint = Slate600,
                        modifier = Modifier.size(28.dp)
                    )
                }
            }
            if (hasBadge) {
                Box(
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .offset(x = (-6).dp, y = 6.dp)
                        .size(10.dp)
                        .clip(CircleShape)
                        .background(Rose600)
                        .border(2.dp, CardWhite, CircleShape)
                )
            }
        }
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = label,
            style = MaterialTheme.typography.labelSmall.copy(fontSize = 12.sp),
            color = Slate600,
            fontWeight = FontWeight.SemiBold
        )
    }
}

@Composable
fun SummaryCard(
    modifier: Modifier = Modifier,
    icon: ImageVector,
    iconTint: Color,
    iconBgColor: Color,
    iconBorderColor: Color,
    label: String,
    amount: String
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(16.dp), // rounded-2xl
        colors = CardDefaults.cardColors(containerColor = CardWhite),
        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFF3F4F6)),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Surface(
                shape = CircleShape,
                color = iconBgColor,
                border = androidx.compose.foundation.BorderStroke(1.dp, iconBorderColor),
                modifier = Modifier.size(40.dp)
            ) {
                Box(contentAlignment = Alignment.Center, modifier = Modifier.fillMaxSize()) {
                    Icon(imageVector = icon, contentDescription = null, tint = iconTint, modifier = Modifier.size(24.dp))
                }
            }
            Spacer(modifier = Modifier.width(12.dp))
            Column {
                Text(text = label, fontSize = 9.sp, color = Slate500, fontWeight = FontWeight.ExtraBold, letterSpacing = 0.5.sp)
                Spacer(modifier = Modifier.height(2.dp))
                Text(text = amount, fontSize = 14.sp, color = Slate800, fontWeight = FontWeight.ExtraBold)
            }
        }
    }
}

@Composable
fun OtherBillCard(tagihan: Tagihan, onBayarClicked: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = CardWhite),
        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFF3F4F6)),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Surface(
                shape = CircleShape,
                color = BackgroundLight,
                modifier = Modifier.size(48.dp)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(Icons.Rounded.Receipt, contentDescription = null, tint = Slate400)
                }
            }
            Spacer(modifier = Modifier.width(16.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = tagihan.judul,
                    style = MaterialTheme.typography.bodyMedium,
                    color = Slate800,
                    fontWeight = FontWeight.Bold,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = formatRupiah(tagihan.nominal),
                    style = MaterialTheme.typography.titleSmall,
                    color = Emerald600,
                    fontWeight = FontWeight.ExtraBold
                )
            }
            Spacer(modifier = Modifier.width(16.dp))
            var isOptimisticPaid by remember { mutableStateOf(false) }
            OutlinedButton(
                onClick = {
                    isOptimisticPaid = true
                    onBayarClicked()
                },
                shape = RoundedCornerShape(8.dp),
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
                enabled = !isOptimisticPaid
            ) {
                Text(if (isOptimisticPaid) "Memproses..." else "Bayar", style = MaterialTheme.typography.labelMedium, color = if (isOptimisticPaid) Slate400 else Emerald600)
            }
        }
    }
}

@Composable
fun NoUrgentBillCard() {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = CardWhite),
        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFF3F4F6)),
        elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
    ) {
        Column(
            modifier = Modifier.padding(24.dp).fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(Icons.Filled.CheckCircle, contentDescription = null, tint = Emerald600, modifier = Modifier.size(48.dp))
            Spacer(modifier = Modifier.height(12.dp))
            Text(text = "Semua Lunas!", style = MaterialTheme.typography.titleMedium, color = Slate800, fontWeight = FontWeight.Bold)
            Text(text = "Tidak ada tagihan yang mendesak saat ini.", style = MaterialTheme.typography.bodySmall, color = Slate500)
        }
    }
}

// Utilities
private fun formatRupiah(amount: Double): String {
    val formatter = NumberFormat.getCurrencyInstance(Locale("id", "ID"))
    return formatter.format(amount).replace(",00", "").replace("Rp", "Rp ")
}

private fun formatShortRupiah(amount: Double): String {
    if (amount >= 1_000_000) {
        val million = amount / 1_000_000.0
        return "Rp " + String.format(Locale("id", "ID"), "%.1f", million).replace(".0", "") + "M"
    }
    return formatRupiah(amount)
}

@Composable
fun SkeletonHeroBillCard() {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = CardWhite),
        elevation = CardDefaults.cardElevation(defaultElevation = 8.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFF3F4F6))
    ) {
        Column(
            modifier = Modifier.padding(24.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Pill
                Box(
                    modifier = Modifier.width(100.dp).height(24.dp).clip(CircleShape).shimmerEffect()
                )
                // Date
                Box(
                    modifier = Modifier.width(60.dp).height(16.dp).clip(RoundedCornerShape(4.dp)).shimmerEffect()
                )
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            Box(modifier = Modifier.fillMaxWidth(0.6f).height(24.dp).clip(RoundedCornerShape(4.dp)).shimmerEffect())
            
            Spacer(modifier = Modifier.height(24.dp))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Bottom
            ) {
                Column {
                    Box(modifier = Modifier.width(80.dp).height(14.dp).clip(RoundedCornerShape(4.dp)).shimmerEffect())
                    Spacer(modifier = Modifier.height(4.dp))
                    Box(modifier = Modifier.width(120.dp).height(28.dp).clip(RoundedCornerShape(4.dp)).shimmerEffect())
                }
                Box(
                    modifier = Modifier.width(48.dp).height(48.dp).clip(CircleShape).shimmerEffect()
                )
            }
        }
    }
}

@Composable
fun SkeletonSummaryCard(modifier: Modifier = Modifier) {
    Card(
        modifier = modifier.height(90.dp),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = CardWhite),
        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFF3F4F6))
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.Center
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier.size(32.dp).clip(CircleShape).shimmerEffect()
                )
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Box(modifier = Modifier.width(80.dp).height(12.dp).clip(RoundedCornerShape(4.dp)).shimmerEffect())
                    Spacer(modifier = Modifier.height(4.dp))
                    Box(modifier = Modifier.width(60.dp).height(18.dp).clip(RoundedCornerShape(4.dp)).shimmerEffect())
                }
            }
        }
    }
}

@Composable
fun SuperAppServiceItem(icon: ImageVector, iconColor: Color, label: String, hasBadge: Boolean = false, onClick: () -> Unit) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier
            .clickable(onClick = onClick)
            .padding(4.dp)
    ) {
        Box {
            Icon(
                imageVector = icon, 
                contentDescription = label, 
                tint = iconColor, 
                modifier = Modifier.size(36.dp)
            )
            if (hasBadge) {
                Box(
                    modifier = Modifier
                        .size(12.dp)
                        .background(Color.Red, CircleShape)
                        .border(2.dp, Color.White, CircleShape)
                        .align(Alignment.TopEnd)
                        .offset(x = 4.dp, y = (-2).dp)
                )
            }
        }
        Spacer(modifier = Modifier.height(6.dp))
        Text(
            text = label,
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            color = Slate800
        )
    }
}
