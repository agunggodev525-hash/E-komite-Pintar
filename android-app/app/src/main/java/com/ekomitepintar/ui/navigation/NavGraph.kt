package com.ekomitepintar.ui.navigation

import androidx.compose.animation.*
import androidx.compose.animation.core.tween
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.ekomitepintar.ui.dashboard.DashboardScreen
import com.ekomitepintar.ui.login.LoginScreen
import com.ekomitepintar.ui.login.LoginOtpScreen
import com.ekomitepintar.viewmodel.DashboardViewModel
import com.ekomitepintar.viewmodel.LoginViewModel
import com.ekomitepintar.viewmodel.VotingViewModel
import com.ekomitepintar.ui.voting.VotingListScreen
import com.ekomitepintar.ui.voting.VotingDetailScreen
import com.ekomitepintar.ui.history.RiwayatScreen
import com.ekomitepintar.ui.komite.KomiteScreen
import com.ekomitepintar.ui.komite.PengurusScreen
import com.ekomitepintar.ui.komite.ProgramKerjaScreen
import com.ekomitepintar.ui.profile.ProfilScreen
import com.ekomitepintar.ui.profile.PengaturanAkunScreen
import com.ekomitepintar.ui.profile.KeamananScreen
import com.ekomitepintar.ui.profile.NotifikasiScreen
import com.ekomitepintar.ui.profile.BantuanScreen

/**
 * Definisi route navigasi.
 */
object Routes {
    const val LOGIN = "login"
    const val LOGIN_OTP = "login_otp"
    const val DASHBOARD = "dashboard"
    const val VOTING_LIST = "voting_list"
    const val VOTING_DETAIL = "voting_detail"
    const val PAYMENT = "payment"
    const val TRANSPARANSI = "transparansi"
    const val RIWAYAT = "riwayat"
    const val KOMITE = "komite"
    const val PENGURUS = "pengurus"
    const val PROGRAM_KERJA = "program_kerja"
    const val PROFIL = "profil"
    const val PENGATURAN_AKUN = "pengaturan_akun"
    const val KEAMANAN = "keamanan"
    const val NOTIFIKASI = "notifikasi"
    const val BANTUAN = "bantuan"
}

/**
 * Navigation Graph utama.
 * Login → Dashboard (one-way, clear backstack pada login success)
 * Dashboard → Login (on logout, clear backstack)
 */
