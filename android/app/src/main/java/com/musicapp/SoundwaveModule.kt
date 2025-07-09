package com.musicapp

import android.media.MediaExtractor
import android.media.MediaFormat
import android.media.MediaMetadataRetriever
import android.net.Uri
import com.facebook.react.bridge.*
import java.nio.ByteBuffer
import kotlin.math.sqrt
import android.util.Log

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
        Log.e("SoundwaveModule", "FileDescriptor null")
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

      val audioTrackIndex = (0 until extractor.trackCount).firstOrNull {
        val format = extractor.getTrackFormat(it)
        format.getString(MediaFormat.KEY_MIME)?.startsWith("audio/") == true
      } ?: -1

      if (audioTrackIndex == -1) {
        promise.reject("NO_AUDIO", "No audio track found.")
        return
      }

      val format = extractor.getTrackFormat(audioTrackIndex)
      val mimeType = format.getString(MediaFormat.KEY_MIME)

      val unsupportedFormats = listOf(
        "audio/raw", "audio/flac", "audio/aiff", "audio/x-aiff",
        "audio/aac", "audio/mp4a-latm", "audio/m3u8",
        "application/x-mpegURL", null
      )

      if (unsupportedFormats.contains(mimeType)) {

        val random = java.util.Random()
        val mockWaveform = Arguments.createArray()
        var current = 0.5

        repeat(50) { i ->
          val isPeak = i % 10 == 0
          val next = if (isPeak) {
            (0.7 + random.nextDouble() * 0.3) // pico: 0.7 a 1.0
          } else {
            (current + (random.nextDouble() - 0.5) * 0.4).coerceIn(0.2, 0.9)
          }

          mockWaveform.pushDouble(next)
          current = next
        }

        promise.resolve(mockWaveform)
        return
      }

      // Somente se formato suportado
      extractor.selectTrack(audioTrackIndex)

      val buffer = ByteBuffer.allocate(2048)
      val waveform = FloatArray(50) { 0f }
      val amplitudes = MutableList(50) { 0f }

      var frameIndex = 0
      var barIndex = 0
      val framesPerBar = ((durationMs / 2048) / 50).toInt().coerceAtLeast(1)

      while (extractor.readSampleData(buffer, 0) >= 0 && barIndex < 50) {
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
      Log.e("SoundwaveModule", "Erro ao gerar waveform", e)
      promise.reject("WAVEFORM_ERROR", e)
    }
  }
}
