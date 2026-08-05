package com.ekomitepintar.model

import com.google.gson.annotations.SerializedName

/**
 * Data Laporan Transparansi.
 */
data class TransparansiData(
    @SerializedName("total_pemasukan")
    val totalPemasukan: Double,
    @SerializedName("total_pengeluaran")
    val totalPengeluaran: Double,
    @SerializedName("saldo_akhir")
    val saldoAkhir: Double,
    val history: List<TransparansiHistory>
)

data class TransparansiHistory(
    val id: String,
    val tanggal: String,
    val keterangan: String,
    val nominal: Double,
    val jenis: String, // "PEMASUKAN" or "PENGELUARAN"
    @SerializedName("nota_url")
    val notaUrl: String? = null
)
