package com.fsmbot.overlay

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.graphics.PixelFormat
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.IBinder
import android.util.TypedValue
import android.view.Gravity
import android.view.View
import android.view.WindowManager
import android.widget.FrameLayout
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat
import com.facebook.react.ReactApplication
import com.facebook.react.ReactRootView
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.facebook.react.uimanager.ViewManager
import java.lang.ref.WeakReference

private const val CHANNEL_ID = "fsm_overlay_channel"
private const val NOTIFICATION_ID = 7701

@ReactModule(name = FSMOverlayModule.NAME)
class FSMOverlayModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext),
  LifecycleEventListener {

  init {
    reactContext.addLifecycleEventListener(this)
  }

  override fun getName(): String = NAME

  @ReactMethod
  fun showOverlay(promise: Promise) {
    try {
      FSMOverlayService.start(reactContext, FSMOverlayService.ACTION_SHOW)
      promise.resolve(null)
    } catch (error: Throwable) {
      promise.reject("overlay_error", error)
    }
  }

  @ReactMethod
  fun hideOverlay(promise: Promise) {
    try {
      FSMOverlayService.start(reactContext, FSMOverlayService.ACTION_HIDE)
      promise.resolve(null)
    } catch (error: Throwable) {
      promise.reject("overlay_error", error)
    }
  }

  @ReactMethod
  fun expand(promise: Promise) {
    try {
      FSMOverlayService.start(reactContext, FSMOverlayService.ACTION_EXPAND)
      promise.resolve(null)
    } catch (error: Throwable) {
      promise.reject("overlay_error", error)
    }
  }

  @ReactMethod
  fun collapse(promise: Promise) {
    try {
      FSMOverlayService.start(reactContext, FSMOverlayService.ACTION_COLLAPSE)
      promise.resolve(null)
    } catch (error: Throwable) {
      promise.reject("overlay_error", error)
    }
  }

  @ReactMethod
  fun shutdown(promise: Promise) {
    try {
      FSMOverlayService.stop(reactContext)
      promise.resolve(null)
    } catch (error: Throwable) {
      promise.reject("overlay_error", error)
    }
  }

  @ReactMethod
  fun setGeometry(x: Double, y: Double, collapsed: Boolean, promise: Promise) {
    try {
      FSMOverlayService.updateGeometry(
        positionX = x.toInt(),
        positionY = y.toInt(),
        collapsed = collapsed,
      )
      promise.resolve(null)
    } catch (error: Throwable) {
      promise.reject("overlay_error", error)
    }
  }

  override fun onHostResume() {
    // no-op
  }

  override fun onHostPause() {
    // no-op
  }

  override fun onHostDestroy() {
    FSMOverlayService.stop(reactContext)
  }

  companion object {
    const val NAME = "FSMOverlay"
  }
}

class FSMOverlayPackage : ReactPackage {
  override fun createNativeModules(reactContext: ReactApplicationContext) =
    listOf(FSMOverlayModule(reactContext))

  override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> =
    emptyList()
}

class FSMOverlayService : Service() {
  private var windowManager: WindowManager? = null
  private var overlayContainer: FrameLayout? = null
  private var rootView: ReactRootView? = null
  private var layoutParams: WindowManager.LayoutParams? = null
  private var collapsed = true

  override fun onCreate() {
    super.onCreate()
    serviceRef = WeakReference(this)
    windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager
    ensureNotificationChannel()
  }

  override fun onDestroy() {
    super.onDestroy()
    removeOverlay()
    serviceRef = WeakReference(null)
  }

  override fun onBind(intent: Intent?): IBinder? = null

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    when (intent?.action) {
      ACTION_HIDE -> hideOverlay()
      ACTION_EXPAND -> updateCollapsed(false)
      ACTION_COLLAPSE -> updateCollapsed(true)
      ACTION_STOP -> {
        hideOverlay()
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
      }
      else -> showOverlay()
    }

