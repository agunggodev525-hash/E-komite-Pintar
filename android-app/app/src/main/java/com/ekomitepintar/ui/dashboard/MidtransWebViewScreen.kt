package com.ekomitepintar.ui.dashboard

import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MidtransWebViewScreen(
    checkoutUrl: String,
    onNavigateBack: () -> Unit
) {
    var isLoading by remember { mutableStateOf(true) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Pembayaran") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Kembali")
                    }
                }
            )
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            AndroidView(
                factory = { context ->
                    WebView(context).apply {
                        settings.javaScriptEnabled = true
                        settings.domStorageEnabled = true
                        webViewClient = object : WebViewClient() {
                            override fun onPageFinished(view: WebView?, url: String?) {
                                super.onPageFinished(view, url)
                                isLoading = false
                            }

                            override fun shouldOverrideUrlLoading(
                                view: WebView?,
                                request: WebResourceRequest?
                            ): Boolean {
                                val url = request?.url?.toString() ?: ""
                                
                                // Tangani custom scheme untuk e-wallet (GoPay, ShopeePay, dll)
                                if (url.startsWith("intent://") || (!url.startsWith("http://") && !url.startsWith("https://"))) {
                                    try {
                                        val intent = android.content.Intent.parseUri(url, android.content.Intent.URI_INTENT_SCHEME)
                                        if (intent != null) {
                                            view?.context?.startActivity(intent)
                                            return true
                                        }
                                    } catch (e: Exception) {
                                        e.printStackTrace()
                                    }
                                    return true // Cegah webview dari error ERR_UNKNOWN_URL_SCHEME
                                }
                                
                                return false
                            }
                        }
                        webChromeClient = WebChromeClient()
                        loadUrl(checkoutUrl)
                    }
                },
                modifier = Modifier.fillMaxSize()
            )

            if (isLoading) {
                LinearProgressIndicator(modifier = Modifier.fillMaxSize())
            }
        }
    }
}
