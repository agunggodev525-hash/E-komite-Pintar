package com.ekomitepintar.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.ekomitepintar.model.Voting
import com.ekomitepintar.repository.VotingRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class VotingUiState(
    val votingList: List<Voting> = emptyList(),
    val isLoading: Boolean = false,
    val errorMessage: String? = null,
    val isVoteSuccess: Boolean = false,
    val successMessage: String? = null
)

class VotingViewModel : ViewModel() {
    private val repository = VotingRepository()

    private val _uiState = MutableStateFlow(VotingUiState())
    val uiState: StateFlow<VotingUiState> = _uiState.asStateFlow()

    fun fetchActiveVoting() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null)
            val result = repository.getActiveVoting()

            result.fold(
                onSuccess = { data ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        votingList = data
                    )
                },
                onFailure = { error ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        errorMessage = error.message
                    )
                }
            )
        }
    }

    fun submitVote(votingId: String, kandidatId: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null)
            val result = repository.submitVote(votingId, kandidatId)

            result.fold(
                onSuccess = { message ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        isVoteSuccess = true,
                        successMessage = message
                    )
                    // Refresh data
                    fetchActiveVoting()
                },
                onFailure = { error ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        errorMessage = error.message
                    )
                }
            )
        }
    }

    fun clearMessages() {
        _uiState.value = _uiState.value.copy(
            errorMessage = null,
            successMessage = null,
            isVoteSuccess = false
        )
    }
}
