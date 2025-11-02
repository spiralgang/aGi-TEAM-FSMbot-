// ui/SettingsActivity.kt
package com.spiralgang.axiumlauncher.ui

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.spiralgang.axiumlauncher.core.PolicyStore
import com.spiralgang.axiumlauncher.core.Enforcer
import com.spiralgang.axiumlauncher.databinding.ActivitySettingsBinding

class SettingsActivity : AppCompatActivity() {
    private lateinit var b: ActivitySettingsBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        b = ActivitySettingsBinding.inflate(layoutInflater)
        setContentView(b.root)

        val p = PolicyStore.load(this)
        b.fieldEnv.setText(p.env)
        b.fieldTask.setText(p.task)
        b.fieldRequiredResult.setText(p.requiredResult)
        b.fieldMandatoryIncludes.setText(p.mandatoryIncludes.joinToString(","))
        b.fieldFunctionality.setText(p.functionality)
        b.fieldTools.setText(p.tools.joinToString(","))
        b.fieldAxium.setText(p.axiumCompulsionRequirum)

        b.btnSave.setOnClickListener {
            val updated = PolicyStore.Profile(
                env = b.fieldEnv.text.toString().trim(),
                task = b.fieldTask.text.toString().trim(),
                requiredResult = b.fieldRequiredResult.text.toString().trim(),
                mandatoryIncludes = b.fieldMandatoryIncludes.text.toString().split(",").map { it.trim() }.filter { it.isNotEmpty() },
                functionality = b.fieldFunctionality.text.toString().trim(),
                tools = b.fieldTools.text.toString().split(",").map { it.trim() }.filter { it.isNotEmpty() },
                axiumCompulsionRequirum = b.fieldAxium.text.toString().trim()
            )
            PolicyStore.save(this, updated)
            Enforcer.updateProfile(updated)
            finish()
        }

        b.btnReset.setOnClickListener {
            val def = PolicyStore.default()
            PolicyStore.save(this, def)
            Enforcer.updateProfile(def)
            finish()
        }
    }
}
