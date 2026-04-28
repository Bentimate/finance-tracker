package com.finance_tracker_rn

import android.content.Context
import android.database.sqlite.SQLiteDatabase
import java.text.SimpleDateFormat
import java.util.*

object WidgetDbHelper {

    private fun openDatabase(context: Context): SQLiteDatabase {
        // op-sqlite stores the DB in the default app database directory
        val dbPath = context.getDatabasePath("finance_tracker.db").absolutePath
        return SQLiteDatabase.openDatabase(dbPath, null, SQLiteDatabase.OPEN_READWRITE)
    }

    data class Category(val id: Long, val name: String, val color: String)

    fun getActiveCategories(context: Context): List<Category> {
        val db = openDatabase(context)
        val categories = mutableListOf<Category>()
        val cursor = db.rawQuery(
            "SELECT id, name, color FROM categories WHERE is_archived = 0 ORDER BY name ASC",
            null
        )
        while (cursor.moveToNext()) {
            categories.add(
                Category(
                    cursor.getLong(0),
                    cursor.getString(1),
                    cursor.getString(2)
                )
            )
        }
        cursor.close()
        db.close()
        return categories
    }

    fun insertExpense(context: Context, amount: Double, categoryId: Long) {
        val db = openDatabase(context)
        val sdf = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US)
        sdf.timeZone = TimeZone.getTimeZone("UTC")
        val currentTime = sdf.format(Date())

        db.execSQL(
            "INSERT INTO transactions (amount, type, date, category_id, note, created_at, updated_at, deleted_at) VALUES (?, 'expense', ?, ?, '', ?, ?, NULL)",
            arrayOf(amount, currentTime, categoryId, currentTime, currentTime)
        )
        db.close()
    }
}