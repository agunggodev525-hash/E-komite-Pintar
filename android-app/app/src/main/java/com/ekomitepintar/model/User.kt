package com.ekomitepintar.model

import com.google.gson.annotations.SerializedName

/**
 * Data user dari backend.
 */
data class User(
    val id: String,
    @SerializedName("nama_lengkap")
    val namaLengkap: String,
    val email: String,
    @SerializedName("no_whatsapp")
    val noWhatsapp: String? = null,
    val role: String,
    val status: Boolean = true,
    @SerializedName("foto_profil")
    val fotoProfil: String? = null
)
