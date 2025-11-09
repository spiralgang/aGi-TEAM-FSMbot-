// ui/LauncherActivity.kt
package com.spiralgang.axiumlauncher.ui

import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.GridLayoutManager
import com.spiralgang.axiumlauncher.databinding.ActivityLauncherBinding
import com.spiralgang.axiumlauncher.ui.adapter.AppsAdapter
import com.spiralgang.axiumlauncher.core.Enforcer
import com.spiralgang.axiumlauncher.core.OverlayService
import com.spiralgang.axiumlauncher.core.PolicyStore

class LauncherActivity : AppCompatActivity(), AppsAdapter.OnAppClick {
    private lateinit var b: ActivityLauncherBinding
    private val adapter = AppsAdapter(this)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        b = ActivityLauncherBinding.inflate(layoutInflater)
        setContentView(b.root)

        b.appsRecycler.layoutManager = GridLayoutManager(this, 5)
        b.appsRecycler.adapter = adapter

        // Load apps
        adapter.submitList(AppsAdapter.queryLaunchables(this))

        b.btnSettings.setOnClickListener {
            startActivity(Intent(this, SettingsActivity::class.java))
        }

        // Initialize policy
        Enforcer.updateProfile(PolicyStore.load(this))

        // Start overlay service (no OS modifications)
        startService(Intent(this, OverlayService::class.java))
    }

    override fun onResume() {
        super.onResume()
        // Refresh policy in case settings changed
        Enforcer.updateProfile(PolicyStore.load(this))
    }

    override fun onAppClicked(pkg: String, activity: String) {
        val eval = Enforcer.evaluate(pkg)
        if (eval.passed) {
            launch(pkg, activity)
        } else {
            OverlayService.showBlocking(this, eval.reason ?: "Axium Overlord: Non-compliant")
        }
    }

    private fun launch(packageName: String, activityName: String) {
        val intent = Intent().apply {
            setClassName(packageName, activityName)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        try {
            startActivity(intent)
        } catch (e: Exception) {
            // If activity fails, attempt to resolve via default LAUNCHER intent
            val pm = packageManager
            val mainIntent = pm.getLaunchIntentForPackage(packageName)
            if (mainIntent != null) startActivity(mainIntent)
        }
    }
}
