// ui/adapter/AppsAdapter.kt
package com.spiralgang.axiumlauncher.ui.adapter

import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.drawable.Drawable
import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.spiralgang.axiumlauncher.databinding.ItemAppBinding

data class AppItem(val label: String, val icon: Drawable, val pkg: String, val activity: String)

class AppsAdapter(private val click: OnAppClick) : RecyclerView.Adapter<AppsAdapter.VH>() {
    interface OnAppClick { fun onAppClicked(pkg: String, activity: String) }

    private val items = mutableListOf<AppItem>()

    fun submitList(list: List<AppItem>) {
        items.clear(); items.addAll(list); notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH {
        val b = ItemAppBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return VH(b)
    }

    override fun onBindViewHolder(holder: VH, position: Int) {
        val it = items[position]
        holder.b.label.text = it.label
        holder.b.icon.setImageDrawable(it.icon)
        holder.itemView.setOnClickListener { click.onAppClicked(it.pkg, it.activity) }
    }

    override fun getItemCount() = items.size

    class VH(val b: ItemAppBinding) : RecyclerView.ViewHolder(b.root)

    companion object {
        fun queryLaunchables(ctx: Context): List<AppItem> {
            val pm = ctx.packageManager
            val intent = Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_LAUNCHER)
            val acts = pm.queryIntentActivities(intent, PackageManager.MATCH_ALL)
            return acts.map {
                AppItem(
                    label = it.loadLabel(pm).toString(),
                    icon = it.loadIcon(pm),
                    pkg = it.activityInfo.packageName,
                    activity = it.activityInfo.name
                )
            }.sortedBy { it.label.lowercase() }
        }
    }
}
