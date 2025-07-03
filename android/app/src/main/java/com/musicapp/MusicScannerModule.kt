package com.musicapp

import android.content.ContentUris
import android.content.Context
import android.database.Cursor
import android.net.Uri
import android.provider.MediaStore
import android.graphics.BitmapFactory
import android.media.MediaMetadataRetriever
import android.util.Base64
import com.facebook.react.bridge.*
import android.graphics.Bitmap


import java.io.ByteArrayOutputStream

class MusicScannerModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "MusicScanner"
    }

    @ReactMethod
    fun getAllSongs(promise: Promise) {
        val songList = Arguments.createArray()
        val contentResolver = reactContext.contentResolver

        val uri = MediaStore.Audio.Media.EXTERNAL_CONTENT_URI
        val projection = arrayOf(
            MediaStore.Audio.Media._ID,
            MediaStore.Audio.Media.TITLE,
            MediaStore.Audio.Media.ARTIST,
            MediaStore.Audio.Media.DURATION,
            MediaStore.Audio.Media.ALBUM_ID,
            MediaStore.Audio.Media.DATA
        )
        val selection = "${MediaStore.Audio.Media.IS_MUSIC} != 0"
        val cursor: Cursor? = contentResolver.query(uri, projection, selection, null, null)

        cursor?.use {
            val idCol = it.getColumnIndexOrThrow(MediaStore.Audio.Media._ID)
            val titleCol = it.getColumnIndexOrThrow(MediaStore.Audio.Media.TITLE)
            val artistCol = it.getColumnIndexOrThrow(MediaStore.Audio.Media.ARTIST)
            val durationCol = it.getColumnIndexOrThrow(MediaStore.Audio.Media.DURATION)
            val albumIdCol = it.getColumnIndexOrThrow(MediaStore.Audio.Media.ALBUM_ID)
            val dataCol = it.getColumnIndexOrThrow(MediaStore.Audio.Media.DATA)

            while (it.moveToNext()) {
                val song = Arguments.createMap()

                val id = it.getLong(idCol)
                val title = it.getString(titleCol)
                val artist = it.getString(artistCol)
                val duration = it.getLong(durationCol)
                val albumId = it.getLong(albumIdCol)
                val data = it.getString(dataCol)

                val songUri: Uri = ContentUris.withAppendedId(MediaStore.Audio.Media.EXTERNAL_CONTENT_URI, id)

                song.putString("title", title)
                song.putString("artist", artist)
                song.putDouble("duration", duration.toDouble())
                song.putString("uri", songUri.toString())
                song.putString("cover", getEmbeddedAlbumArt(data))

                songList.pushMap(song)
            }
        }

        promise.resolve(songList)
    }

    @ReactMethod
    fun getSongsPaginated(offset: Int, limit: Int, promise: Promise) {
        val songList = Arguments.createArray()
        val contentResolver = reactContext.contentResolver

        val uri = MediaStore.Audio.Media.EXTERNAL_CONTENT_URI
        val projection = arrayOf(
            MediaStore.Audio.Media._ID,
            MediaStore.Audio.Media.TITLE,
            MediaStore.Audio.Media.ARTIST,
            MediaStore.Audio.Media.DURATION,
            MediaStore.Audio.Media.DATA
        )
        val selection = "${MediaStore.Audio.Media.IS_MUSIC} != 0"
        val sortOrder = "${MediaStore.Audio.Media.DATE_ADDED} DESC"
        val cursor: Cursor? = contentResolver.query(uri, projection, selection, null, sortOrder)

        cursor?.use {
            if (offset >= it.count) {
                promise.resolve(songList)
                return
            }

            it.moveToPosition(offset - 1)
            var count = 0
            while (it.moveToNext() && count < limit) {
                val id = it.getLong(it.getColumnIndexOrThrow(MediaStore.Audio.Media._ID))
                val title = it.getString(it.getColumnIndexOrThrow(MediaStore.Audio.Media.TITLE))
                val artist = it.getString(it.getColumnIndexOrThrow(MediaStore.Audio.Media.ARTIST))
                val duration = it.getLong(it.getColumnIndexOrThrow(MediaStore.Audio.Media.DURATION))
                val data = it.getString(it.getColumnIndexOrThrow(MediaStore.Audio.Media.DATA))
                val songUri = ContentUris.withAppendedId(uri, id)

                val song = Arguments.createMap()
                song.putString("id", songUri.toString())
                song.putString("title", title)
                song.putString("artist", artist)
                song.putDouble("duration", duration.toDouble())
                song.putString("uri", songUri.toString())
                song.putString("cover", getEmbeddedAlbumArt(data))

                songList.pushMap(song)
                count++
            }
        }

        promise.resolve(songList)
    }

    private fun getEmbeddedAlbumArt(filePath: String?): String? {
        if (filePath == null) return null
        val retriever = MediaMetadataRetriever()
        return try {
            retriever.setDataSource(filePath)
            val art = retriever.embeddedPicture
            retriever.release()

            if (art != null) {
                val bitmap = BitmapFactory.decodeByteArray(art, 0, art.size)
                val outputStream = ByteArrayOutputStream()
                bitmap.compress(Bitmap.CompressFormat.PNG, 100, outputStream)
                Base64.encodeToString(outputStream.toByteArray(), Base64.DEFAULT)
            } else {
                null
            }
        } catch (e: Exception) {
            null
        }
    }
}
