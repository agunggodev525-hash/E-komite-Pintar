package com.ekomitepintar.service

import android.content.Intent
import android.util.Log
import androidx.localbroadcastmanager.content.LocalBroadcastManager
import com.ekomitepintar.network.RetrofitClient
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class MyFirebaseMessagingService : FirebaseMessagingService() {

    companion object {
        const val TAG = "FCMService"
        const val ACTION_REFRESH_TAGIHAN = "com.ekomitepintar.ACTION_REFRESH_TAGIHAN"
        const val ACTION_PEMBAYARAN_SUKSES = "com.ekomitepintar.ACTION_PEMBAYARAN_SUKSES"
    }

    override fun onNewToken(token: String) {
        Log.d(TAG, "Refreshed token: $token")
        // Kirim token baru ke backend agar notifikasi tetap terkirim
        CoroutineScope(Dispatchers.IO).launch {
            try {
                RetrofitClient.getApiService().updateFcmToken(mapOf("fcm_token" to token))
                Log.d(TAG, "FCM token berhasil diperbarui ke server")
            } catch (e: Exception) {
                Log.e(TAG, "Gagal memperbarui FCM token: ${e.message}")
            }
        }
    }

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        Log.d(TAG, "From: ${remoteMessage.from}")

        val dataPayload = remoteMessage.data
        val action = dataPayload["action"]

        // Handle data payload
        if (dataPayload.isNotEmpty()) {
            Log.d(TAG, "Message data payload: $dataPayload")

            when (action) {
                "NEW_TAGIHAN" -> {
                    // Broadcast ke UI agar list tagihan refresh
                    Log.d(TAG, "Broadcasting ACTION_REFRESH_TAGIHAN")
                    val intent = Intent(ACTION_REFRESH_TAGIHAN)
                    LocalBroadcastManager.getInstance(this).sendBroadcast(intent)
                }
                "PEMBAYARAN_SUKSES" -> {
                    // Broadcast ke UI agar status tagihan diupdate tanpa refresh manual
                    Log.d(TAG, "Broadcasting ACTION_PEMBAYARAN_SUKSES")
                    val intent = Intent(ACTION_PEMBAYARAN_SUKSES).apply {
                        putExtra("tagihan_id", dataPayload["tagihan_id"])
                        putExtra("pembayaran_id", dataPayload["pembayaran_id"])
                    }
                    LocalBroadcastManager.getInstance(this).sendBroadcast(intent)
                }
            }
        }

        // Tampilkan notifikasi visual + suara
        // Prioritaskan notification payload dari FCM, fallback ke data payload
        val title = remoteMessage.notification?.title ?: dataPayload["title"]
        val body = remoteMessage.notification?.body ?: dataPayload["body"]

        if (!title.isNullOrBlank() || !body.isNullOrBlank()) {
            Log.d(TAG, "Showing notification: $title - $body")
            showNotification(title, body)
        }
    }

    private fun showNotification(title: String?, body: String?) {
        val channelId = "tagihan_channel"
        val channelName = "Notifikasi Tagihan"
        val notificationManager = getSystemService(android.content.Context.NOTIFICATION_SERVICE) as android.app.NotificationManager

        // Create the NotificationChannel (API 26+)
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            val channel = android.app.NotificationChannel(
                channelId,
                channelName,
                android.app.NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Channel untuk notifikasi tagihan & pembayaran"
                enableLights(true)
                lightColor = android.graphics.Color.GREEN
                enableVibration(true)
                vibrationPattern = longArrayOf(0, 300, 200, 300)
            }
            notificationManager.createNotificationChannel(channel)
        }

        val defaultSoundUri = android.media.RingtoneManager.getDefaultUri(android.media.RingtoneManager.TYPE_NOTIFICATION)

        val intent = Intent(this, com.ekomitepintar.MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        }
        val pendingIntent: android.app.PendingIntent = android.app.PendingIntent.getActivity(
            this, 0, intent, android.app.PendingIntent.FLAG_IMMUTABLE or android.app.PendingIntent.FLAG_UPDATE_CURRENT
        )

        val notificationBuilder = androidx.core.app.NotificationCompat.Builder(this, channelId)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle(title ?: "E-Komite Pintar")
            .setContentText(body ?: "Ada pembaruan data")
            .setStyle(androidx.core.app.NotificationCompat.BigTextStyle().bigText(body ?: "Ada pembaruan data"))
            .setAutoCancel(true)
            .setSound(defaultSoundUri)
            .setVibrate(longArrayOf(0, 300, 200, 300))
            .setPriority(androidx.core.app.NotificationCompat.PRIORITY_HIGH)
            .setContentIntent(pendingIntent)

        val notificationId = System.currentTimeMillis().toInt()
        notificationManager.notify(notificationId, notificationBuilder.build())
    }
}
