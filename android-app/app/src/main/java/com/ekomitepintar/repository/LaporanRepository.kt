package com.ekomitepintar.repository

import com.ekomitepintar.model.TransparansiData
import com.ekomitepintar.network.RetrofitClient

/**
 * Repository untuk Laporan Keuangan (Transparansi).
 */
class LaporanRepository {

    private val apiService = RetrofitClient.getApiService()

    /**
     * Ambil data transparansi kas komite.
     */
    suspend fun getTransparansi(): Result<TransparansiData> {
        return try {
            val response = apiService.getTransparansi()

            if (response.isSuccessful && response.body()?.success == true) {
                Result.success(response.body()!!.data!!)
            } else {
                val errorMessage = response.body()?.message
                    ?: "Gagal memuat data transparansi."
                Result.failure(Exception(errorMessage))
            }
        } catch (e: Exception) {
            Result.failure(
                Exception("Tidak dapat terhubung ke server. Periksa koneksi internet Anda.")
            )
        }
    }
}
