package com.financetracker   // ← Replace with your actual package name

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.os.Build
import android.widget.RemoteViews

/**
 * Home-screen widget provider.
 *
 * Responsibilities:
 *   1. Inflate the widget layout via RemoteViews.
 *   2. Attach a PendingIntent to the "Add" button that launches
 *      WidgetEntryActivity — a transparent React Native activity that renders
 *      the WidgetEntryScreen component.
 *
 * The widget itself holds no state and performs no DB operations.
 * All data entry logic lives in the React Native layer (WidgetEntryScreen).
 */
class FinanceWidget : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray,
    ) {
        // Called for every widget instance on the home screen.
        appWidgetIds.forEach { appWidgetId ->
            updateWidget(context, appWidgetManager, appWidgetId)
        }
    }

    companion object {
        /**
         * Builds and pushes the RemoteViews for a single widget instance.
         * Extracted so it can be called from onUpdate and onEnabled.
         */
        fun updateWidget(
            context: Context,
            appWidgetManager: AppWidgetManager,
            appWidgetId: Int,
        ) {
            val views = RemoteViews(context.packageName, R.layout.widget_finance)

            // Build the intent that opens WidgetEntryActivity.
            val entryIntent = Intent(context, WidgetEntryActivity::class.java).apply {
                // Clear the back stack so pressing Back from the entry screen
                // returns to the home screen, not a previous app task.
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }

            val flags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            } else {
                PendingIntent.FLAG_UPDATE_CURRENT
            }

            val pendingIntent = PendingIntent.getActivity(
                context,
                appWidgetId,   // unique requestCode per widget instance
                entryIntent,
                flags,
            )

            views.setOnClickPendingIntent(R.id.widget_add_btn, pendingIntent)
            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }
}
