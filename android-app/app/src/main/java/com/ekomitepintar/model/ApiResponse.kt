package com.ekomitepintar.model

/**
 * Generic API response wrapper yang sesuai dengan format backend.
 * Backend selalu mengembalikan: { success: Boolean, message: String, data: T? }
 */
data class ApiResponse<T>(
    val success: Boolean,
    val message: String,
    val data: T? = null,
    val errors: List<ValidationError>? = null
)

data class ValidationError(
    val field: String,
    val message: String
)
