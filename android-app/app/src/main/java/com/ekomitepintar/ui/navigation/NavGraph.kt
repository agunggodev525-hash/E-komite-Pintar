package com.ekomitepintar.ui.navigation

import androidx.compose.animation.*
import androidx.compose.animation.core.tween
import androidx.compose.runtime.Composable
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

/**
 * Definisi route navigasi.
 */
object Routes {
    const val LOGIN = "login"
    const val LOGIN_OTP = "login_otp"
    const val DASHBOARD = "dashboard"
    const val VOTING_LIST = "voting_list"
    const val VOTING_DETAIL = "voting_detail"
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
            fadeIn(animationSpec = tween(300)) + slideInHorizontally(
                initialOffsetX = { it / 3 },
                animationSpec = tween(300)
            )
        },
        exitTransition = {
            fadeOut(animationSpec = tween(300))
        },
        popEnterTransition = {
            fadeIn(animationSpec = tween(300))
        },
        popExitTransition = {
            fadeOut(animationSpec = tween(300)) + slideOutHorizontally(
                targetOffsetX = { it / 3 },
                animationSpec = tween(300)
            )
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
                }
            )
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
            val voting = votingViewModel.uiState.value.votingList.find { it.id == votingId }
            
            if (voting != null) {
                VotingDetailScreen(
                    voting = voting,
                    viewModel = votingViewModel,
                    onNavigateBack = { navController.popBackStack() }
                )
            }
        }
    }
}
