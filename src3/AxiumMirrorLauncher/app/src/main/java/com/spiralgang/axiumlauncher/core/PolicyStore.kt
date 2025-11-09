// core/PolicyStore.kt
package com.spiralgang.axiumlauncher.core

import android.content.Context
import android.content.SharedPreferences

object PolicyStore {
    data class Profile(
        val env: String,
        val task: String,
        val requiredResult: String,
        val mandatoryIncludes: List<String>,
        val functionality: String,
        val tools: List<String>,
        val axiumCompulsionRequirum: String
    )

    private fun prefs(ctx: Context): SharedPreferences =
        ctx.getSharedPreferences("axiumpolicy", Context.MODE_PRIVATE)

    fun default() = Profile(
        env = "android10-galaxyS9",
        task = "launch",
        requiredResult = "app-start",
        mandatoryIncludes = emptyList(),
        functionality = "mirror",
        tools = emptyList(),
        axiumCompulsionRequirum = "pass-or-loop"
    )

    fun load(ctx: Context): Profile {
        val p = prefs(ctx)
        return Profile(
            env = p.getString("env", default().env) ?: default().env,
            task = p.getString("task", default().task) ?: default().task,
            requiredResult = p.getString("result", default().requiredResult) ?: default().requiredResult,
            mandatoryIncludes = (p.getString("includes", "") ?: "").split(",").map { it.trim() }.filter { it.isNotEmpty() },
            functionality = p.getString("func", default().functionality) ?: default().functionality,
            tools = (p.getString("tools", "") ?: "").split(",").map { it.trim() }.filter { it.isNotEmpty() },
            axiumCompulsionRequirum = p.getString("axium", default().axiumCompulsionRequirum) ?: default().axiumCompulsionRequirum
        )
    }

    fun save(ctx: Context, prof: Profile) {
        prefs(ctx).edit()
            .putString("env", prof.env)
            .putString("task", prof.task)
            .putString("result", prof.requiredResult)
            .putString("includes", prof.mandatoryIncludes.joinToString(","))
            .putString("func", prof.functionality)
            .putString("tools", prof.tools.joinToString(","))
            .putString("axium", prof.axiumCompulsionRequirum)
            .apply()
    }
}
