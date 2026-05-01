package com.musicplayerapp

import android.graphics.Color
import android.os.Build
import android.os.Bundle
import android.app.Activity
import android.content.Context
import android.util.DisplayMetrics
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsControllerCompat


class MainActivity : ReactActivity() {

  override fun getMainComponentName(): String = "MusicApp"

  override fun onCreate(savedInstanceState: Bundle?) {
    WindowCompat.setDecorFitsSystemWindows(window, false)
    // Define cores e ícones das barras antes do React Native renderizar,
    // garantindo edge-to-edge correto desde a primeira abertura após instalação.
    window.statusBarColor = Color.TRANSPARENT
    window.navigationBarColor = Color.TRANSPARENT
    WindowInsetsControllerCompat(window, window.decorView).apply {
      isAppearanceLightStatusBars = false
      isAppearanceLightNavigationBars = false
    }
    // Android 10+ (API 29): impede o sistema de sobrepor um scrim automático
    // sobre a navigation bar e status bar quando o app roda em edge-to-edge.
    // Sem isso, o Android 15 com targetSdk=35 adiciona faixas cinzas/pretas.
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      window.isNavigationBarContrastEnforced = false
      window.isStatusBarContrastEnforced = false
    }
    adjustDensity(this)
    super.onCreate(null)
  }


  private fun adjustDensity(activity: Activity, designWidthDp: Float = 360f) {
    val metrics = DisplayMetrics()
    activity.windowManager.defaultDisplay.getMetrics(metrics)

    val targetDensity = metrics.widthPixels / designWidthDp
    val targetDensityDpi = (160 * targetDensity).toInt()

    metrics.density = targetDensity
    metrics.scaledDensity = targetDensity
    metrics.densityDpi = targetDensityDpi

    activity.resources.displayMetrics.setTo(metrics)
    activity.applicationContext.resources.displayMetrics.setTo(metrics)
  }

  override fun createReactActivityDelegate(): ReactActivityDelegate =
    DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
