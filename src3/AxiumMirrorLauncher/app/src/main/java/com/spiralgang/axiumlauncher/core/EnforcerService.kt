// core/EnforcerService.kt
package com.spiralgang.axiumlauncher.core

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Intent
import android.os.IBinder
import androidx.core.app.NotificationCompat

class EnforcerService : Service() {
    override fun onCreate() {
        startForeground(1, notif("Axium Mirror: Idle"))
    }

    private fun notif(text: String): Notification {
        val ch = "axium_mirror"
        val nm = getSystemService(NotificationManager::class.java)
        nm.createNotificationChannel(NotificationChannel(ch, "Axium Mirror", NotificationManager.IMPORTANCE_LOW))
        return NotificationCompat.Builder(this, ch)
            .setSmallIcon(android.R.drawable.stats_sys_warning)
            .setContentTitle("Axium Overlord Path")
            .setContentText(text)
            .setOngoing(true)
            .build()
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
