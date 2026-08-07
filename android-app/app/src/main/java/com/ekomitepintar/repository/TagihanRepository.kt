package com.ekomitepintar.repository

import com.ekomitepintar.model.CheckoutData
import com.ekomitepintar.model.CheckoutRequest
import com.ekomitepintar.model.TagihanSiswaData
import com.ekomitepintar.network.RetrofitClient

/**
 * Repository untuk operasi Tagihan & Pembayaran.
 */
class TagihanRepository {

    private val apiService = RetrofitClient.getApiService()

    /**
     * Ambil daftar tagihan untuk siswa tertentu.
     */
    suspend fun getTagihanSiswa(siswaId: String): Result<TagihanSiswaData> {
        return try {
            val response = apiService.getTagihanSiswa(siswaId)

            if (response.isSuccessful && response.body()?.success == true) {
                Result.success(response.body()!!.data!!)
            } else {
                val errorMessage = response.body()?.message
                    ?: "Gagal memuat data tagihan."
                Result.failure(Exception(errorMessage))
            }
        } catch (e: Exception) {
            Result.failure(
                Exception("Tidak dapat terhubung ke server. Periksa koneksi internet Anda.")
            )
        }
    }

    /**
     * Inisiasi pembayaran (checkout).
     */
    suspend fun checkout(
        tagihanId: String,
        siswaId: String,
        metodeBayar: String = "TRANSFER_BANK"
    ): Result<CheckoutData> {
        return try {
            val request = CheckoutRequest(tagihanId, siswaId, metodeBayar)
            val response = apiService.checkout(request)

            if (response.isSuccessful && response.body()?.success == true) {
                Result.success(response.body()!!.data!!)
            } else {
                var errorMessage = "Gagal memproses pembayaran."
                try {
                    val errorString = response.errorBody()?.string()
                    if (errorString != null) {
                        val json = org.json.JSONObject(errorString)
                        if (json.has("message")) {
                            errorMessage = json.getString("message")
                        }
                    }
                } catch (e: Exception) {
                    // Ignore parse error
                }
                Result.failure(Exception(errorMessage))
            }
        } catch (e: Exception) {
            Result.failure(
                Exception("Tidak dapat terhubung ke server. Periksa koneksi internet Anda.")
            )
        }
    }
}
