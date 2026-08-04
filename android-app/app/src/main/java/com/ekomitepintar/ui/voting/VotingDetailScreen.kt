package com.ekomitepintar.ui.voting

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
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
                title = { Text("Detail Voting", color = White) },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Navy900
                ),
                navigationIcon = {
                    TextButton(onClick = onNavigateBack) {
                        Text("←", color = White, fontSize = 20.sp)
                    }
                }
            )
        },
        containerColor = Navy800
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
                color = White,
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = voting.deskripsi ?: "Tidak ada deskripsi.",
                color = White80,
                fontSize = 14.sp
            )
            Spacer(modifier = Modifier.height(16.dp))
            Divider(color = White.copy(alpha = 0.1f))
            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = "Pilih Kandidat / Opsi",
                color = Gold400,
                fontWeight = FontWeight.Bold,
                fontSize = 16.sp
            )
            Spacer(modifier = Modifier.height(16.dp))

            voting.kandidat.forEach { kandidat ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 12.dp)
                        .background(Navy700, RoundedCornerShape(8.dp))
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
                            selectedColor = Gold400,
                            unselectedColor = White40
                        ),
                        enabled = !voting.hasVoted
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Text(
                        text = kandidat.nama_kandidat,
                        color = White,
                        fontSize = 16.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(32.dp))

            if (!voting.hasVoted) {
                Button(
                    onClick = { showDialog = true },
                    enabled = selectedKandidatId != null && !uiState.isLoading,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Gold400,
                        contentColor = Navy900
                    ),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(54.dp),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    if (uiState.isLoading) {
                        CircularProgressIndicator(color = Navy900, modifier = Modifier.size(24.dp))
                    } else {
                        Text("Submit Suara", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                    }
                }
            } else {
                Surface(
                    color = Color(0xFF10B981).copy(alpha = 0.1f),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = "Anda sudah memberikan suara pada voting ini.",
                        color = Color(0xFF34D399),
                        modifier = Modifier.padding(16.dp),
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center
                    )
                }
            }

            // Alert Dialog Konfirmasi
            if (showDialog) {
                AlertDialog(
                    onDismissRequest = { showDialog = false },
                    title = { Text("Konfirmasi Suara") },
                    text = { Text("Apakah Anda yakin dengan pilihan ini? Suara tidak dapat diubah setelah dikirim.") },
                    confirmButton = {
                        TextButton(
                            onClick = {
                                showDialog = false
                                selectedKandidatId?.let {
                                    viewModel.submitVote(voting.id, it)
                                }
                            }
                        ) {
                            Text("Yakin", color = Gold400, fontWeight = FontWeight.Bold)
                        }
                    },
                    dismissButton = {
                        TextButton(onClick = { showDialog = false }) {
                            Text("Batal", color = Color.Gray)
                        }
                    },
                    containerColor = Navy700,
                    titleContentColor = White,
                    textContentColor = White80
                )
            }
        }
    }
}
