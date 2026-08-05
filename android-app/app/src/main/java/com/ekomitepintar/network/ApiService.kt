package com.ekomitepintar.network

import com.ekomitepintar.model.*
import retrofit2.Response
import retrofit2.http.*

/**
 * Retrofit API Service — semua endpoint backend.
 */
interface ApiService {

    // ============================================
    // Auth
    // ============================================

    @POST("auth/login")
    suspend fun login(
        @Body request: LoginRequest
    ): Response<ApiResponse<LoginData>>

    @POST("auth/request-otp")
    suspend fun requestOtp(
        @Body request: OtpRequest
    ): Response<ApiResponse<Any>>

    @POST("auth/verify-otp")
    suspend fun verifyOtp(
        @Body request: OtpVerifyRequest
    ): Response<ApiResponse<LoginData>>

    @POST("auth/fcm-token")
    suspend fun updateFcmToken(
        @Body request: Map<String, String>
    ): Response<ApiResponse<Any>>

    // ============================================
    // Tagihan
    // ============================================

    @GET("tagihan/siswa/{siswaId}")
    suspend fun getTagihanSiswa(
        @Path("siswaId") siswaId: String
    ): Response<ApiResponse<TagihanSiswaData>>

    @GET("tagihan")
    suspend fun getAllTagihan(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20
    ): Response<ApiResponse<Map<String, Any>>>

    // ============================================
    // Pembayaran
    // ============================================

    @POST("pembayaran/checkout")
    suspend fun checkout(
        @Body request: CheckoutRequest
    ): Response<ApiResponse<CheckoutData>>

    // ============================================
    // E-Voting
    // ============================================

    @GET("voting")
    suspend fun getActiveVoting(): Response<ApiResponse<List<Voting>>>

    @POST("voting/vote")
    suspend fun submitVote(
        @Body request: VoteRequest
    ): Response<ApiResponse<Any>>

    // ============================================
    // Transparansi
    // ============================================

    @GET("laporan/transparansi")
    suspend fun getTransparansi(): Response<ApiResponse<TransparansiData>>
}
