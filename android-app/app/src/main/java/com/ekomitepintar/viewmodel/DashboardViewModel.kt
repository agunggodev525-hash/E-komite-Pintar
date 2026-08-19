package com.ekomitepintar.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.ekomitepintar.model.Tagihan
import com.ekomitepintar.model.TagihanSummary
import com.ekomitepintar.model.SiswaInfo
import com.ekomitepintar.repository.AuthRepository
import com.ekomitepintar.repository.TagihanRepository
import com.ekomitepintar.repository.SiswaRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/**
 * State untuk Dashboard Screen.
 */
data class DashboardUiState(
    val userName: String = "",
    val fotoProfil: String? = null,
    val isLoading: Boolean = false,
    val isRefreshing: Boolean = false,
    val tagihanList: List<Tagihan> = emptyList(),
    val allTagihanList: List<Tagihan> = emptyList(),
    val anakList: List<SiswaInfo> = emptyList(),
    val selectedAnak: SiswaInfo? = null,
    val currentFilter: String = "Semua",
    val summary: TagihanSummary? = null,
    val errorMessage: String? = null,
    val checkoutUrl: String? = null,
    val isLoggedOut: Boolean = false,
    val unreadNotifCount: Int = 0
)

/**
 * ViewModel untuk halaman Dashboard.
 */
class DashboardViewModel(application: Application) : AndroidViewModel(application) {

    private val authRepository = AuthRepository(application.applicationContext)
    private val tagihanRepository = TagihanRepository()
    private val siswaRepository = SiswaRepository()
    private val notifikasiRepository = com.ekomitepintar.repository.NotifikasiRepository(com.ekomitepintar.network.RetrofitClient.getApiService())

    private val _uiState = MutableStateFlow(DashboardUiState())
    val uiState: StateFlow<DashboardUiState> = _uiState.asStateFlow()

    init {
        loadUserData()
        loadAnakList()
        loadUnreadNotifikasi()
    }

    /**
     * Load nama & foto user dari DataStore, lalu sync dari server.
     */
    private fun loadUserData() {
        viewModelScope.launch {
            val userName = authRepository.getUserName() ?: "Orang Tua"
            val fotoUrl = authRepository.observeFotoProfil()
            _uiState.value = _uiState.value.copy(userName = userName)

            // Observe foto profil secara reaktif dari DataStore
            fotoUrl.collect { url ->
                _uiState.value = _uiState.value.copy(fotoProfil = url)
            }
        }
    }

    private fun loadAnakList() {
        viewModelScope.launch {
            val result = siswaRepository.getAnakku()
            result.onSuccess { list ->
                val selected = list.firstOrNull()
                _uiState.value = _uiState.value.copy(
                    anakList = list,
                    selectedAnak = selected
                )
                // Jika ada anak, otomatis load tagihannya
                selected?.let { loadTagihan(it.id) }
            }.onFailure {
                _uiState.value = _uiState.value.copy(errorMessage = it.message)
            }
        }
    }

    fun loadUnreadNotifikasi() {
        viewModelScope.launch {
            try {
                val response = notifikasiRepository.getNotifikasi()
                if (response.isSuccessful) {
                    val list = response.body()?.data ?: emptyList()
                    val unread = list.count { !it.isRead }
                    _uiState.value = _uiState.value.copy(unreadNotifCount = unread)
                }
            } catch (e: Exception) {
                // Ignore silent error
            }
        }
    }

    fun selectAnak(anak: SiswaInfo) {
        _uiState.value = _uiState.value.copy(selectedAnak = anak)
        loadTagihan(anak.id)
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
                    val filtered = applyFilter(data.tagihan, _uiState.value.currentFilter)
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        isRefreshing = false,
                        allTagihanList = data.tagihan,
                        tagihanList = filtered,
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
                        checkoutUrl = checkoutData.redirectUrl ?: "https://app.midtrans.com/snap/v2/vtweb/${checkoutData.snapToken}"
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
     * Proses klik "Donasi"
     */
    fun onDonasiClicked(siswaId: String, nominal: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)

            val result = tagihanRepository.createDonasi(siswaId, nominal)

            result.fold(
                onSuccess = { checkoutData ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        checkoutUrl = checkoutData.redirectUrl ?: "https://app.midtrans.com/snap/v2/vtweb/${checkoutData.snapToken}"
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
     * Logout user.
     */
    fun onLogout() {
        viewModelScope.launch {
            authRepository.logout()
            _uiState.value = _uiState.value.copy(isLoggedOut = true)
        }
    }

    fun clearCheckoutUrl() {
        _uiState.value = _uiState.value.copy(checkoutUrl = null)
    }

    fun clearError() {
        _uiState.value = _uiState.value.copy(errorMessage = null)
    }

    /**
     * Ubah filter tagihan
     */
    fun setFilter(filterType: String) {
        val currentAll = _uiState.value.allTagihanList
        val filtered = applyFilter(currentAll, filterType)
        _uiState.value = _uiState.value.copy(
            currentFilter = filterType,
            tagihanList = filtered
        )
    }

    private fun applyFilter(list: List<Tagihan>, filter: String): List<Tagihan> {
        return when (filter) {
            "Lunas" -> list.filter { it.statusBayar == "LUNAS" }
            "Belum Bayar" -> list.filter { it.statusBayar != "LUNAS" }
            else -> list
        }
    }
}
