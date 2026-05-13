package com.finance_tracker_rn

import android.content.ContentValues
import android.content.Intent
import android.database.sqlite.SQLiteDatabase
import android.graphics.Color
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.ListView
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import java.io.File
import kotlin.math.roundToInt

class WidgetEntryActivity : AppCompatActivity() {

    private data class Category(
        val id: Long,
        val name: String,
        val color: String,
        val icon: String?,
        val parentId: Long?,
    )

    private data class ParentCategory(
        val id: Long,
        val name: String,
        val color: String,
        val icon: String?,
        val children: List<Category>,
    )

    private var parentCategories: List<ParentCategory> = emptyList()
    private var selectedCategoryId: Long? = null
    private var selectedDisplayLabel: String = ""
    private var db: SQLiteDatabase? = null

    private lateinit var amountInput: EditText
    private lateinit var noteInput: EditText
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

    private fun bindViews() {
        amountInput = findViewById(R.id.amount_input)
        noteInput = findViewById(R.id.note_input)
        categoryBtn = findViewById(R.id.category_btn)
        saveBtn = findViewById(R.id.save_btn)
        amountError = findViewById(R.id.amount_error)
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

    private fun openDatabase() {
        val dbFile = getDatabasePath("finance_tracker.db")
        val sentinelFile = File(filesDir, ".db_initialized")

        if (!sentinelFile.exists() || !dbFile.exists()) {
            Toast.makeText(
                this,
                "Please open the app first to finish setup.",
                Toast.LENGTH_LONG,
            ).show()
            finish()
            return
        }

        try {
            db = SQLiteDatabase.openDatabase(
                dbFile.absolutePath,
                null,
                SQLiteDatabase.OPEN_READWRITE,
            )
            db?.rawQuery("PRAGMA busy_timeout = 5000", null)?.close()
            db?.rawQuery("PRAGMA synchronous = FULL", null)?.close()
        } catch (_: Exception) {
            Toast.makeText(
                this,
                "Could not open database. Please open the app first.",
                Toast.LENGTH_LONG,
            ).show()
            finish()
        }
    }

    private fun loadCategories() {
        val database = db ?: return
        try {
            val allCategories = mutableListOf<Category>()
            val cursor = database.rawQuery(
                """
                SELECT id, name, color, icon, parent_id
                FROM categories
                WHERE is_archived = 0
                ORDER BY name COLLATE NOCASE
                """.trimIndent(),
                null,
            )
            cursor.use { c ->
                val idIndex = c.getColumnIndexOrThrow("id")
                val nameIndex = c.getColumnIndexOrThrow("name")
                val colorIndex = c.getColumnIndexOrThrow("color")
                val iconIndex = c.getColumnIndexOrThrow("icon")
                val parentIdIndex = c.getColumnIndexOrThrow("parent_id")
                while (c.moveToNext()) {
                    allCategories.add(
                        Category(
                            id = c.getLong(idIndex),
                            name = c.getString(nameIndex),
                            color = c.getString(colorIndex),
                            icon = if (c.isNull(iconIndex)) null else c.getString(iconIndex),
                            parentId = if (c.isNull(parentIdIndex)) null else c.getLong(parentIdIndex),
                        ),
                    )
                }
            }

            val roots = allCategories.filter { it.parentId == null }
            val childrenByParent = allCategories
                .filter { it.parentId != null }
                .groupBy { it.parentId!! }

            parentCategories = roots.map { root ->
                ParentCategory(
                    id = root.id,
                    name = root.name,
                    color = root.color,
                    icon = root.icon,
                    children = childrenByParent[root.id].orEmpty(),
                )
            }

            if (parentCategories.isEmpty()) {
                categoryBtn.isEnabled = false
                categoryBtn.text = "No categories - open app first"
                saveBtn.isEnabled = false
            }
        } catch (_: Exception) {
            Toast.makeText(this, "Could not load categories.", Toast.LENGTH_SHORT).show()
            finish()
        }
    }

    private fun setupListeners() {
        amountInput.showSoftInputOnFocus = false

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

    private fun showCategoryPicker() {
        if (parentCategories.isEmpty()) {
            return
        }
        showParentCategoryPicker()
    }

    private fun showParentCategoryPicker() {
        val rows = parentCategories.map { parent ->
            WidgetCategoryPickerAdapter.Row(
                id = parent.id,
                title = parent.name,
                colorHex = parent.color,
                iconName = parent.icon,
                isOthers = false,
            )
        }

        val parts = buildPickerDialog(
            title = "Select parent category",
            rows = rows,
            selectedId = selectedCategoryId,
        )

        parts.listView.setOnItemClickListener { _, _, position, _ ->
            val parent = parentCategories[position]
            if (parent.children.isEmpty()) {
                selectedCategoryId = parent.id
                selectedDisplayLabel = parent.name
                categoryBtn.text = selectedDisplayLabel
                hideError(categoryError)
                parts.dialog.dismiss()
                return@setOnItemClickListener
            }

            parts.dialog.dismiss()
            showChildCategoryPicker(parent)
        }

        parts.btnCancel.setOnClickListener { parts.dialog.dismiss() }
        parts.dialog.show()
        capDialogListHeight(parts.dialogView, parts.listView)
    }

    private fun showChildCategoryPicker(parent: ParentCategory) {
        val childRows = parent.children.map { child ->
            WidgetCategoryPickerAdapter.Row(
                id = child.id,
                title = child.name,
                colorHex = child.color,
                iconName = child.icon,
                isOthers = false,
            )
        }
        val othersRow = WidgetCategoryPickerAdapter.Row(
            id = parent.id,
            title = "Others",
            colorHex = parent.color,
            iconName = parent.icon,
            isOthers = true,
        )
        val rows = childRows + othersRow

        val selectedInThisGroup = when {
            selectedCategoryId == parent.id -> parent.id
            parent.children.any { it.id == selectedCategoryId } -> selectedCategoryId
            else -> null
        }

        val parts = buildPickerDialog(
            title = "Select subcategory in ${parent.name}",
            rows = rows,
            selectedId = selectedInThisGroup,
        )

        parts.listView.setOnItemClickListener { _, _, position, _ ->
            val row = rows[position]
            selectedCategoryId = row.id
            selectedDisplayLabel = if (row.isOthers) {
                parent.name
            } else {
                row.title
            }
            categoryBtn.text = selectedDisplayLabel
            hideError(categoryError)
            parts.dialog.dismiss()
        }

        parts.btnCancel.setOnClickListener { parts.dialog.dismiss() }
        parts.dialog.show()
        capDialogListHeight(parts.dialogView, parts.listView)
    }

    private data class PickerDialogParts(
        val dialogView: View,
        val listView: ListView,
        val btnCancel: Button,
        val dialog: AlertDialog,
    )

    private fun buildPickerDialog(
        title: String,
        rows: List<WidgetCategoryPickerAdapter.Row>,
        selectedId: Long?,
    ): PickerDialogParts {
        val dialogView = layoutInflater.inflate(R.layout.dialog_category_picker, null)
        val titleView = dialogView.findViewById<TextView>(R.id.dialog_title)
        val listView = dialogView.findViewById<ListView>(R.id.category_list_view)
        val btnCancel = dialogView.findViewById<Button>(R.id.btn_cancel)

        titleView.text = title
        listView.adapter = WidgetCategoryPickerAdapter(this, rows, selectedId)

        val dialog = AlertDialog.Builder(this)
            .setView(dialogView)
            .create()

        return PickerDialogParts(
            dialogView = dialogView,
            listView = listView,
            btnCancel = btnCancel,
            dialog = dialog,
        )
    }

    private fun capDialogListHeight(dialogView: View, listView: ListView) {
        val displayMetrics = resources.displayMetrics
        val maxHeight = (displayMetrics.heightPixels * 0.5).roundToInt()

        dialogView.post {
            if (dialogView.height <= maxHeight) {
                return@post
            }

            val params = listView.layoutParams
            val title = dialogView.findViewById<View>(R.id.dialog_title)
            val cancel = dialogView.findViewById<View>(R.id.btn_cancel)
            val extra = (44 * displayMetrics.density).roundToInt()
            val otherViewsHeight = title.height + cancel.height + extra
            params.height = maxHeight - otherViewsHeight
            listView.layoutParams = params
        }
    }

    private data class NormalizedAmount(val amount: Double, val type: String)

    private fun appendDigit(digit: String) {
        val trimmed = amountInput.text.toString().trim()
        val next = if (trimmed.isEmpty()) {
            "-" + digit
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
            },
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
        if (selectedCategoryId == null) {
            showError(categoryError, "Select a category")
            valid = false
        }
        if (!valid) return

        val normalizedAmount = normalized ?: return
        insertTransaction(
            amount = normalizedAmount.amount,
            type = normalizedAmount.type,
            categoryId = selectedCategoryId!!,
            note = noteInput.text?.toString()?.trim().orEmpty(),
        )
    }

    private fun insertTransaction(amount: Double, type: String, categoryId: Long, note: String) {
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
                put("amount", amount)
                put("type", type)
                put("category_id", categoryId)
                put("date", now)
                put("created_at", now)
                put("updated_at", now)
                if (note.isNotBlank()) {
                    put("note", note)
                } else {
                    putNull("note")
                }
            }

            database.insertOrThrow("transactions", null, values)

            val intent = Intent("com.finance_tracker_rn.TRANSACTION_ADDED")
            sendBroadcast(intent)

            Toast.makeText(this, "Added!", Toast.LENGTH_SHORT).show()
            finish()
        } catch (_: Exception) {
            Toast.makeText(
                this,
                "Could not save transaction. Please try again.",
                Toast.LENGTH_SHORT,
            ).show()
        }
    }

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
            Color.parseColor("#EF4444")
        } else {
            Color.parseColor("#22C55E")
        }
        amountInput.setTextColor(color)
    }
}
