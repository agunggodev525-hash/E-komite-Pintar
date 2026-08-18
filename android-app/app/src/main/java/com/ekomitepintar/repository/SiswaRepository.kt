package com.ekomitepintar.repository

import com.ekomitepintar.model.SiswaInfo
import com.ekomitepintar.network.RetrofitClient

class SiswaRepository {
    private val apiService = RetrofitClient.getApiService()

    suspend fun getAnakku(): Result<List<SiswaInfo>> {
        return try {
            val response = apiService.getAnakku()
            if (response.isSuccessful && response.body()?.success == true) {
                Result.success(response.body()!!.data ?: emptyList())
            } else {
                val errorMessage = response.body()?.message ?: "Gagal memuat daftar anak."
                Result.failure(Exception(errorMessage))
            }
        } catch (e: Exception) {
            Result.failure(Exception("Tidak dapat terhubung ke server. Periksa koneksi internet Anda."))
        }
    }
}
