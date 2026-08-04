package com.ekomitepintar.repository

import com.ekomitepintar.model.VoteRequest
import com.ekomitepintar.model.Voting
import com.ekomitepintar.network.RetrofitClient

class VotingRepository {
    private val apiService = RetrofitClient.getApiService()

    suspend fun getActiveVoting(): Result<List<Voting>> {
        return try {
            val response = apiService.getActiveVoting()
            if (response.isSuccessful && response.body()?.success == true) {
                Result.success(response.body()?.data ?: emptyList())
            } else {
                val errorMessage = response.body()?.message ?: "Gagal mengambil data voting"
                Result.failure(Exception(errorMessage))
            }
        } catch (e: Exception) {
            Result.failure(Exception("Tidak dapat terhubung ke server. Periksa koneksi internet Anda."))
        }
    }

    suspend fun submitVote(votingId: String, kandidatId: String): Result<String> {
        return try {
            val response = apiService.submitVote(VoteRequest(votingId, kandidatId))
            if (response.isSuccessful && response.body()?.success == true) {
                Result.success(response.body()?.message ?: "Berhasil mengirim suara")
            } else {
                val errorMessage = response.body()?.message ?: "Gagal mengirim suara"
                Result.failure(Exception(errorMessage))
            }
        } catch (e: Exception) {
            Result.failure(Exception("Tidak dapat terhubung ke server."))
        }
    }
}
