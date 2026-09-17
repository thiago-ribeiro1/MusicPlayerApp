package com.musicplayerapp

import android.graphics.Color
import android.os.Bundle
import android.app.Activity
import android.util.DisplayMetrics
import androidx.activity.SystemBarStyle
import androidx.activity.enableEdgeToEdge
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  override fun getMainComponentName(): String = "MusicApp"

  override fun onCreate(savedInstanceState: Bundle?) {
    // Edge-to-edge oficial do AndroidX: status/nav bar transparentes, ícones claros,
    // sem scrim de contraste e cutout tratado em todas as versões (API 24 → 36).
    enableEdgeToEdge(
      statusBarStyle = SystemBarStyle.dark(Color.TRANSPARENT),
      navigationBarStyle = SystemBarStyle.dark(Color.TRANSPARENT),
    )
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