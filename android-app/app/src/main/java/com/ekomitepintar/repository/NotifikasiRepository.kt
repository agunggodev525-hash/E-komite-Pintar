package com.ekomitepintar.repository

import com.ekomitepintar.model.ApiResponse
import com.ekomitepintar.model.Notifikasi
import com.ekomitepintar.network.ApiService
import retrofit2.Response

class NotifikasiRepository(private val apiService: ApiService) {
    suspend fun getNotifikasi(): Response<ApiResponse<List<Notifikasi>>> {
        return apiService.getNotifikasi()
    }

    suspend fun markAllAsRead(): Response<ApiResponse<Any>> {
        return apiService.markAllNotifikasiAsRead()
    }
}