    startForeground(NOTIFICATION_ID, buildNotification())
    return START_STICKY
  }

  private fun ensureNotificationChannel() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val manager = getSystemService(NotificationManager::class.java)
      val channel = NotificationChannel(
        CHANNEL_ID,
        getStringResource("fsm_overlay_channel_name", "FSM Overlay"),
        NotificationManager.IMPORTANCE_LOW,
      )
      manager?.createNotificationChannel(channel)
    }
  }

  private fun buildNotification(): Notification {
    val launchIntent = packageManager?.getLaunchIntentForPackage(packageName)
    val pendingIntent = if (launchIntent != null) {
      PendingIntent.getActivity(
        this,
        0,
        launchIntent,
        PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
      )
    } else {
      null
    }

    return NotificationCompat.Builder(this, CHANNEL_ID)
      .setSmallIcon(android.R.drawable.stat_notify_more)
      .setContentTitle(getStringResource("fsm_overlay_notification_title", "Floating Console"))
      .setContentText(getStringResource("fsm_overlay_notification_text", "Tap to return to the console"))
      .setOngoing(true)
      .setContentIntent(pendingIntent)
      .build()
  }

  private fun getStringResource(name: String, fallback: String): String {
    val resId = resources.getIdentifier(name, "string", packageName)
    return if (resId != 0) getString(resId) else fallback
  }

  private fun showOverlay() {
    if (overlayContainer != null) {
      overlayContainer?.visibility = View.VISIBLE
      return
    }

    runOnUiThread {
      val container = FrameLayout(this).apply {
        setBackgroundColor(0x00000000)
        setOnClickListener { updateCollapsed(false) }
      }

      val reactRoot = createReactRootView()
      container.addView(
        reactRoot,
        FrameLayout.LayoutParams(
          FrameLayout.LayoutParams.MATCH_PARENT,
          FrameLayout.LayoutParams.WRAP_CONTENT,
        ),
      )

      val params = createLayoutParams()
      windowManager?.addView(container, params)

      overlayContainer = container
      rootView = reactRoot
      layoutParams = params
    }
  }

  private fun hideOverlay() {
    overlayContainer?.visibility = View.GONE
  }

  private fun removeOverlay() {
    overlayContainer?.let { view ->
      runOnUiThread {
        windowManager?.removeViewImmediate(view)
      }
      overlayContainer = null
      rootView = null
      layoutParams = null
    }
  }

  private fun createReactRootView(): ReactRootView {
    val reactApp = application as? ReactApplication
      ?: throw IllegalStateException("Application must implement ReactApplication")

    val reactRootView = ReactRootView(this)
    val props = Bundle().apply { putBoolean("collapsed", collapsed) }
    reactRootView.startReactApplication(
      reactApp.reactNativeHost.reactInstanceManager,
      "FSMOverlayRoot",
      props,
    )
    return reactRootView
  }

  private fun createLayoutParams(): WindowManager.LayoutParams {
    val type = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
    } else {
      @Suppress("DEPRECATION")
      WindowManager.LayoutParams.TYPE_PHONE
    }

    val params = WindowManager.LayoutParams(
      WindowManager.LayoutParams.WRAP_CONTENT,
      WindowManager.LayoutParams.WRAP_CONTENT,
      type,
      WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN or
        WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
        WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
      PixelFormat.TRANSLUCENT,
    )
    params.gravity = Gravity.TOP or Gravity.END
    params.x = dp(24f)
    params.y = dp(96f)
    return params
  }

  private fun dp(value: Float): Int =
    TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, value, resources.displayMetrics).toInt()

  private fun updateCollapsed(target: Boolean) {
    collapsed = target
    val params = layoutParams ?: return
    runOnUiThread {
      params.width = if (target) dp(68f) else WindowManager.LayoutParams.WRAP_CONTENT
      params.height = if (target) dp(68f) else WindowManager.LayoutParams.WRAP_CONTENT
      overlayContainer?.alpha = if (target) 0.75f else 1f
      rootView?.setAppProperties(Bundle().apply { putBoolean("collapsed", collapsed) })
      windowManager?.updateViewLayout(overlayContainer, params)
      emitState()
    }
  }

  private fun emitState() {
    val reactContext = rootView?.reactInstanceManager?.currentReactContext
    val emitter = reactContext?.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
    emitter?.emit(
      "fsmOverlayState",
      Arguments.createMap().apply {
        putBoolean("collapsed", collapsed)
        layoutParams?.let { params ->
          putDouble("x", params.x.toDouble())
          putDouble("y", params.y.toDouble())
        }
      },
    )
  }

  private fun updatePosition(x: Int, y: Int) {
    val params = layoutParams ?: return
    runOnUiThread {
      params.x = x
      params.y = y
      windowManager?.updateViewLayout(overlayContainer, params)
      emitState()
    }
  }

  private fun runOnUiThread(block: () -> Unit) {
    if (Thread.currentThread() === mainLooper.thread) {
      block()
    } else {
      Handler(mainLooper).post { block() }
    }
  }

  companion object {
    const val ACTION_SHOW = "com.fsmbot.overlay.SHOW"
    const val ACTION_HIDE = "com.fsmbot.overlay.HIDE"
    const val ACTION_EXPAND = "com.fsmbot.overlay.EXPAND"
    const val ACTION_COLLAPSE = "com.fsmbot.overlay.COLLAPSE"
    const val ACTION_STOP = "com.fsmbot.overlay.STOP"

    private var serviceRef: WeakReference<FSMOverlayService?> = WeakReference(null)

    fun start(context: Context, action: String = ACTION_SHOW) {
      val intent = Intent(context, FSMOverlayService::class.java).apply {
        this.action = action
      }
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        ContextCompat.startForegroundService(context, intent)
      } else {
        context.startService(intent)
      }
    }

    fun stop(context: Context) {
      context.stopService(Intent(context, FSMOverlayService::class.java))
    }

    fun updateGeometry(positionX: Int, positionY: Int, collapsed: Boolean) {
      serviceRef.get()?.let { service ->
        service.updatePosition(positionX, positionY)
        service.updateCollapsed(collapsed)
      }
    }
  }
}
