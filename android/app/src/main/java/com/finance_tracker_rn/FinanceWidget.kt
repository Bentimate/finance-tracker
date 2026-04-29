package com.finance_tracker_rn

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
 * Tapping the "Add" button launches WidgetEntryActivity — a fully native,
 * dialog-style Activity that writes directly to the SQLite database.
 * The React Native bridge is not involved at any point.
 */
class FinanceWidget : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray,
    ) {
        appWidgetIds.forEach { appWidgetId ->
            updateWidget(context, appWidgetManager, appWidgetId)
        }
    }

    companion object {
        fun updateWidget(
            context: Context,
            appWidgetManager: AppWidgetManager,
            appWidgetId: Int,
        ) {
            val views = RemoteViews(context.packageName, R.layout.widget_finance)

            val intent = Intent(context, WidgetEntryActivity::class.java).apply {
                // Use a separate task for the widget entry so it doesn't bring 
                // the main app to the background if it's currently hidden.
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or 
                        Intent.FLAG_ACTIVITY_CLEAR_TOP or 
                        Intent.FLAG_ACTIVITY_MULTIPLE_TASK
            }

            val flags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            } else {
                PendingIntent.FLAG_UPDATE_CURRENT
            }

            val pendingIntent = PendingIntent.getActivity(
                context,
                appWidgetId,
                intent,
                flags,
            )

            views.setOnClickPendingIntent(R.id.widget_add_btn, pendingIntent)
            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }
}
