// bridge/VpnStintService.kt (optional skeleton)
package com.spiralgang.axiumlauncher.bridge

import android.net.VpnService
import android.content.Intent

class VpnStintService : VpnService() {
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // TODO: build userspace tunnel, route per-package through mTLS proxy
        return START_STICKY
    }
}
