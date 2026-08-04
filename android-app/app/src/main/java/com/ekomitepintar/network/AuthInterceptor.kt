package com.ekomitepintar.network

import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import okhttp3.Interceptor
import okhttp3.Response

/**
 * OkHttp Interceptor untuk menyisipkan JWT token
 * ke setiap request yang membutuhkan autentikasi.
 *
 * Token dibaca dari DataStore via TokenProvider.
 */
class AuthInterceptor(
    private val tokenProvider: () -> String?
) : Interceptor {

    override fun intercept(chain: Interceptor.Chain): Response {
        val original = chain.request()

        // Skip auth header untuk endpoint publik (login, register)
        val path = original.url.encodedPath
        if (path.contains("auth/login") || path.contains("auth/register")) {
            return chain.proceed(original)
        }

        val token = tokenProvider()

        val request = if (token != null) {
            original.newBuilder()
                .header("Authorization", "Bearer $token")
                .header("Content-Type", "application/json")
                .build()
        } else {
            original.newBuilder()
                .header("Content-Type", "application/json")
                .build()
        }

        return chain.proceed(request)
    }
}
