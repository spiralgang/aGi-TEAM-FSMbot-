// bridge/TermuxReceiver.kt (optional)
package com.spiralgang.axiumlauncher.bridge

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.spiralgang.axiumlauncher.core.AxiumApi
import com.spiralgang.axiumlauncher.core.OverlayService
import com.spiralgang.axiumlauncher.core.PolicyStore
import com.spiralgang.axiumlauncher.core.Enforcer

class TermuxReceiver : BroadcastReceiver() {
    override fun onReceive(ctx: Context, intent: Intent) {
        when (intent.action) {
            AxiumApi.ACT_ENFORCE -> OverlayService.showBlocking(ctx, "Axium Enforcement: Triggered")
            AxiumApi.ACT_PROFILE -> {
                val profName = intent.getStringExtra("profile") ?: return
                // Simplified: load profile by name if you add multi-profile support
                Enforcer.updateProfile(PolicyStore.load(ctx))
            }
            AxiumApi.ACT_OVERRIDE -> {
                // For userspace, you can implement override windows as a flag in preferences
                OverlayService.showBlocking(ctx, "Override window requested")
            }
        }
    }
}
