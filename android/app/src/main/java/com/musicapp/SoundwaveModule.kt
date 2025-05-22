// SoundwaveModule.kt (Kotlin) - Módulo nativo atualizado com RMS real
package com.musicapp

import android.media.MediaExtractor
import android.media.MediaFormat
import android.media.MediaMetadataRetriever
import android.net.Uri
import com.facebook.react.bridge.*
import java.nio.ByteBuffer
import kotlin.math.sqrt

class SoundwaveModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "Soundwave"

  @ReactMethod
  fun getWaveform(uriString: String, promise: Promise) {
    try {
      val uri = Uri.parse(uriString)

      val retriever = MediaMetadataRetriever()
      reactContext.contentResolver.openFileDescriptor(uri, "r")?.use { pfd ->
        retriever.setDataSource(pfd.fileDescriptor)
      } ?: run {
        promise.reject("NO_FD", "File descriptor is null")
        return
      }

      val durationStr = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION)
      val durationMs = durationStr?.toLongOrNull() ?: 0L
      retriever.release()

      val extractor = MediaExtractor()
      reactContext.contentResolver.openAssetFileDescriptor(uri, "r")?.use { afd ->
        extractor.setDataSource(afd.fileDescriptor, afd.startOffset, afd.length)
      } ?: run {
        promise.reject("NO_DESCRIPTOR", "AssetFileDescriptor is null")
        return
      }

      val numBars = 50
      val waveform = FloatArray(numBars) { 0f }
      val sampleSize = 2048
      val audioTrackIndex = (0 until extractor.trackCount).firstOrNull {
        val format = extractor.getTrackFormat(it)
        format.getString(MediaFormat.KEY_MIME)?.startsWith("audio/") == true
      } ?: -1

      if (audioTrackIndex == -1) {
        promise.reject("NO_AUDIO", "No audio track found.")
        return
      }

      extractor.selectTrack(audioTrackIndex)
      val totalFrames = durationMs / sampleSize
      val framesPerBar = (totalFrames / numBars).toInt().coerceAtLeast(1)

      val buffer = ByteBuffer.allocate(sampleSize)
      var frameIndex = 0
      var barIndex = 0
      val amplitudes = MutableList(numBars) { 0f }

      while (extractor.readSampleData(buffer, 0) >= 0 && barIndex < numBars) {
        val shortBuffer = buffer.asShortBuffer()
        val count = shortBuffer.limit()
        var sum = 0.0
        for (i in 0 until count) {
          val sample = shortBuffer.get(i)
          sum += (sample * sample).toDouble()
        }
        val rms = sqrt(sum / count).toFloat()
        amplitudes[barIndex] += rms

        frameIndex++
        if (frameIndex % framesPerBar == 0) {
          barIndex++
        }

        buffer.clear()
        extractor.advance()
      }

      val max = amplitudes.maxOrNull() ?: 1f
      for (i in amplitudes.indices) {
        waveform[i] = (amplitudes[i] / max).coerceIn(0f, 1f)
      }

      val result = Arguments.createArray()
      waveform.forEach { result.pushDouble(it.toDouble()) }
      promise.resolve(result)

    } catch (e: Exception) {
      promise.reject("WAVEFORM_ERROR", e)
    }
  }
}
