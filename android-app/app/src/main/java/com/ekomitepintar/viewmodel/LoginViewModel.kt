package com.ekomitepintar.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.ekomitepintar.repository.AuthRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/**
 * State untuk Login Screen.
 */
data class LoginUiState(
    val email: String = "",
    val password: String = "",
    val isLoading: Boolean = false,
    val errorMessage: String? = null,
    val isLoginSuccess: Boolean = false,
    val isPasswordVisible: Boolean = false,
    
    // OTP fields
    val whatsappNumber: String = "",
    val otpCode: String = "",
    val isOtpRequested: Boolean = false
)

/**
 * ViewModel untuk halaman Login.
 * Menggunakan AndroidViewModel untuk akses Context (DataStore).
 */
class LoginViewModel(application: Application) : AndroidViewModel(application) {

    private val authRepository = AuthRepository(application.applicationContext)

    private val _uiState = MutableStateFlow(LoginUiState())
    val uiState: StateFlow<LoginUiState> = _uiState.asStateFlow()

    /**
     * Cek apakah user sudah login sebelumnya.
     */
    fun checkExistingSession() {
        viewModelScope.launch {
            val isLoggedIn = authRepository.isLoggedIn()
            if (isLoggedIn) {
                // Restore token ke RetrofitClient
                val token = authRepository.getToken()
                if (token != null) {
                    com.ekomitepintar.network.RetrofitClient.setToken(token)
                }
                _uiState.value = _uiState.value.copy(isLoginSuccess = true)
            }
        }
    }

    fun onEmailChange(email: String) {
        _uiState.value = _uiState.value.copy(
            email = email,
            errorMessage = null
        )
    }

    fun onPasswordChange(password: String) {
        _uiState.value = _uiState.value.copy(
            password = password,
            errorMessage = null
        )
    }

    fun togglePasswordVisibility() {
        _uiState.value = _uiState.value.copy(
            isPasswordVisible = !_uiState.value.isPasswordVisible
        )
    }

    fun onWhatsappNumberChange(number: String) {
        _uiState.value = _uiState.value.copy(
            whatsappNumber = number,
            errorMessage = null
        )
    }

    fun onOtpCodeChange(code: String) {
        // Hanya angka dan maksimal 6 digit
        val filtered = code.filter { it.isDigit() }.take(6)
        _uiState.value = _uiState.value.copy(
            otpCode = filtered,
            errorMessage = null
        )
    }

    /**
     * Proses login.
     */
    fun onLogin() {
        val state = _uiState.value

        // Validasi input
        if (state.email.isBlank()) {
            _uiState.value = state.copy(errorMessage = "Email tidak boleh kosong.")
            return
        }
        if (!android.util.Patterns.EMAIL_ADDRESS.matcher(state.email).matches()) {
            _uiState.value = state.copy(errorMessage = "Format email tidak valid.")
            return
        }
        if (state.password.isBlank()) {
            _uiState.value = state.copy(errorMessage = "Password tidak boleh kosong.")
            return
        }
        if (state.password.length < 8) {
            _uiState.value = state.copy(errorMessage = "Password minimal 8 karakter.")
            return
        }

        // Call API
        viewModelScope.launch {
            _uiState.value = state.copy(isLoading = true, errorMessage = null)

            val result = authRepository.login(state.email.trim(), state.password)

            result.fold(
                onSuccess = { loginData ->
                    // Cek role — hanya ORANG_TUA yang boleh login di app ini
                    if (loginData.user.role != "ORANG_TUA") {
                        authRepository.logout()
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            errorMessage = "Aplikasi ini hanya untuk Orang Tua. Role Anda: ${loginData.user.role}"
                        )
                        return@launch
                    }

                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        isLoginSuccess = true
                    )
                    registerFcmToken()
                },
                onFailure = { exception ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        errorMessage = exception.message
                    )
                }
            )
        }
    }

    fun clearError() {
        _uiState.value = _uiState.value.copy(errorMessage = null)
    }

    /**
     * Request OTP
     */
    fun onRequestOtp() {
        val state = _uiState.value

        if (state.whatsappNumber.isBlank()) {
            _uiState.value = state.copy(errorMessage = "Nomor WhatsApp tidak boleh kosong.")
            return
        }

        viewModelScope.launch {
            _uiState.value = state.copy(isLoading = true, errorMessage = null)

            val result = authRepository.requestOtp(state.whatsappNumber.trim())

            result.fold(
                onSuccess = {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        isOtpRequested = true
                    )
                },
                onFailure = { exception ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        errorMessage = exception.message
                    )
                }
            )
        }
    }

    /**
     * Verify OTP and Login
     */
    fun onVerifyOtp() {
        val state = _uiState.value

        if (state.otpCode.length != 6) {
            _uiState.value = state.copy(errorMessage = "Kode OTP harus 6 digit.")
            return
        }

        viewModelScope.launch {
            _uiState.value = state.copy(isLoading = true, errorMessage = null)

            val result = authRepository.verifyOtp(state.whatsappNumber.trim(), state.otpCode)

            result.fold(
                onSuccess = { loginData ->
                    // Sama seperti email/pass login, pastikan role ORANG_TUA
                    if (loginData.user.role != "ORANG_TUA") {
                        authRepository.logout()
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            errorMessage = "Aplikasi ini hanya untuk Orang Tua."
                        )
                        return@launch
                    }

                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        isLoginSuccess = true
                    )
                    registerFcmToken()
                },
                onFailure = { exception ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        errorMessage = exception.message
                    )
                }
            )
        }
    }

    fun resetOtpState() {
        _uiState.value = _uiState.value.copy(
            isOtpRequested = false,
            otpCode = "",
            errorMessage = null
        )
    }

    private fun registerFcmToken() {
        com.google.firebase.messaging.FirebaseMessaging.getInstance().token.addOnCompleteListener { task ->
            if (!task.isSuccessful) {
                return@addOnCompleteListener
            }

            val token = task.result
            viewModelScope.launch {
                try {
                    val response = com.ekomitepintar.network.RetrofitClient.apiService.updateFcmToken(
                        mapOf("fcm_token" to token)
                    )
                    if (!response.isSuccessful) {
                        android.util.Log.e("FCM", "Failed to update FCM token to server")
                    }
                } catch (e: Exception) {
                    android.util.Log.e("FCM", "Error updating FCM token: ${e.message}")
                }
            }
        }
    }
}
