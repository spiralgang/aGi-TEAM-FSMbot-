// core/OverlayService.kt
package com.spiralgang.axiumlauncher.core

import android.app.Service
import android.content.Context
import android.content.Intent
import android.graphics.PixelFormat
import android.os.IBinder
import android.view.*
import android.widget.Button
import android.widget.TextView
import com.spiralgang.axiumlauncher.R
import com.spiralgang.axiumlauncher.ui.SettingsActivity

class OverlayService : Service() {
    companion object {
        fun showBlocking(ctx: Context, msg: String) {
            val i = Intent(ctx, OverlayService::class.java).apply { putExtra("msg", msg) }
            ctx.startService(i)
        }
    }

    private var wm: WindowManager? = null
    private var view: View? = null

    override fun onCreate() {
        wm = getSystemService(WindowManager::class.java)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val txt = intent?.getStringExtra("msg") ?: "Axium Overlord — Non-compliant"
        show(txt)
        return START_NOT_STICKY
    }

    private fun show(text: String) {
        hide()
        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
            WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
            PixelFormat.TRANSLUCENT
        ).apply { gravity = Gravity.TOP }

        view = LayoutInflater.from(this).inflate(R.layout.overlay_banner, null)
        view!!.findViewById<TextView>(R.id.bannerText).text = text
        view!!.findViewById<Button>(R.id.btnResolve).setOnClickListener {
            val i = Intent(this, SettingsActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            startActivity(i)
            hide()
        }
        wm?.addView(view, params)
    }

    private fun hide() {
        view?.let { wm?.removeView(it) }
        view = null
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
