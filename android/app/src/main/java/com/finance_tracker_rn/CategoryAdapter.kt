package com.finance_tracker_rn

import android.content.Context
import android.graphics.Color
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.TextView
import com.finance_tracker_rn.R

class CategoryAdapter(
    mContext: Context,
    private val categories: List<WidgetDbHelper.Category>
) : ArrayAdapter<WidgetDbHelper.Category>(mContext, 0, categories) {

    private var selectedPosition: Int = -1

    fun setSelectedPosition(position: Int) {
        selectedPosition = position
        notifyDataSetChanged()
    }

    override fun getView(position: Int, convertView: View?, parent: ViewGroup): View {
        var view = convertView
        if (view == null) {
            view = LayoutInflater.from(context).inflate(R.layout.item_category, parent, false)
        }

        val category = categories[position]
        val textView = view?.findViewById<TextView>(R.id.categoryName)

        if (category != null) {
            textView?.text = category.name
            try {
                textView?.setBackgroundColor(Color.parseColor(category.color))
                // Determine if text should be light or dark based on background
                val r = Color.red(Color.parseColor(category.color))
                val g = Color.green(Color.parseColor(category.color))
                val b = Color.blue(Color.parseColor(category.color))
                val luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
                textView?.setTextColor(if (luminance > 0.5) Color.BLACK else Color.WHITE)
            } catch (e: Exception) {
                textView?.setBackgroundColor(Color.parseColor("#6366f1")) // Fallback to indigo
                textView?.setTextColor(Color.WHITE)
            }
        }

        // Visual feedback for selection
        if (position == selectedPosition) {
            view?.alpha = 1.0f
            view?.scaleX = 1.1f
            view?.scaleY = 1.1f
        } else {
            view?.alpha = 0.6f
            view?.scaleX = 1.0f
            view?.scaleY = 1.0f
        }

        return view!!
    }
}