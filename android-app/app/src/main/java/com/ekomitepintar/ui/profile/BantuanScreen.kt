package com.ekomitepintar.ui.profile

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.ekomitepintar.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BantuanScreen(
    onNavigateBack: () -> Unit
) {
    Scaffold(
        containerColor = BackgroundLight,
        topBar = {
            TopAppBar(
                title = { Text("Bantuan & Dukungan", color = Slate800, fontWeight = FontWeight.Bold) },
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
            
            item {
                Text(
                    text = "Hubungi Kami",
                    color = Slate800,
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold
                )
            }
            
            item {
                val context = androidx.compose.ui.platform.LocalContext.current
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    Button(
                        onClick = { 
                            val intent = android.content.Intent(android.content.Intent.ACTION_DIAL, android.net.Uri.parse("tel:+6281234567890"))
                            context.startActivity(intent)
                        },
                        modifier = Modifier.weight(1f).height(48.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = CardWhite),
                        shape = MaterialTheme.shapes.medium
                    ) {
                        Icon(Icons.Filled.Phone, contentDescription = null, tint = Emerald600, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Telepon", color = Slate800)
                    }
                    Button(
                        onClick = { 
                            val intent = android.content.Intent(android.content.Intent.ACTION_SENDTO, android.net.Uri.parse("mailto:support@ekomitepintar.com"))
                            context.startActivity(intent)
                        },
                        modifier = Modifier.weight(1f).height(48.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = CardWhite),
                        shape = MaterialTheme.shapes.medium
                    ) {
                        Icon(Icons.Filled.Email, contentDescription = null, tint = Emerald600, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Email", color = Slate800)
                    }
                }
            }
            
            item { Spacer(modifier = Modifier.height(16.dp)) }
            
            item {
                Text(
                    text = "Pertanyaan yang Sering Diajukan (FAQ)",
                    color = Slate800,
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold
                )
            }
            
            val faqs = listOf(
                Pair("Bagaimana cara membayar tagihan?", "Buka menu Riwayat, pilih tab Menunggu, klik bayar pada tagihan yang Anda inginkan, lalu pilih metode pembayaran."),
                Pair("Apakah data saya aman?", "Ya, kami menggunakan enkripsi standar industri untuk melindungi seluruh data pribadi dan riwayat transaksi Anda."),
                Pair("Bagaimana jika aplikasi bermasalah?", "Pastikan Anda menggunakan versi terbaru. Jika masalah berlanjut, hubungi kami melalui tombol di atas.")
            )
            
            faqs.forEach { (q, a) ->
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = MaterialTheme.shapes.medium,
                        colors = CardDefaults.cardColors(containerColor = CardWhite),
        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFF3F4F6)),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text(
                                text = q,
                                color = Slate800,
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = a,
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
