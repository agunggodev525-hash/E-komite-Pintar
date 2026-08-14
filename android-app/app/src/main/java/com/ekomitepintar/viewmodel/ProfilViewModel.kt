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
        
        // Listen for changes in DataStore
        viewModelScope.launch {
            authRepository.observeFotoProfil().collect { url ->
                _fotoProfil.value = url
            }
        }
    }

    private fun loadUserData() {
        viewModelScope.launch {
            val name = authRepository.getUserName() ?: "Orang Tua"
            _userName.value = name
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
