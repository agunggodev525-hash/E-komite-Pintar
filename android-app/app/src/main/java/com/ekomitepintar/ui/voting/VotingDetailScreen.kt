package com.ekomitepintar.ui.voting

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.border
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.ekomitepintar.model.Voting
import com.ekomitepintar.ui.theme.*
import com.ekomitepintar.viewmodel.VotingViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun VotingDetailScreen(
    voting: Voting,
    viewModel: VotingViewModel,
    onNavigateBack: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    var selectedKandidatId by remember { mutableStateOf<String?>(null) }
    var showDialog by remember { mutableStateOf(false) }

    LaunchedEffect(uiState.isVoteSuccess) {
        if (uiState.isVoteSuccess) {
            onNavigateBack()
            viewModel.clearMessages()
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Detail Voting", color = Slate800, fontWeight = FontWeight.Bold) },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color.Transparent
                ),
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Kembali", tint = Slate800)
                    }
                }
            )
        },
        containerColor = BackgroundLight
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .padding(24.dp)
        ) {
            Text(
                text = voting.judul,
                color = Slate800,
                fontSize = 24.sp,
                fontWeight = FontWeight.Black
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = voting.deskripsi ?: "Tidak ada deskripsi.",
                color = Slate500,
                fontSize = 14.sp
            )
            Spacer(modifier = Modifier.height(16.dp))
            HorizontalDivider(color = Color(0xFFE2E8F0))
            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = "Pilih Kandidat / Opsi",
                color = Emerald600,
                fontWeight = FontWeight.Bold,
                fontSize = 16.sp
            )
            Spacer(modifier = Modifier.height(16.dp))

            voting.kandidat.forEach { kandidat ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 12.dp)
                        .background(CardWhite, RoundedCornerShape(12.dp))
                        .border(
                            width = 1.dp,
                            color = if (kandidat.id == selectedKandidatId) Emerald500 else Color(0xFFF3F4F6),
                            shape = RoundedCornerShape(12.dp)
                        )
                        .selectable(
                            selected = (kandidat.id == selectedKandidatId),
                            onClick = {
                                if (!voting.hasVoted) {
                                    selectedKandidatId = kandidat.id
                                }
                            }
                        )
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    RadioButton(
                        selected = (kandidat.id == selectedKandidatId) || (voting.hasVoted && voting.voted_kandidat_id == kandidat.id),
                        onClick = null,
                        colors = RadioButtonDefaults.colors(
                            selectedColor = Emerald600,
                            unselectedColor = Slate400
                        ),
                        enabled = !voting.hasVoted
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Text(
                        text = kandidat.nama_kandidat,
                        color = Slate800,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                }
            }

            Spacer(modifier = Modifier.height(32.dp))

            if (!voting.hasVoted) {
                Button(
                    onClick = { showDialog = true },
                    enabled = selectedKandidatId != null && !uiState.isLoading,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Emerald600,
                        contentColor = Color.White
                    ),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    if (uiState.isLoading) {
                        CircularProgressIndicator(color = Color.White, modifier = Modifier.size(24.dp))
                    } else {
                        Text("Submit Suara", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                    }
                }
            } else {
                Surface(
                    color = Emerald50,
                    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFD1FAE5)),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = "Anda sudah memberikan suara pada voting ini.",
                        color = Emerald600,
                        modifier = Modifier.padding(16.dp),
                        textAlign = TextAlign.Center,
                        fontWeight = FontWeight.Medium
                    )
                }
            }

            if (uiState.errorMessage != null) {
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = uiState.errorMessage ?: "",
                    color = Rose600,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.fillMaxWidth()
                )
            }
        }
    }

    if (showDialog) {
        AlertDialog(
            onDismissRequest = { showDialog = false },
            title = { Text("Konfirmasi Voting", fontWeight = FontWeight.Bold, color = Slate800) },
            text = { Text("Apakah Anda yakin ingin memberikan suara untuk kandidat ini? Pilihan tidak dapat diubah.", color = Slate500) },
            confirmButton = {
                TextButton(
                    onClick = {
                        showDialog = false
                        selectedKandidatId?.let { viewModel.submitVote(voting.id, it) }
                    }
                ) {
                    Text("Ya, Yakin", color = Emerald600, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showDialog = false }) {
                    Text("Batal", color = Slate500)
                }
            },
            containerColor = CardWhite,
            textContentColor = Slate500,
            titleContentColor = Slate800
        )
    }
}
