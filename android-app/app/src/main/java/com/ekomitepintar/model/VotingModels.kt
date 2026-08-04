package com.ekomitepintar.model

data class Voting(
    val id: String,
    val judul: String,
    val deskripsi: String?,
    val tanggal_berakhir: String,
    val hasVoted: Boolean,
    val voted_kandidat_id: String?,
    val kandidat: List<VotingKandidat>
)

data class VotingKandidat(
    val id: String,
    val nama_kandidat: String
)

data class VoteRequest(
    val voting_id: String,
    val kandidat_id: String
)
