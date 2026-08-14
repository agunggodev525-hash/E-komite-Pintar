package com.ekomitepintar.network

import android.app.Application
import okhttp3.Cache
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.io.File
import java.util.concurrent.TimeUnit

/**
 * Singleton Retrofit Client.
 */
object RetrofitClient {

    private const val BASE_URL = "https://e-komite-pintar-dfxmr3gki-agung-developer-s-projects.vercel.app/api/v1/"

    private var token: String? = null
    private var apiService: ApiService? = null
    private var application: Application? = null

    /**
     * Inisialisasi dengan Application context (untuk HTTP cache).
     * Panggil dari Application class atau sebelum getApiService() pertama kali.
     */
    fun init(app: Application) {
        application = app
    }

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
        val clientBuilder = OkHttpClient.Builder()
            .addInterceptor(AuthInterceptor { token })
            .connectTimeout(15, TimeUnit.SECONDS)  // Dikurangi dari 30s → 15s
            .readTimeout(15, TimeUnit.SECONDS)
            .writeTimeout(20, TimeUnit.SECONDS)

        // HTTP Cache 10MB di disk — mengurangi request berulang untuk data yang sama
        application?.let { app ->
            val cacheDir = File(app.cacheDir, "http_cache")
            val cache = Cache(cacheDir, 10L * 1024L * 1024L) // 10 MB
            clientBuilder.cache(cache)
        }

        // Logging HANYA aktif di debug build — hemat CPU & memory di production
        if (isDebugBuild()) {
            val loggingInterceptor = HttpLoggingInterceptor().apply {
                level = HttpLoggingInterceptor.Level.BODY
            }
            clientBuilder.addInterceptor(loggingInterceptor)
        }

        val retrofit = Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(clientBuilder.build())
            .addConverterFactory(GsonConverterFactory.create())
            .build()

        return retrofit.create(ApiService::class.java)
    }

    private fun isDebugBuild(): Boolean {
        return try {
            application?.let {
                val appInfo = it.packageManager.getApplicationInfo(it.packageName, 0)
                (appInfo.flags and android.content.pm.ApplicationInfo.FLAG_DEBUGGABLE) != 0
            } ?: true
        } catch (e: Exception) {
            true
        }
    }
}
