package com.ekomitepintar

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import com.ekomitepintar.ui.navigation.NavGraph
import com.ekomitepintar.ui.theme.EKomitePintarTheme
import com.ekomitepintar.ui.theme.Navy900

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            EKomitePintarTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = Navy900
                ) {
                    NavGraph()
                }
            }
        }
    }
}
