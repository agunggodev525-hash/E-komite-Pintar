package com.ekomitepintar.ui.login

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.ekomitepintar.viewmodel.LoginViewModel
import com.ekomitepintar.ui.theme.*

@Composable
fun LoginOtpScreen(
    onNavigateToDashboard: () -> Unit,
    onNavigateBack: () -> Unit,
    viewModel: LoginViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()

    LaunchedEffect(uiState.isLoginSuccess) {
        if (uiState.isLoginSuccess) {
            onNavigateToDashboard()
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(BackgroundLight)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            
            // Back Button
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.Start
            ) {
                TextButton(onClick = onNavigateBack) {
                    Text("← Kembali", color = Slate500)
                }
            }

            Spacer(modifier = Modifier.height(40.dp))

            // Icon / Header
            Box(
                modifier = Modifier
                    .size(80.dp)
                    .background(color = Emerald50, shape = RoundedCornerShape(24.dp)),
                contentAlignment = Alignment.Center
            ) {
                Text("📱", fontSize = 40.sp)
            }

            Spacer(modifier = Modifier.height(24.dp))
            Text(
                text = "Login via WhatsApp",
                fontSize = 28.sp,
                fontWeight = FontWeight.Bold,
                color = Slate800
            )
            Spacer(modifier = Modifier.height(8.dp))
            
            if (!uiState.isOtpRequested) {
                Text(
                    text = "Masukkan nomor WhatsApp yang terdaftar untuk menerima kode OTP.",
                    color = Slate500,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(horizontal = 16.dp)
                )
            } else {
                Text(
                    text = "Masukkan 6 digit kode OTP yang telah dikirim ke nomor ${uiState.whatsappNumber}",
                    color = Slate500,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(horizontal = 16.dp)
                )
            }

            Spacer(modifier = Modifier.height(48.dp))

            // Content Area
            if (!uiState.isOtpRequested) {
                // Form Nomor WA
                OutlinedTextField(
                    value = uiState.whatsappNumber,
                    onValueChange = { viewModel.onWhatsappNumberChange(it) },
                    label = { Text("Nomor WhatsApp (mis: 0812...)") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Emerald500,
                        unfocusedBorderColor = Color(0xFFE2E8F0),
                        focusedLabelColor = Emerald600,
                        unfocusedLabelColor = Slate400,
                        focusedTextColor = Slate800,
                        unfocusedTextColor = Slate800
                    )
                )

                Spacer(modifier = Modifier.height(32.dp))

                Button(
                    onClick = { viewModel.onRequestOtp() },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp),
                    shape = RoundedCornerShape(16.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Emerald600),
                    enabled = !uiState.isLoading && uiState.whatsappNumber.isNotBlank()
                ) {
                    if (uiState.isLoading) {
                        CircularProgressIndicator(color = Color.White, modifier = Modifier.size(24.dp))
                    } else {
                        Text(
                            "Minta Kode OTP",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    }
                }
            } else {
                // Form OTP (Single TextField)
                OutlinedTextField(
                    value = uiState.otpCode,
                    onValueChange = { viewModel.onOtpCodeChange(it) },
                    label = { Text("6-Digit Kode OTP") },
                    textStyle = LocalTextStyle.current.copy(
                        textAlign = TextAlign.Center,
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 12.sp,
                        color = Slate800
                    ),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword),
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Emerald500,
                        unfocusedBorderColor = Color(0xFFE2E8F0)
                    )
                )

                Spacer(modifier = Modifier.height(32.dp))

                Button(
                    onClick = { viewModel.onVerifyOtp() },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp),
                    shape = RoundedCornerShape(16.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Emerald600),
                    enabled = !uiState.isLoading && uiState.otpCode.length == 6
                ) {
                    if (uiState.isLoading) {
                        CircularProgressIndicator(color = Color.White, modifier = Modifier.size(24.dp))
                    } else {
                        Text(
                            "Verifikasi",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    }
                }
                
                Spacer(modifier = Modifier.height(16.dp))
                
                TextButton(onClick = { viewModel.onRequestOtp() }) {
                    Text("Kirim Ulang Kode", color = Emerald600)
                }
            }

            if (uiState.errorMessage != null) {
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = uiState.errorMessage ?: "",
                    color = Rose600,
                    style = MaterialTheme.typography.bodyMedium,
                    textAlign = TextAlign.Center
                )
            }
        }
    }
}
