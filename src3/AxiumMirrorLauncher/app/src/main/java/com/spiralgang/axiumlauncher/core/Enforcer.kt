// core/Enforcer.kt
package com.spiralgang.axiumlauncher.core

object Enforcer {
    data class Eval(val passed: Boolean, val reason: String?)

    @Volatile private var profile = PolicyStore.default()

    fun updateProfile(p: PolicyStore.Profile) { profile = p }

    fun evaluate(pkg: String): Eval {
        // Intent irrelevance: only observed alignment matters
        // Checks:
        if (profile.env.isBlank()) return Eval(false, "env not defined")
        if (profile.task.isBlank()) return Eval(false, "task not defined")
        if (profile.requiredResult.isBlank()) return Eval(false, "required result not defined")
        if (profile.functionality.isBlank()) return Eval(false, "functionality not defined")
        if (profile.axiumCompulsionRequirum.isBlank()) return Eval(false, "axium compulsion requirum not defined")

        // Mandatory includes (simple presence; you can wire to a content store)
        val missingInc = profile.mandatoryIncludes.firstOrNull { it.isBlank() }
        if (missingInc != null) return Eval(false, "mandatory includes incomplete")

        // Tools presence (basic availability check; you can extend with signatures)
        val missingTool = profile.tools.firstOrNull { it.isBlank() }
        if (missingTool != null) return Eval(false, "tools not defined")

        // Package heuristics (example denylist; you can map per‑pkg rules)
        // By default, pass — this is the mirror interception + lesson overlay on fail
        return Eval(true, null)
    }
}
