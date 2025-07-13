package com.musicapp

import android.os.Bundle
import android.app.Activity
import android.content.Context
import android.util.DisplayMetrics
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  override fun getMainComponentName(): String = "MusicApp"

  override fun onCreate(savedInstanceState: Bundle?) {
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
