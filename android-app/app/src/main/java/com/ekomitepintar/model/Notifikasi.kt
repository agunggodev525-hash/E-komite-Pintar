package com.ekomitepintar.model

import com.google.gson.annotations.SerializedName

data class Notifikasi(
    @SerializedName("id")
    val id: String,
    
    @SerializedName("judul")
    val judul: String,
    
    @SerializedName("pesan")
    val pesan: String,
    
    @SerializedName("tipe")
    val tipe: String,
    
    @SerializedName("is_read")
    val isRead: Boolean,
    
    @SerializedName("created_at")
    val createdAt: String
)