@Composable
fun NavGraph() {
    val navController = rememberNavController()
    // Shared ViewModel untuk E-Voting
    val votingViewModel: VotingViewModel = viewModel()

    NavHost(
        navController = navController,
        startDestination = Routes.LOGIN,
        enterTransition = {
            val isBottomNav = initialState.destination.route in listOf(Routes.DASHBOARD, Routes.RIWAYAT, Routes.KOMITE, Routes.PROFIL) &&
                              targetState.destination.route in listOf(Routes.DASHBOARD, Routes.RIWAYAT, Routes.KOMITE, Routes.PROFIL)
            if (isBottomNav) {
                fadeIn(animationSpec = tween(200))
            } else {
                fadeIn(animationSpec = tween(300)) + slideInHorizontally(
                    initialOffsetX = { it / 3 },
                    animationSpec = tween(300)
                )
            }
        },
        exitTransition = {
            fadeOut(animationSpec = tween(200))
        },
        popEnterTransition = {
            fadeIn(animationSpec = tween(300))
        },
        popExitTransition = {
            val isBottomNav = initialState.destination.route in listOf(Routes.DASHBOARD, Routes.RIWAYAT, Routes.KOMITE, Routes.PROFIL) &&
                              targetState.destination.route in listOf(Routes.DASHBOARD, Routes.RIWAYAT, Routes.KOMITE, Routes.PROFIL)
            if (isBottomNav) {
                fadeOut(animationSpec = tween(200))
            } else {
                fadeOut(animationSpec = tween(300)) + slideOutHorizontally(
                    targetOffsetX = { it / 3 },
                    animationSpec = tween(300)
                )
            }
        }
    ) {
        // ============================================
        // Login Screen
        // ============================================
        composable(Routes.LOGIN) {
            val loginViewModel: LoginViewModel = viewModel()

            LoginScreen(
                viewModel = loginViewModel,
                onLoginSuccess = {
                    navController.navigate(Routes.DASHBOARD) {
                        popUpTo(Routes.LOGIN) { inclusive = true }
                    }
                },
                onNavigateToOtp = {
                    navController.navigate(Routes.LOGIN_OTP)
                }
            )
        }
        
        // ============================================
        // Login OTP Screen
        // ============================================
        composable(Routes.LOGIN_OTP) {
            val loginViewModel: LoginViewModel = viewModel()

            LoginOtpScreen(
                viewModel = loginViewModel,
                onNavigateToDashboard = {
                    navController.navigate(Routes.DASHBOARD) {
                        popUpTo(Routes.LOGIN) { inclusive = true }
                    }
                },
                onNavigateBack = {
                    navController.popBackStack()
                }
            )
        }

        // ============================================
        // Dashboard Screen
        // ============================================
        composable(Routes.DASHBOARD) {
            val dashboardViewModel: DashboardViewModel = viewModel()

            DashboardScreen(
                viewModel = dashboardViewModel,
                onLogout = {
                    navController.navigate(Routes.LOGIN) {
                        popUpTo(0) { inclusive = true }
                    }
                },
                onNavigateToVoting = {
                    navController.navigate(Routes.VOTING_LIST)
                },
                onNavigateToPayment = { encodedUrl ->
                    navController.navigate("${Routes.PAYMENT}/$encodedUrl")
                },
                onNavigateToTransparansi = {
                    navController.navigate(Routes.TRANSPARANSI)
                },
                onNavigateToNotifikasi = {
                    navController.navigate(Routes.NOTIFIKASI)
                },
                onNavigateBottomTab = { route ->
                    navController.navigate(route) {
                        popUpTo(Routes.DASHBOARD) { saveState = true }
                        launchSingleTop = true
                        restoreState = true
                    }
                }
            )
        }

        // ============================================
        // Bottom Navigation Screens
        // ============================================
        composable(Routes.RIWAYAT) {
            val riwayatViewModel: com.ekomitepintar.viewmodel.RiwayatViewModel = viewModel()
            RiwayatScreen(
                viewModel = riwayatViewModel,
                onNavigate = { route ->
                    navController.navigate(route) {
                        popUpTo(Routes.DASHBOARD) { saveState = true }
                        launchSingleTop = true
                        restoreState = true
                    }
                }
            )
        }

        composable(Routes.KOMITE) {
            KomiteScreen(
                onNavigate = { route ->
                    navController.navigate(route) {
                        launchSingleTop = true
                        restoreState = true
                    }
                }
            )
        }
        
        composable(Routes.PENGURUS) {
            PengurusScreen(onNavigateBack = { navController.popBackStack() })
        }
        
        composable(Routes.PROGRAM_KERJA) {
            ProgramKerjaScreen(onNavigateBack = { navController.popBackStack() })
        }

        composable(Routes.PROFIL) {
            val profilViewModel: com.ekomitepintar.viewmodel.ProfilViewModel = viewModel()
            ProfilScreen(
                viewModel = profilViewModel,
                onNavigate = { route ->
                    navController.navigate(route) {
                        launchSingleTop = true
                        restoreState = true
                    }
                },
                onLogout = {
                    navController.navigate(Routes.LOGIN) {
                        popUpTo(0) { inclusive = true }
                        launchSingleTop = true
                    }
                }
            )
        }

        composable(Routes.PENGATURAN_AKUN) {
            PengaturanAkunScreen(onNavigateBack = { navController.popBackStack() })
        }
        
        composable(Routes.KEAMANAN) {
            KeamananScreen(onNavigateBack = { navController.popBackStack() })
        }
        
        composable(Routes.NOTIFIKASI) {
            NotifikasiScreen(onNavigateBack = { navController.popBackStack() })
        }
        
        composable(Routes.BANTUAN) {
            BantuanScreen(onNavigateBack = { navController.popBackStack() })
        }

        // ============================================
        // E-Voting Screens
        // ============================================
        composable(Routes.VOTING_LIST) {
            VotingListScreen(
                viewModel = votingViewModel,
                onNavigateBack = { navController.popBackStack() },
                onNavigateToDetail = { voting ->
                    navController.navigate("${Routes.VOTING_DETAIL}/${voting.id}")
                }
            )
        }

        composable(
            route = "${Routes.VOTING_DETAIL}/{votingId}"
        ) { backStackEntry ->
            val votingId = backStackEntry.arguments?.getString("votingId")
            val uiState by votingViewModel.uiState.collectAsStateWithLifecycle()
            val voting = uiState.votingList.find { it.id == votingId }
            
            if (voting != null) {
                VotingDetailScreen(
                    voting = voting,
                    viewModel = votingViewModel,
                    onNavigateBack = { navController.popBackStack() }
                )
            }
        }

        // ============================================
        // Payment (Midtrans) Screen
        // ============================================
        composable(
            route = "${Routes.PAYMENT}/{encodedUrl}"
        ) { backStackEntry ->
            val encodedUrl = backStackEntry.arguments?.getString("encodedUrl") ?: ""
            val decodedUrl = java.net.URLDecoder.decode(encodedUrl, "UTF-8")
            com.ekomitepintar.ui.dashboard.MidtransWebViewScreen(
                checkoutUrl = decodedUrl,
                onNavigateBack = { navController.popBackStack() }
            )
        }

        // ============================================
        // Transparansi Screen
        // ============================================
        composable(Routes.TRANSPARANSI) {
            val transparansiViewModel: com.ekomitepintar.viewmodel.TransparansiViewModel = viewModel()
            com.ekomitepintar.ui.transparansi.TransparansiScreen(
                viewModel = transparansiViewModel,
                onNavigateBack = { navController.popBackStack() }
            )
        }
    }
}
