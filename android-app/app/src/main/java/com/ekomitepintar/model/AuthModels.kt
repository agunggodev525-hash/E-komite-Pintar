package com.ekomitepintar.model

/**
 * Request body untuk login.
 */
data class LoginRequest(
    val email: String,
    val password: String
)

/**
 * Response data dari endpoint login.
 * Backend mengembalikan: { user: User, token: String }
 */
data class LoginData(
    val user: User,
    val token: String
)

/**
 * Request body untuk meminta OTP.
 */
data class OtpRequest(
    val no_whatsapp: String
)

/**
 * Request body untuk memverifikasi OTP.
 */
data class OtpVerifyRequest(
    val no_whatsapp: String,
    val otp: String
)
