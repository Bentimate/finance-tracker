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
 *   3. Accept a signed amount + category from the user.
 *   4. Insert a canonical transaction (positive amount + derived type) and show a toast, then finish.
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
    private lateinit var key0: Button
    private lateinit var key1: Button
    private lateinit var key2: Button
    private lateinit var key3: Button
    private lateinit var key4: Button
    private lateinit var key5: Button
    private lateinit var key6: Button
    private lateinit var key7: Button
    private lateinit var key8: Button
    private lateinit var key9: Button
    private lateinit var keySign: Button
    private lateinit var keyDecimal: Button
    private lateinit var keyClear: Button
    private lateinit var keyBackspace: Button

    // ── Lifecycle ─────────────────────────────────────────────────────────────

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_widget_entry)
        supportActionBar?.hide()

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
        key0 = findViewById(R.id.key_0)
        key1 = findViewById(R.id.key_1)
        key2 = findViewById(R.id.key_2)
        key3 = findViewById(R.id.key_3)
        key4 = findViewById(R.id.key_4)
        key5 = findViewById(R.id.key_5)
        key6 = findViewById(R.id.key_6)
        key7 = findViewById(R.id.key_7)
        key8 = findViewById(R.id.key_8)
        key9 = findViewById(R.id.key_9)
        keySign = findViewById(R.id.key_sign)
        keyDecimal = findViewById(R.id.key_decimal)
        keyClear = findViewById(R.id.key_clear)
        keyBackspace = findViewById(R.id.key_backspace)
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
        amountInput.showSoftInputOnFocus = false

        // Clear inline errors as the user corrects their input
        amountInput.addTextChangedListener(object : TextWatcher {
            override fun afterTextChanged(s: Editable?) {
                if (s?.isNotEmpty() == true) hideError(amountError)
                updateAmountColor(s?.toString().orEmpty())
            }
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) = Unit
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) = Unit
        })

        categoryBtn.setOnClickListener { showCategoryPicker() }
        saveBtn.setOnClickListener { attemptSave() }
        key1.setOnClickListener { appendDigit("1") }
        key2.setOnClickListener { appendDigit("2") }
        key3.setOnClickListener { appendDigit("3") }
        key4.setOnClickListener { appendDigit("4") }
        key5.setOnClickListener { appendDigit("5") }
        key6.setOnClickListener { appendDigit("6") }
        key7.setOnClickListener { appendDigit("7") }
        key8.setOnClickListener { appendDigit("8") }
        key9.setOnClickListener { appendDigit("9") }
        key0.setOnClickListener { appendDigit("0") }
        keyDecimal.setOnClickListener { appendDecimal() }
        keySign.setOnClickListener { toggleSign() }
        keyBackspace.setOnClickListener { backspace() }
        keyClear.setOnClickListener { clearAmount() }

        updateAmountColor(amountInput.text?.toString().orEmpty())
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

    private data class NormalizedAmount(val amount: Double, val type: String)

    private fun appendDigit(digit: String) {
        val trimmed = amountInput.text.toString().trim()
        val next = if (trimmed.isEmpty()) {
            digit
        } else {
            val hasSign = trimmed.startsWith("-") || trimmed.startsWith("+")
            val sign = if (hasSign) trimmed.substring(0, 1) else ""
            val numericPart = if (hasSign) trimmed.substring(1) else trimmed
            val nextNumericPart = if (numericPart == "0") digit else numericPart + digit
            sign + nextNumericPart
        }
        amountInput.setText(next)
    }

    private fun appendDecimal() {
        val trimmed = amountInput.text.toString().trim()
        val hasSign = trimmed.startsWith("-") || trimmed.startsWith("+")
        val sign = if (hasSign) trimmed.substring(0, 1) else ""
        val numericPart = if (hasSign) trimmed.substring(1) else trimmed
        if (numericPart.contains(".")) return

        val next = if (numericPart.isEmpty()) {
            sign + "0."
        } else {
            sign + numericPart + "."
        }
        amountInput.setText(next)
    }

    private fun toggleSign() {
        val trimmed = amountInput.text.toString().trim()
        val next = when {
            trimmed.isEmpty() -> "-"
            trimmed.startsWith("-") -> trimmed.substring(1)
            trimmed.startsWith("+") -> "-" + trimmed.substring(1)
            else -> "-$trimmed"
        }
        amountInput.setText(next)
    }

    private fun backspace() {
        val trimmed = amountInput.text.toString().trim()
        if (trimmed.isEmpty()) {
            amountInput.setText("")
            return
        }

        val next = trimmed.dropLast(1)
        amountInput.setText(
            if (next == "-" || next == "+") {
                ""
            } else {
                next
            }
        )
    }

    private fun clearAmount() {
        amountInput.setText("")
    }

    private fun normalizeSignedAmount(rawAmount: String): NormalizedAmount? {
        val trimmed = rawAmount.trim()
        if (trimmed.isEmpty()) return null

        val parsed = trimmed.toDoubleOrNull() ?: return null
        if (parsed == 0.0) return null

        return if (trimmed.startsWith("-")) {
            NormalizedAmount(kotlin.math.abs(parsed), "expense")
        } else {
            NormalizedAmount(kotlin.math.abs(parsed), "income")
        }
    }

    private fun attemptSave() {
        val normalized = normalizeSignedAmount(amountInput.text.toString())

        var valid = true

        if (normalized == null) {
            showError(amountError, "Enter a non-zero amount (e.g. 120 or -120)")
            valid = false
        }

        if (selectedCategory == null) {
            showError(categoryError, "Select a category")
            valid = false
        }

        if (!valid) return

        insertTransaction(normalized!!.amount, normalized.type, selectedCategory!!)
    }

    /**
     * Inserts a single transaction with canonical storage:
     * positive amount + explicit type.
     * Timestamp is generated in SQLite (consistent with the RN repository layer).
     */
    private fun insertTransaction(amount: Double, type: String, category: Category) {
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
                put("type",        type)
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

    private fun updateAmountColor(rawAmount: String) {
        val trimmed = rawAmount.trim()
        val color = if (trimmed.startsWith("-")) {
            0xFFEF4444.toInt()
        } else {
            0xFF22C55E.toInt()
        }
        amountInput.setTextColor(color)
    }
}
