package com.finance_tracker_rn

import android.content.ContentValues
import android.database.sqlite.SQLiteDatabase
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity

/**
 * Fully native, dialog-style Activity launched by the home-screen widget.
 *
 * Responsibilities:
 *   1. Open the app's SQLite database directly (no React Native bridge).
 *   2. Load non-archived categories for the picker.
 *   3. Accept an amount + category from the user.
 *   4. Insert an expense transaction and show a toast, then finish.
 *
 * The Activity is declared with Theme.AppCompat.Light.Dialog in the manifest
 * so it floats as a compact dialog over the home-screen wallpaper.
 *
 * Database path is resolved via context.getDatabasePath() so the path
 * is never hardcoded and survives package renames automatically.
 */
class WidgetEntryActivity : AppCompatActivity() {

    // ── Data ─────────────────────────────────────────────────────────────────

    private data class Category(val id: Long, val name: String, val color: String)

    private var categories: List<Category> = emptyList()
    private var selectedCategory: Category? = null
    private var db: SQLiteDatabase? = null

    // ── Views ────────────────────────────────────────────────────────────────

    private lateinit var amountInput: EditText
    private lateinit var categoryBtn: Button
    private lateinit var saveBtn: Button
    private lateinit var amountError: TextView
    private lateinit var categoryError: TextView

    // ── Lifecycle ─────────────────────────────────────────────────────────────

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_widget_entry)

        bindViews()
        openDatabase()
        loadCategories()
        setupListeners()
    }

    override fun onDestroy() {
        super.onDestroy()
        db?.close()
    }

    // ── Setup ─────────────────────────────────────────────────────────────────

    private fun bindViews() {
        amountInput  = findViewById(R.id.amount_input)
        categoryBtn  = findViewById(R.id.category_btn)
        saveBtn      = findViewById(R.id.save_btn)
        amountError  = findViewById(R.id.amount_error)
        categoryError = findViewById(R.id.category_error)
    }

    /**
     * Opens the database in read-write mode.
     * Uses context.getDatabasePath() so the path is always correct regardless
     * of the device or any future package changes.
     */
    private fun openDatabase() {
        try {
            val path = getDatabasePath("finance_tracker.db").absolutePath
            db = SQLiteDatabase.openDatabase(path, null, SQLiteDatabase.OPEN_READWRITE)
        } catch (e: Exception) {
            Toast.makeText(this, "Could not open database. Please open the app first.", Toast.LENGTH_LONG).show()
            finish()
        }
    }

    /**
     * Reads all active (non-archived) categories from the database.
     * Falls back gracefully if the table is empty or the query fails.
     */
    private fun loadCategories() {
        val database = db ?: return
        try {
            val cursor = database.rawQuery(
                "SELECT id, name, color FROM categories WHERE is_archived = 0 ORDER BY name COLLATE NOCASE",
                null
            )
            val result = mutableListOf<Category>()
            cursor.use {
                while (it.moveToNext()) {
                    result.add(
                        Category(
                            id    = it.getLong(it.getColumnIndexOrThrow("id")),
                            name  = it.getString(it.getColumnIndexOrThrow("name")),
                            color = it.getString(it.getColumnIndexOrThrow("color")),
                        )
                    )
                }
            }
            categories = result

            if (categories.isEmpty()) {
                // Disable category selection — user needs to create categories in the app first
                categoryBtn.isEnabled = false
                categoryBtn.text = "No categories — open app first"
                saveBtn.isEnabled = false
            }
        } catch (e: Exception) {
            Toast.makeText(this, "Could not load categories.", Toast.LENGTH_SHORT).show()
            finish()
        }
    }

    private fun setupListeners() {
        // Clear inline errors as the user corrects their input
        amountInput.addTextChangedListener(object : TextWatcher {
            override fun afterTextChanged(s: Editable?) {
                if (s?.isNotEmpty() == true) hideError(amountError)
            }
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) = Unit
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) = Unit
        })

        categoryBtn.setOnClickListener { showCategoryPicker() }
        saveBtn.setOnClickListener { attemptSave() }
    }

    // ── Category picker ───────────────────────────────────────────────────────

    private fun showCategoryPicker() {
        if (categories.isEmpty()) return

        val names = categories.map { it.name }.toTypedArray()
        val currentIndex = selectedCategory?.let { sel -> categories.indexOfFirst { it.id == sel.id } } ?: -1

        AlertDialog.Builder(this)
            .setTitle("Select category")
            .setSingleChoiceItems(names, currentIndex) { dialog, which ->
                selectedCategory = categories[which]
                categoryBtn.text = selectedCategory?.name
                hideError(categoryError)
                dialog.dismiss()
            }
            .setNegativeButton("Cancel", null)
            .show()
    }

    // ── Save ──────────────────────────────────────────────────────────────────

    private fun attemptSave() {
        val amountText = amountInput.text.toString().trim()
        val amount = amountText.toDoubleOrNull()

        var valid = true

        if (amount == null || amount <= 0.0) {
            showError(amountError, "Enter a valid amount")
            valid = false
        }

        if (selectedCategory == null) {
            showError(categoryError, "Select a category")
            valid = false
        }

        if (!valid) return

        insertTransaction(amount!!, selectedCategory!!)
    }

    /**
     * Inserts a single expense transaction.
     * Type is hardcoded to 'expense' per §3.4.
     * Timestamp is generated in SQLite (consistent with the RN repository layer).
     */
    private fun insertTransaction(amount: Double, category: Category) {
        val database = db ?: run {
            Toast.makeText(this, "Database unavailable.", Toast.LENGTH_SHORT).show()
            return
        }

        try {
            val now = System.currentTimeMillis().let {
                java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", java.util.Locale.US)
                    .apply { timeZone = java.util.TimeZone.getTimeZone("UTC") }
                    .format(java.util.Date(it))
            }

            val values = ContentValues().apply {
                put("amount",      amount)
                put("type",        "expense")
                put("category_id", category.id)
                put("date",        now)
                put("created_at",  now)
                put("updated_at",  now)
                // note and deleted_at are left NULL
            }

            database.insertOrThrow("transactions", null, values)

            Toast.makeText(this, "Added!", Toast.LENGTH_SHORT).show()
            finish()

        } catch (e: Exception) {
            Toast.makeText(
                this,
                "Could not save transaction. Please try again.",
                Toast.LENGTH_SHORT
            ).show()
        }
    }

    // ── Error helpers ─────────────────────────────────────────────────────────

    private fun showError(view: TextView, message: String) {
        view.text = message
        view.visibility = View.VISIBLE
    }

    private fun hideError(view: TextView) {
        view.visibility = View.GONE
        view.text = ""
    }
}
