package com.ekomitepintar.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.ekomitepintar.repository.AuthRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import okhttp3.MediaType.Companion.toMediaTypeOrNull

class ProfilViewModel(application: Application) : AndroidViewModel(application) {
    private val authRepository = AuthRepository(application.applicationContext)

    private val _isLoggedOut = MutableStateFlow(false)
    val isLoggedOut: StateFlow<Boolean> = _isLoggedOut.asStateFlow()

    private val _userName = MutableStateFlow("Memuat...")
    val userName: StateFlow<String> = _userName.asStateFlow()

    private val _fotoProfil = MutableStateFlow<String?>(null)
    val fotoProfil: StateFlow<String?> = _fotoProfil.asStateFlow()

    init {
        loadUserData()

        // Listen for changes in DataStore (reactive)
        viewModelScope.launch {
            authRepository.observeFotoProfil().collect { url ->
                _fotoProfil.value = url
            }
        }

        // Sync foto & nama terbaru dari server setiap kali halaman dibuka
        syncProfilFromServer()
    }

    private fun loadUserData() {
        viewModelScope.launch {
            val name = authRepository.getUserName() ?: "Orang Tua"
            _userName.value = name
        }
    }

    /**
     * Fetch data profil terbaru dari server (GET /auth/me).
     * Memperbarui DataStore lokal sehingga foto yang diubah admin langsung tampil
     * tanpa harus logout-login.
     */
    fun syncProfilFromServer() {
        viewModelScope.launch {
            try {
                val response = com.ekomitepintar.network.RetrofitClient.getApiService().getMe()
                if (response.isSuccessful && response.body()?.success == true) {
                    val user = response.body()?.data ?: return@launch
                    // Update nama di ViewModel langsung
                    _userName.value = user.namaLengkap
                    // Update foto di DataStore (akan otomatis ter-observe oleh flow di atas)
                    if (user.fotoProfil != null) {
                        authRepository.updateFotoProfil(user.fotoProfil)
                    }
                }
            } catch (e: Exception) {
                // Gagal sync tidak perlu ditampilkan ke user — data lokal tetap dipakai
            }
        }
    }

    fun uploadFotoProfil(uri: android.net.Uri, context: android.content.Context, onSuccess: () -> Unit, onError: (String) -> Unit) {
        viewModelScope.launch {
            try {
                val inputStream = context.contentResolver.openInputStream(uri)
                if (inputStream != null) {
                    val bytes = inputStream.readBytes()
                    val mediaType = (context.contentResolver.getType(uri) ?: "image/jpeg").toMediaTypeOrNull()
                    val requestBody = okhttp3.RequestBody.create(mediaType, bytes)
                    val multipartBody = okhttp3.MultipartBody.Part.createFormData("foto", "profile.jpg", requestBody)

                    val response = com.ekomitepintar.network.RetrofitClient.getApiService().updateFotoProfil(multipartBody)
                    if (response.isSuccessful && response.body()?.success == true) {
                        val fotoUrl = response.body()?.data?.get("foto_profil")
                        if (fotoUrl != null) {
                            authRepository.updateFotoProfil(fotoUrl)
                            onSuccess()
                        } else {
                            onError("URL foto tidak ditemukan.")
                        }
                    } else {
                        onError("Gagal mengupload foto.")
                    }
                }
            } catch (e: Exception) {
                onError("Gagal menghubungi server.")
            }
        }
    }

    fun onLogout() {
        viewModelScope.launch {
            authRepository.logout()
            _isLoggedOut.value = true
        }
    }
}
