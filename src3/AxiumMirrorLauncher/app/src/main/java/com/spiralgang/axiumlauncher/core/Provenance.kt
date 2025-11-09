// core/Provenance.kt
package com.spiralgang.axiumlauncher.core

import android.content.Context
import java.io.File
import java.text.SimpleDateFormat
import java.util.*

object Provenance {
    private fun file(ctx: Context) = File(ctx.filesDir, "axium_provenance.log")
    private val fmt = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).apply { timeZone = TimeZone.getTimeZone("UTC") }

    fun record(ctx: Context, entry: String) {
        val ts = fmt.format(Date())
        file(ctx).appendText("$ts $entry\n")
        // ring cap ~256KB
        if (file(ctx).length() > 262_144) {
            val t = file(ctx).readLines().takeLast(2048).joinToString("\n")
            file(ctx).writeText(t)
        }
    }
}
