package com.ekomitepintar.network

import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

/**
 * Singleton Retrofit Client.
 *
 * Base URL menggunakan 10.0.2.2 yang merupakan alias localhost
 * dari Android Emulator. Ganti dengan IP server untuk device fisik.
 */
object RetrofitClient {

    // URL Vercel Backend Production
    private const val BASE_URL = "https://e-komite-pintar-h8u7wk404-agung-developer-s-projects.vercel.app/api/v1/"

    private var token: String? = null
    private var apiService: ApiService? = null

    /**
     * Set JWT token yang akan disertakan di setiap request.
     */
    fun setToken(newToken: String?) {
        token = newToken
        // Reset apiService agar rebuild dengan token baru
        apiService = null
    }

    /**
     * Mendapatkan instance ApiService.
     * Lazy-initialized dan di-recreate saat token berubah.
     */
    fun getApiService(): ApiService {
        if (apiService == null) {
            apiService = createApiService()
        }
        return apiService!!
    }

    private fun createApiService(): ApiService {
        // Logging interceptor — hanya aktif di debug
        val loggingInterceptor = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }

        // Auth interceptor — inject Bearer token
        val authInterceptor = AuthInterceptor { token }

        val okHttpClient = OkHttpClient.Builder()
            .addInterceptor(authInterceptor)
            .addInterceptor(loggingInterceptor)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build()

        val retrofit = Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()

        return retrofit.create(ApiService::class.java)
    }
}
