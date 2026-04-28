package com.finance_tracker_rn

import android.os.Bundle
import android.view.View
import android.view.inputmethod.EditorInfo
import android.widget.ArrayAdapter
import android.widget.EditText
import android.widget.GridView
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class QuickAddActivity : AppCompatActivity() {

    private var selectedCategoryId: Long = -1
    private lateinit var amountInput: EditText
    private lateinit var gridView: GridView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_quick_add)

        gridView = findViewById(R.id.categoryGrid)
        amountInput = findViewById(R.id.amountInput)

        // 1. Load categories off the main thread
        Thread {
            val categories = WidgetDbHelper.getActiveCategories(this@QuickAddActivity)

            runOnUiThread {
                val adapter = CategoryAdapter(this@QuickAddActivity, categories)
                gridView.adapter = adapter

                gridView.setOnItemClickListener { _, _, position, _ ->
                    selectedCategoryId = categories[position].id
                    // Highlight selected visually (handled in adapter)
                    adapter.setSelectedPosition(position)

                    // Auto-focus amount input for immediate typing
                    amountInput.requestFocus()
                }
            }
        }.start()

        // 2. Handle Keyboard "Done" action (Interaction 3)
        amountInput.setOnEditorActionListener { _, actionId, _ ->
            if (actionId == EditorInfo.IME_ACTION_DONE) {
                saveTransaction()
                true
            } else {
                false
            }
        }
    }

    private fun saveTransaction() {
        val amountStr = amountInput.text.toString()

        if (selectedCategoryId == -1L) {
            Toast.makeText(this, "Select a category", Toast.LENGTH_SHORT).show()
            return
        }

        if (amountStr.isEmpty() || amountStr.toDoubleOrNull() == null || amountStr.toDouble() <= 0) {
            Toast.makeText(this, "Enter a valid amount", Toast.LENGTH_SHORT).show()
            return
        }

        val amount = amountStr.toDouble()

        Thread {
            // Direct DB write
            WidgetDbHelper.insertExpense(this@QuickAddActivity, amount, selectedCategoryId)

            runOnUiThread {
                Toast.makeText(this@QuickAddActivity, "Expense added!", Toast.LENGTH_SHORT).show()
                finish() // Close pop-up instantly
            }
        }.start()
    }
}
