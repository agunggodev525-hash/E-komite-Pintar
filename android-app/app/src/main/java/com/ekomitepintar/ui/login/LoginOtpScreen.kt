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
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
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
            .background(Navy900)
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
                    Text("← Kembali", color = White60)
                }
            }

            Spacer(modifier = Modifier.height(40.dp))

            // Icon / Header
            Box(
                modifier = Modifier
                    .size(80.dp)
                    .background(color = Gold400.copy(alpha = 0.15f), shape = RoundedCornerShape(24.dp)),
                contentAlignment = Alignment.Center
            ) {
                Text("📱", fontSize = 40.sp)
            }

            Spacer(modifier = Modifier.height(24.dp))
            Text(
                text = "Login via WhatsApp",
                fontSize = 28.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
            Spacer(modifier = Modifier.height(8.dp))
            
            if (!uiState.isOtpRequested) {
                Text(
                    text = "Masukkan nomor WhatsApp yang terdaftar untuk menerima kode OTP.",
                    color = White60,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(horizontal = 16.dp)
                )
            } else {
                Text(
                    text = "Masukkan 6 digit kode OTP yang telah dikirim ke nomor ${uiState.whatsappNumber}",
                    color = White60,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(horizontal = 16.dp)
                )
            }

            Spacer(modifier = Modifier.height(48.dp))

            // Content Area
            if (!uiState.isOtpRequested) {
                // Tahap 1: Input Nomor WA
                OutlinedTextField(
                    value = uiState.whatsappNumber,
                    onValueChange = viewModel::onWhatsappNumberChange,
                    label = { Text("Nomor WhatsApp", color = White60) },
                    placeholder = { Text("081234567890", color = White40) },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Gold400,
                        unfocusedBorderColor = Navy500,
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White
                    ),
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(32.dp))

                Button(
                    onClick = viewModel::onRequestOtp,
                    enabled = !uiState.isLoading,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Gold400,
                        contentColor = Navy900
                    ),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp)
                ) {
                    if (uiState.isLoading) {
                        CircularProgressIndicator(color = Navy900, modifier = Modifier.size(24.dp))
                    } else {
                        Text("Kirim Kode OTP", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                    }
                }
            } else {
                // Tahap 2: Input OTP
                OtpInputField(
                    otpText = uiState.otpCode,
                    onOtpTextChange = viewModel::onOtpCodeChange
                )

                Spacer(modifier = Modifier.height(32.dp))

                Button(
                    onClick = viewModel::onVerifyOtp,
                    enabled = !uiState.isLoading && uiState.otpCode.length == 6,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Gold400,
                        contentColor = Navy900
                    ),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp)
                ) {
                    if (uiState.isLoading) {
                        CircularProgressIndicator(color = Navy900, modifier = Modifier.size(24.dp))
                    } else {
                        Text("Verifikasi & Masuk", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                    }
                }
                
                Spacer(modifier = Modifier.height(16.dp))
                
                TextButton(onClick = viewModel::resetOtpState) {
                    Text("Ganti Nomor WhatsApp", color = Gold400)
                }
            }

            // Error Message
            uiState.errorMessage?.let { error ->
                Spacer(modifier = Modifier.height(24.dp))
                Surface(
                    color = Color(0xFFFEE2E2).copy(alpha = 0.1f),
                    shape = RoundedCornerShape(8.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFEF4444).copy(alpha = 0.5f))
                ) {
                    Text(
                        text = error,
                        color = Color(0xFFFCA5A5),
                        modifier = Modifier.padding(16.dp),
                        textAlign = TextAlign.Center
                    )
                }
            }
        }
    }
}

/**
 * Custom Compose Component for 6-digit OTP input.
 */
@Composable
fun OtpInputField(
    otpText: String,
    onOtpTextChange: (String) -> Unit
) {
    val otpCount = 6
    val focusRequesters = remember { List(otpCount) { FocusRequester() } }

    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceEvenly
    ) {
        for (i in 0 until otpCount) {
            val char = otpText.getOrNull(i)?.toString() ?: ""
            
            OutlinedTextField(
                value = char,
                onValueChange = { value ->
                    // Logic untuk input per kotak
                    if (value.length <= 1) {
                        val newText = StringBuilder(otpText.padEnd(otpCount, ' ')).also {
                            it.setCharAt(i, if (value.isEmpty()) ' ' else value[0])
                        }.toString().replace(" ", "")
                        
                        onOtpTextChange(newText)
                        
                        // Auto focus next
                        if (value.isNotEmpty() && i < otpCount - 1) {
                            focusRequesters[i + 1].requestFocus()
                        }
                    }
                },
                modifier = Modifier
                    .width(48.dp)
                    .height(56.dp)
                    .focusRequester(focusRequesters[i]),
                textStyle = LocalTextStyle.current.copy(
                    textAlign = TextAlign.Center,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = Gold400
                ),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword),
                singleLine = true,
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = Gold400,
                    unfocusedBorderColor = Navy500,
                )
            )
        }
    }
}
