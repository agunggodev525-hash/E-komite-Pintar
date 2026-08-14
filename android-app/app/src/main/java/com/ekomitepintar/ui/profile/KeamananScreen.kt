package com.ekomitepintar.ui.profile

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.ekomitepintar.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun KeamananScreen(
    onNavigateBack: () -> Unit
) {
    var isBiometricEnabled by remember { mutableStateOf(true) }
    var isPinEnabled by remember { mutableStateOf(false) }

    Scaffold(
        containerColor = Navy900,
        topBar = {
            TopAppBar(
                title = { Text("Keamanan Akun", color = White, fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Kembali", tint = White)
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
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = MaterialTheme.shapes.medium,
                    colors = CardDefaults.cardColors(containerColor = Navy700)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Login dengan Biometrik",
                                color = White,
                                style = MaterialTheme.typography.titleMedium
                            )
                            Switch(
                                checked = isBiometricEnabled,
                                onCheckedChange = { isBiometricEnabled = it },
                                colors = SwitchDefaults.colors(
                                    checkedThumbColor = Navy900,
                                    checkedTrackColor = Gold400,
                                    uncheckedThumbColor = White60,
                                    uncheckedTrackColor = Navy600
                                )
                            )
                        }
                        
                        Divider(modifier = Modifier.padding(vertical = 12.dp), color = Navy600)
                        
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Gunakan PIN",
                                color = White,
                                style = MaterialTheme.typography.titleMedium
                            )
                            Switch(
                                checked = isPinEnabled,
                                onCheckedChange = { isPinEnabled = it },
                                colors = SwitchDefaults.colors(
                                    checkedThumbColor = Navy900,
                                    checkedTrackColor = Gold400,
                                    uncheckedThumbColor = White60,
                                    uncheckedTrackColor = Navy600
                                )
                            )
                        }
                    }
                }
            }
            
            item { Spacer(modifier = Modifier.height(16.dp)) }
            
            item {
                OutlinedButton(
                    onClick = { /* Ubah Password action */ },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(52.dp),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = Gold400),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Gold400),
                    shape = MaterialTheme.shapes.medium
                ) {
                    Text("Ubah Kata Sandi (Password)", fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
