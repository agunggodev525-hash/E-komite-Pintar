package com.ekomitepintar.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.ekomitepintar.model.TransparansiData
import com.ekomitepintar.repository.LaporanRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class TransparansiUiState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val data: TransparansiData? = null,
    val errorMessage: String? = null
)

class TransparansiViewModel : ViewModel() {
    private val repository = LaporanRepository()

    private val _uiState = MutableStateFlow(TransparansiUiState())
    val uiState: StateFlow<TransparansiUiState> = _uiState.asStateFlow()

    init {
        loadData()
    }

    fun loadData() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null)
            val result = repository.getTransparansi()
            
            result.fold(
                onSuccess = { data ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        isRefreshing = false,
                        data = data
                    )
                },
                onFailure = { error ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        isRefreshing = false,
                        errorMessage = error.message
                    )
                }
            )
        }
    }

    fun onRefresh() {
        _uiState.value = _uiState.value.copy(isRefreshing = true)
        loadData()
    }
}
