package com.ekomitepintar.repository

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.ekomitepintar.model.*
import com.ekomitepintar.network.RetrofitClient
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map

// Extension property untuk DataStore
private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(
    name = "ekomite_pintar_prefs"
)

/**
 * Repository untuk autentikasi.
 * Mengelola login, penyimpanan token JWT, dan data user via DataStore.
 */
class AuthRepository(private val context: Context) {

    companion object {
        private val TOKEN_KEY = stringPreferencesKey("jwt_token")
        private val USER_NAME_KEY = stringPreferencesKey("user_name")
        private val USER_EMAIL_KEY = stringPreferencesKey("user_email")
        private val USER_ROLE_KEY = stringPreferencesKey("user_role")
        private val USER_ID_KEY = stringPreferencesKey("user_id")
        private val USER_FOTO_KEY = stringPreferencesKey("user_foto")
    }

    private val apiService = RetrofitClient.getApiService()

    /**
     * Login ke backend dan simpan token + data user.
     */
    suspend fun login(email: String, password: String): Result<LoginData> {
        return try {
            val response = apiService.login(LoginRequest(email, password))

            if (response.isSuccessful && response.body()?.success == true) {
                val loginData = response.body()!!.data!!

                // Simpan token dan data user
                saveToken(loginData.token)
                saveUser(loginData.user)

                // Set token ke RetrofitClient
                RetrofitClient.setToken(loginData.token)

                Result.success(loginData)
            } else {
                val errorMessage = response.body()?.message
                    ?: "Login gagal. Periksa email dan password Anda."
                Result.failure(Exception(errorMessage))
            }
        } catch (e: Exception) {
            Result.failure(
                Exception("Tidak dapat terhubung ke server. Periksa koneksi internet Anda.")
            )
        }
    }

    /**
     * Request OTP via WhatsApp
     */
    suspend fun requestOtp(noWhatsapp: String): Result<String> {
        return try {
            val response = apiService.requestOtp(OtpRequest(noWhatsapp))
            if (response.isSuccessful && response.body()?.success == true) {
                Result.success(response.body()?.message ?: "OTP terkirim")
            } else {
                val errorMessage = response.body()?.message ?: "Gagal mengirim OTP"
                Result.failure(Exception(errorMessage))
            }
        } catch (e: Exception) {
            Result.failure(Exception("Tidak dapat terhubung ke server."))
        }
    }

    /**
     * Verify OTP and login
     */
    suspend fun verifyOtp(noWhatsapp: String, otp: String): Result<LoginData> {
        return try {
            val response = apiService.verifyOtp(OtpVerifyRequest(noWhatsapp, otp))

            if (response.isSuccessful && response.body()?.success == true) {
                val loginData = response.body()!!.data!!

                saveToken(loginData.token)
                saveUser(loginData.user)
                RetrofitClient.setToken(loginData.token)

                Result.success(loginData)
            } else {
                val errorMessage = response.body()?.message ?: "OTP tidak valid"
                Result.failure(Exception(errorMessage))
            }
        } catch (e: Exception) {
            Result.failure(Exception("Tidak dapat terhubung ke server."))
        }
    }

    /**
     * Simpan JWT token ke DataStore.
     */
    private suspend fun saveToken(token: String) {
        context.dataStore.edit { prefs ->
            prefs[TOKEN_KEY] = token
        }
    }

    /**
     * Simpan data user ke DataStore.
     */
    private suspend fun saveUser(user: User) {
        context.dataStore.edit { prefs ->
            prefs[USER_ID_KEY] = user.id
            prefs[USER_NAME_KEY] = user.namaLengkap
            prefs[USER_EMAIL_KEY] = user.email
            prefs[USER_ROLE_KEY] = user.role
            if (user.fotoProfil != null) {
                prefs[USER_FOTO_KEY] = user.fotoProfil
            }
        }
    }

    /**
     * Update foto profil di DataStore
     */
    suspend fun updateFotoProfil(fotoUrl: String) {
        context.dataStore.edit { prefs ->
            prefs[USER_FOTO_KEY] = fotoUrl
        }
    }

    /**
     * Ambil token dari DataStore (satu kali).
     */
    suspend fun getToken(): String? {
        return context.dataStore.data.first()[TOKEN_KEY]
    }

    /**
     * Observe token sebagai Flow (reactive).
     */
    fun observeToken(): Flow<String?> {
        return context.dataStore.data.map { prefs ->
            prefs[TOKEN_KEY]
        }
    }

    /**
     * Ambil nama user dari DataStore.
     */
    suspend fun getUserName(): String? {
        return context.dataStore.data.first()[USER_NAME_KEY]
    }

    /**
     * Ambil user ID dari DataStore.
     */
    suspend fun getUserId(): String? {
        return context.dataStore.data.first()[USER_ID_KEY]
    }

    /**
     * Observe nama user sebagai Flow.
     */
    fun observeUserName(): Flow<String?> {
        return context.dataStore.data.map { prefs ->
            prefs[USER_NAME_KEY]
        }
    }

    /**
     * Observe foto profil sebagai Flow.
     */
    fun observeFotoProfil(): Flow<String?> {
        return context.dataStore.data.map { prefs ->
            prefs[USER_FOTO_KEY]
        }
    }

    /**
     * Logout — hapus semua data dari DataStore.
     */
    suspend fun logout() {
        context.dataStore.edit { it.clear() }
        RetrofitClient.setToken(null)
    }

    /**
     * Cek apakah user sudah login (token ada).
     */
    suspend fun isLoggedIn(): Boolean {
        return getToken() != null
    }
}
