package com.ekomitepintar.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.ekomitepintar.model.Tagihan
import com.ekomitepintar.model.TagihanSummary
import com.ekomitepintar.repository.AuthRepository
import com.ekomitepintar.repository.TagihanRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/**
 * State untuk Dashboard Screen.
 */
data class DashboardUiState(
    val userName: String = "",
    val isLoading: Boolean = false,
    val isRefreshing: Boolean = false,
    val tagihanList: List<Tagihan> = emptyList(),
    val summary: TagihanSummary? = null,
    val errorMessage: String? = null,
    val checkoutToken: String? = null,
    val isLoggedOut: Boolean = false
)

/**
 * ViewModel untuk halaman Dashboard.
 */
class DashboardViewModel(application: Application) : AndroidViewModel(application) {

    private val authRepository = AuthRepository(application.applicationContext)
    private val tagihanRepository = TagihanRepository()

    private val _uiState = MutableStateFlow(DashboardUiState())
    val uiState: StateFlow<DashboardUiState> = _uiState.asStateFlow()

    init {
        loadUserData()
    }

    /**
     * Load nama user dari DataStore.
     */
    private fun loadUserData() {
        viewModelScope.launch {
            val userName = authRepository.getUserName() ?: "Orang Tua"
            _uiState.value = _uiState.value.copy(userName = userName)
        }
    }

    /**
     * Load daftar tagihan untuk siswa tertentu.
     */
    fun loadTagihan(siswaId: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null)

            val result = tagihanRepository.getTagihanSiswa(siswaId)

            result.fold(
                onSuccess = { data ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        isRefreshing = false,
                        tagihanList = data.tagihan,
                        summary = data.summary
                    )
                },
                onFailure = { exception ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        isRefreshing = false,
                        errorMessage = exception.message
                    )
                }
            )
        }
    }

    /**
     * Refresh data (pull-to-refresh).
     */
    fun onRefresh(siswaId: String) {
        _uiState.value = _uiState.value.copy(isRefreshing = true)
        loadTagihan(siswaId)
    }

    /**
     * Proses klik "Bayar Sekarang".
     */
    fun onBayarClicked(tagihanId: String, siswaId: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)

            val result = tagihanRepository.checkout(tagihanId, siswaId)

            result.fold(
                onSuccess = { checkoutData ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        checkoutToken = checkoutData.snapToken
                    )
                    // Refresh tagihan list
                    loadTagihan(siswaId)
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
     * Logout user.
     */
    fun onLogout() {
        viewModelScope.launch {
            authRepository.logout()
            _uiState.value = _uiState.value.copy(isLoggedOut = true)
        }
    }

    fun clearCheckoutToken() {
        _uiState.value = _uiState.value.copy(checkoutToken = null)
    }

    fun clearError() {
        _uiState.value = _uiState.value.copy(errorMessage = null)
    }
}
