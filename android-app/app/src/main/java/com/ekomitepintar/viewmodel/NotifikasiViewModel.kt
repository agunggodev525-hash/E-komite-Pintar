package com.ekomitepintar.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.ekomitepintar.model.Notifikasi
import com.ekomitepintar.network.RetrofitClient
import com.ekomitepintar.repository.NotifikasiRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class NotifikasiUiState(
    val notifikasiList: List<Notifikasi> = emptyList(),
    val unreadCount: Int = 0,
    val isLoading: Boolean = false,
    val errorMessage: String? = null
)

class NotifikasiViewModel : ViewModel() {
    private val repository = NotifikasiRepository(RetrofitClient.getApiService())

    private val _uiState = MutableStateFlow(NotifikasiUiState())
    val uiState: StateFlow<NotifikasiUiState> = _uiState.asStateFlow()

    init {
        fetchNotifikasi()
    }

    fun fetchNotifikasi() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, errorMessage = null) }
            try {
                val response = repository.getNotifikasi()
                if (response.isSuccessful) {
                    val list = response.body()?.data ?: emptyList()
                    val unread = list.count { !it.isRead }
                    _uiState.update { 
                        it.copy(
                            notifikasiList = list, 
                            unreadCount = unread,
                            isLoading = false
                        )
                    }
                } else {
                    _uiState.update { it.copy(isLoading = false, errorMessage = "Gagal mengambil notifikasi") }
                }
            } catch (e: Exception) {
                _uiState.update { it.copy(isLoading = false, errorMessage = "Koneksi bermasalah: ${e.message}") }
            }
        }
    }

    fun markAllAsRead() {
        if (_uiState.value.unreadCount == 0) return
        
        viewModelScope.launch {
            try {
                val response = repository.markAllAsRead()
                if (response.isSuccessful) {
                    // Update state locally to immediately reflect UI
                    val updatedList = _uiState.value.notifikasiList.map { it.copy(isRead = true) }
                    _uiState.update {
                        it.copy(notifikasiList = updatedList, unreadCount = 0)
                    }
                }
            } catch (e: Exception) {
                // Ignore silent error
            }
        }
    }
}
