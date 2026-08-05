package com.ekomitepintar.model

import com.google.gson.annotations.SerializedName

/**
 * Data tagihan dari backend.
 */
data class Tagihan(
    val id: String,
    val judul: String,
    val deskripsi: String? = null,
    val nominal: Double,
    @SerializedName("tenggat_waktu")
    val tenggatWaktu: String,
    @SerializedName("status_bayar")
    val statusBayar: String = "BELUM_BAYAR",
    val admin: AdminInfo? = null,
    val pembayaran: PembayaranInfo? = null
)

data class AdminInfo(
    val id: String,
    @SerializedName("nama_lengkap")
    val namaLengkap: String
)

data class PembayaranInfo(
    val id: String,
    val status: String,
    @SerializedName("metode_bayar")
    val metodeBayar: String? = null,
    @SerializedName("tanggal_bayar")
    val tanggalBayar: String? = null
)

/**
 * Data siswa ringkas.
 */
data class SiswaInfo(
    val id: String,
    @SerializedName("nama_siswa")
    val namaSiswa: String,
    val nisn: String,
    val kelas: String
)

/**
 * Response dari GET /tagihan/siswa/:siswaId
 */
data class TagihanSiswaData(
    val siswa: SiswaInfo,
    val summary: TagihanSummary,
    val tagihan: List<Tagihan>
)

data class TagihanSummary(
    @SerializedName("total_tagihan")
    val totalTagihan: Int,
    val lunas: Int,
    val pending: Int,
    @SerializedName("belum_bayar")
    val belumBayar: Int
)

/**
 * Request body untuk checkout pembayaran.
 */
data class CheckoutRequest(
    @SerializedName("tagihan_id")
    val tagihanId: String,
    @SerializedName("siswa_id")
    val siswaId: String,
    @SerializedName("metode_bayar")
    val metodeBayar: String = "TRANSFER_BANK"
)

/**
 * Response data dari checkout.
 */
data class CheckoutData(
    @SerializedName("snap_token")
    val snapToken: String,
    @SerializedName("order_id")
    val orderId: String
)

data class PembayaranDetail(
    val id: String,
    val status: String,
    val tagihan: TagihanBrief? = null,
    val siswa: SiswaBrief? = null
)

data class TagihanBrief(
    val id: String,
    val judul: String,
    val nominal: Double
)

data class SiswaBrief(
    val id: String,
    @SerializedName("nama_siswa")
    val namaSiswa: String,
    val nisn: String
)
