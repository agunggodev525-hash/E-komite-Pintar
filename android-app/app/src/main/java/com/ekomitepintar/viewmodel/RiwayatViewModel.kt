package com.ekomitepintar.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.ekomitepintar.model.Tagihan
import com.ekomitepintar.repository.TagihanRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class RiwayatUiState(
    val isLoading: Boolean = false,
    val tagihanList: List<Tagihan> = emptyList(),
    val errorMessage: String? = null
)

class RiwayatViewModel(application: Application) : AndroidViewModel(application) {
    private val tagihanRepository = TagihanRepository()

    private val _uiState = MutableStateFlow(RiwayatUiState())
    val uiState: StateFlow<RiwayatUiState> = _uiState.asStateFlow()

    init {
        // Load data awal dengan dummy siswa ID
        loadRiwayat("dummy-siswa-id")
    }

    fun loadRiwayat(siswaId: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null)
            val result = tagihanRepository.getTagihanSiswa(siswaId)

            result.fold(
                onSuccess = { data ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        tagihanList = data.tagihan
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
}
