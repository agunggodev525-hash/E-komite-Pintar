package com.ekomitepintar.network

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import com.ekomitepintar.MainActivity
import com.ekomitepintar.R
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class MyFirebaseMessagingService : FirebaseMessagingService() {

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        // Kirim token baru ini ke backend jika user sedang login
        sendRegistrationToServer(token)
    }

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)

        // Cek apakah ada data payload
        if (remoteMessage.data.isNotEmpty()) {
            // Handle data payload (misal navigasi ke screen tagihan)
        }

        // Cek apakah ada notification payload
        remoteMessage.notification?.let {
            sendNotification(it.title, it.body)
        }
    }

    private fun sendRegistrationToServer(token: String) {
        // Implementasi pengiriman token ke backend (POST /api/v1/auth/fcm-token)
        // Karena ini Service (background), kita gunakan CoroutineScope independen
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val apiService = RetrofitClient.getApiService()
                val request = mapOf("fcm_token" to token)
                apiService.updateFcmToken(request)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    private fun sendNotification(title: String?, messageBody: String?) {
        val intent = Intent(this, MainActivity::class.java).apply {
            addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
        }
        
        val pendingIntent = PendingIntent.getActivity(
            this, 0, intent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_ONE_SHOT
        )

        val channelId = "ekomite_channel_id"
        val notificationBuilder = NotificationCompat.Builder(this, channelId)
            // Gunakan icon default/aplikasi
            .setSmallIcon(android.R.drawable.ic_dialog_info) 
            .setContentTitle(title ?: "E-Komite Pintar")
            .setContentText(messageBody)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)

        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        // Tambahkan channel untuk Android O ke atas
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "E-Komite Notifications",
                NotificationManager.IMPORTANCE_DEFAULT
            )
            notificationManager.createNotificationChannel(channel)
        }

        notificationManager.notify(0, notificationBuilder.build())
    }
}
