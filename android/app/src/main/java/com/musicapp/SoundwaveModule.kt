package com.musicapp

import android.media.AudioFormat
import android.media.MediaCodec
import android.media.MediaExtractor
import android.media.MediaFormat
import android.net.Uri
import android.util.Log
import com.facebook.react.bridge.*
import org.json.JSONArray
import java.io.File
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.security.MessageDigest
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.Executors
import kotlin.math.abs
import kotlin.math.max

class SoundwaveModule(
  private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

  private val executor = Executors.newSingleThreadExecutor()
  private val inFlight = ConcurrentHashMap<String, MutableList<Promise>>()

  override fun getName(): String = "Soundwave"

  override fun onCatalystInstanceDestroy() {
      super.onCatalystInstanceDestroy()
      executor.shutdownNow()
    }

  @ReactMethod
  fun getWaveform(uriString: String, bars: Int, cacheKey: String, promise: Promise) {
    if (uriString.isBlank()) {
      promise.reject("INVALID_URI", "URI inválida.")
      return
    }

    if (cacheKey.isBlank()) {
      promise.reject("INVALID_CACHE_KEY", "Cache key inválida.")
      return
    }

    val safeBars = bars.coerceIn(16, 240)
    val hashedKey = sha1("$cacheKey|bars=$safeBars")

    try {
      val cached = readWaveformFromCache(hashedKey)
      if (cached != null) {
        promise.resolve(cached)
        return
      }

      synchronized(inFlight) {
        val pending = inFlight[hashedKey]
        if (pending != null) {
          pending.add(promise)
          return
        }
        inFlight[hashedKey] = mutableListOf(promise)
      }

      executor.execute {
        try {
          val waveform = generateWaveformFast(Uri.parse(uriString), safeBars)
          writeWaveformToCache(hashedKey, waveform)
          resolveAll(hashedKey, floatArrayToWritableArray(waveform))
        } catch (e: Exception) {
          Log.e("SoundwaveModule", "Erro ao gerar waveform otimizado", e)
          rejectAll(
            hashedKey,
            "WAVEFORM_ERROR",
            e.message ?: "Falha ao gerar waveform"
          )
        }
      }
    } catch (e: Exception) {
      promise.reject("WAVEFORM_ERROR", e.message ?: "Erro inesperado")
    }
  }

  private fun resolveAll(key: String, result: WritableArray) {
    val promises = synchronized(inFlight) { inFlight.remove(key) } ?: return
    promises.forEach { it.resolve(copyWritableArray(result)) }
  }

  private fun rejectAll(key: String, code: String, message: String) {
    val promises = synchronized(inFlight) { inFlight.remove(key) } ?: return
    promises.forEach { it.reject(code, message) }
  }

  private fun copyWritableArray(source: WritableArray): WritableArray {
    val arr = Arguments.createArray()
    for (i in 0 until source.size()) {
      arr.pushDouble(source.getDouble(i))
    }
    return arr
  }

  private fun floatArrayToWritableArray(values: FloatArray): WritableArray {
    val arr = Arguments.createArray()
    values.forEach { arr.pushDouble(it.toDouble()) }
    return arr
  }

  private fun getWaveformCacheDir(): File {
    val dir = File(reactContext.cacheDir, "waveforms")
    if (!dir.exists()) {
      dir.mkdirs()
    }
    return dir
  }

  private fun getCacheFile(key: String): File {
    return File(getWaveformCacheDir(), "$key.json")
  }

  private fun readWaveformFromCache(key: String): WritableArray? {
    return try {
      val file = getCacheFile(key)
      if (!file.exists()) return null

      val json = JSONArray(file.readText())
      val arr = Arguments.createArray()
      for (i in 0 until json.length()) {
        arr.pushDouble(json.optDouble(i, 0.0))
      }
      arr
    } catch (e: Exception) {
      Log.w("SoundwaveModule", "Falha ao ler cache do waveform", e)
      null
    }
  }

  private fun writeWaveformToCache(key: String, values: FloatArray) {
    try {
      val file = getCacheFile(key)
      val json = JSONArray()
      values.forEach { json.put(it.toDouble()) }
      file.writeText(json.toString())
    } catch (e: Exception) {
      Log.w("SoundwaveModule", "Falha ao salvar cache do waveform", e)
    }
  }

  private fun sha1(value: String): String {
    val digest = MessageDigest.getInstance("SHA-1").digest(value.toByteArray())
    return digest.joinToString("") { "%02x".format(it) }
  }

  private fun generateWaveformFast(uri: Uri, bars: Int): FloatArray {
    val extractor = MediaExtractor()

    val pfd = reactContext.contentResolver.openFileDescriptor(uri, "r")
      ?: throw IllegalStateException("Não foi possível abrir o arquivo de áudio")

    pfd.use { parcelFileDescriptor ->
      extractor.setDataSource(parcelFileDescriptor.fileDescriptor)
    }

    val trackIndex = (0 until extractor.trackCount).firstOrNull { index ->
      val format = extractor.getTrackFormat(index)
      format.getString(MediaFormat.KEY_MIME)?.startsWith("audio/") == true
    } ?: throw IllegalStateException("Nenhuma faixa de áudio encontrada")

    extractor.selectTrack(trackIndex)

    val inputFormat = extractor.getTrackFormat(trackIndex)
    val mime = inputFormat.getString(MediaFormat.KEY_MIME)
      ?: throw IllegalStateException("MIME de áudio inválido")

    val durationUs = if (inputFormat.containsKey(MediaFormat.KEY_DURATION)) {
      inputFormat.getLong(MediaFormat.KEY_DURATION).coerceAtLeast(1L)
    } else {
      1L
    }

    val codec = MediaCodec.createDecoderByType(mime)
    codec.configure(inputFormat, null, null, 0)
    codec.start()

    val peaks = FloatArray(bars) { 0f }
    val counts = IntArray(bars) { 0 }

    val bufferInfo = MediaCodec.BufferInfo()
    var inputDone = false
    var outputDone = false

    var pcmEncoding = AudioFormat.ENCODING_PCM_16BIT

    try {
      while (!outputDone) {
        if (!inputDone) {
          val inputIndex = codec.dequeueInputBuffer(5_000)
          if (inputIndex >= 0) {
            val inputBuffer = codec.getInputBuffer(inputIndex)
            if (inputBuffer != null) {
              inputBuffer.clear()
              val sampleSize = extractor.readSampleData(inputBuffer, 0)

              if (sampleSize < 0) {
                codec.queueInputBuffer(
                  inputIndex,
                  0,
                  0,
                  0L,
                  MediaCodec.BUFFER_FLAG_END_OF_STREAM
                )
                inputDone = true
              } else {
                codec.queueInputBuffer(
                  inputIndex,
                  0,
                  sampleSize,
                  extractor.sampleTime,
                  0
                )
                extractor.advance()
              }
            }
          }
        }

        val outputIndex = codec.dequeueOutputBuffer(bufferInfo, 5_000)

        when {
          outputIndex == MediaCodec.INFO_OUTPUT_FORMAT_CHANGED -> {
            val outFormat = codec.outputFormat
            if (outFormat.containsKey(MediaFormat.KEY_PCM_ENCODING)) {
              pcmEncoding = outFormat.getInteger(MediaFormat.KEY_PCM_ENCODING)
            } else {
              pcmEncoding = AudioFormat.ENCODING_PCM_16BIT
            }
          }

          outputIndex == MediaCodec.INFO_TRY_AGAIN_LATER -> {
            // segue
          }

          outputIndex >= 0 -> {
            val outputBuffer = codec.getOutputBuffer(outputIndex)

            if (outputBuffer != null && bufferInfo.size > 0) {
              outputBuffer.position(bufferInfo.offset)
              outputBuffer.limit(bufferInfo.offset + bufferInfo.size)

              val chunkPeak = when (pcmEncoding) {
                AudioFormat.ENCODING_PCM_FLOAT -> {
                  calculateFastPeakFloat(outputBuffer.slice())
                }
                else -> {
                  calculateFastPeak16Bit(outputBuffer.slice())
                }
              }

              val timeUs = if (bufferInfo.presentationTimeUs >= 0) {
                bufferInfo.presentationTimeUs
              } else {
                0L
              }

              val barIndex = (((timeUs.toDouble() / durationUs.toDouble()) * bars).toInt())
                .coerceIn(0, bars - 1)

              if (chunkPeak > peaks[barIndex]) {
                peaks[barIndex] = chunkPeak
              }
              counts[barIndex]++
            }

            codec.releaseOutputBuffer(outputIndex, false)

            if ((bufferInfo.flags and MediaCodec.BUFFER_FLAG_END_OF_STREAM) != 0) {
              outputDone = true
            }
          }
        }
      }
    } finally {
      try {
        codec.stop()
      } catch (_: Exception) {
      }
      try {
        codec.release()
      } catch (_: Exception) {
      }
      try {
        extractor.release()
      } catch (_: Exception) {
      }
    }

    fillMissingBars(peaks, counts)
    normalize(peaks)

    return peaks
  }

  private fun calculateFastPeak16Bit(buffer: ByteBuffer): Float {
    buffer.order(ByteOrder.LITTLE_ENDIAN)

    val totalSamples = buffer.remaining() / 2
    if (totalSamples <= 0) return 0f

    // limita o custo por chunk: inspeciona no máximo ~192 samples por buffer
    val stride = max(1, totalSamples / 192)

    var peak = 0f
    var sampleIndex = 0

    while (buffer.remaining() >= 2) {
      val sample = buffer.short.toInt()
      if (sampleIndex % stride == 0) {
        val normalized = abs(sample) / 32768f
        if (normalized > peak) peak = normalized
      }
      sampleIndex++
    }

    return peak.coerceIn(0f, 1f)
  }

  private fun calculateFastPeakFloat(buffer: ByteBuffer): Float {
    buffer.order(ByteOrder.LITTLE_ENDIAN)

    val totalSamples = buffer.remaining() / 4
    if (totalSamples <= 0) return 0f

    val stride = max(1, totalSamples / 192)

    var peak = 0f
    var sampleIndex = 0

    while (buffer.remaining() >= 4) {
      val sample = buffer.float
      if (sampleIndex % stride == 0) {
        val normalized = abs(sample).coerceIn(0f, 1f)
        if (normalized > peak) peak = normalized
      }
      sampleIndex++
    }

    return peak.coerceIn(0f, 1f)
  }

  private fun fillMissingBars(peaks: FloatArray, counts: IntArray) {
    val size = peaks.size
    if (size == 0) return

    for (i in peaks.indices) {
      if (counts[i] == 0) {
        var left = i - 1
        while (left >= 0 && counts[left] == 0) left--

        var right = i + 1
        while (right < size && counts[right] == 0) right++

        peaks[i] = when {
          left >= 0 && right < size -> (peaks[left] + peaks[right]) / 2f
          left >= 0 -> peaks[left]
          right < size -> peaks[right]
          else -> 0f
        }
      }
    }
  }

  private fun normalize(values: FloatArray) {
    val maxValue = values.maxOrNull()?.takeIf { it > 0f } ?: 1f
    for (i in values.indices) {
      values[i] = (values[i] / maxValue).coerceIn(0f, 1f)
    }
  }
}