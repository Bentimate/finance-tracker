package com.finance_tracker_rn

import android.content.Context
import android.graphics.Color
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.BaseAdapter
import android.widget.ImageView
import android.widget.TextView

class WidgetCategoryPickerAdapter(
    context: Context,
    private val rows: List<Row>,
    private val selectedId: Long?,
) : BaseAdapter() {

    data class Row(
        val id: Long,
        val title: String,
        val colorHex: String,
        val iconName: String?,
        val showChevron: Boolean,
        val isOthers: Boolean,
    )

    private val inflater = LayoutInflater.from(context)

    override fun getCount(): Int = rows.size

    override fun getItem(position: Int): Row = rows[position]

    override fun getItemId(position: Int): Long = rows[position].id

    override fun getView(position: Int, convertView: View?, parent: ViewGroup): View {
        val view = convertView ?: inflater.inflate(R.layout.item_widget_category_picker, parent, false)
        val row = getItem(position)

        val icon = view.findViewById<ImageView>(R.id.category_icon)
        val label = view.findViewById<TextView>(R.id.category_name)
        val chevron = view.findViewById<ImageView>(R.id.category_chevron)
        val check = view.findViewById<ImageView>(R.id.category_check)

        val iconRes = WidgetCategoryIconMapper.resolve(row.iconName)
        icon.setImageResource(iconRes)
        icon.setColorFilter(parseColorOrDefault(row.colorHex))

        label.text = row.title
        label.alpha = if (row.isOthers) 0.75f else 1f

        chevron.visibility = if (row.showChevron) View.VISIBLE else View.GONE
        check.visibility = if (selectedId == row.id) View.VISIBLE else View.GONE

        return view
    }

    private fun parseColorOrDefault(colorHex: String): Int {
        return try {
            Color.parseColor(colorHex)
        } catch (_: Exception) {
            Color.parseColor("#6366F1")
        }
    }
}
