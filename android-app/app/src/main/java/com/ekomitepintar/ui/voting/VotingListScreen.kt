package com.ekomitepintar.ui.voting

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.HowToVote
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
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
fun VotingListScreen(
    viewModel: VotingViewModel,
    onNavigateBack: () -> Unit,
    onNavigateToDetail: (Voting) -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()

    LaunchedEffect(Unit) {
        viewModel.fetchActiveVoting()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("E-Voting", color = White) },
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
        Box(modifier = Modifier.fillMaxSize().padding(padding)) {
            if (uiState.isLoading) {
                CircularProgressIndicator(
                    color = Gold400,
                    modifier = Modifier.align(Alignment.Center)
                )
            } else if (uiState.votingList.isEmpty()) {
                Text(
                    text = "Belum ada voting aktif saat ini.",
                    color = White60,
                    modifier = Modifier.align(Alignment.Center)
                )
            } else {
                LazyColumn(
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    items(uiState.votingList) { voting ->
                        VotingCard(
                            voting = voting,
                            onClick = { onNavigateToDetail(voting) }
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun VotingCard(voting: Voting, onClick: () -> Unit) {
    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Navy700),
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .background(Gold400.copy(alpha = 0.2f), RoundedCornerShape(8.dp)),
                contentAlignment = Alignment.Center
            ) {
                Icon(Icons.Filled.HowToVote, contentDescription = "Vote", tint = Gold400)
            }
            Spacer(modifier = Modifier.width(16.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = voting.judul,
                    color = White,
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Batas: ${voting.tanggal_berakhir.take(10)}",
                    color = White60,
                    fontSize = 12.sp
                )
            }
            if (voting.hasVoted) {
                Surface(
                    color = Color(0xFF10B981).copy(alpha = 0.2f),
                    shape = RoundedCornerShape(4.dp)
                ) {
                    Text(
                        text = "Sudah Memilih",
                        color = Color(0xFF34D399),
                        fontSize = 10.sp,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
            } else {
                Surface(
                    color = Gold400.copy(alpha = 0.2f),
                    shape = RoundedCornerShape(4.dp)
                ) {
                    Text(
                        text = "Belum Memilih",
                        color = Gold400,
                        fontSize = 10.sp,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
            }
        }
    }
}
