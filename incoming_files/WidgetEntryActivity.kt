package com.financetracker   // ← Replace with your actual package name

import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

/**
 * A transparent, modal-style Activity that hosts the React Native
 * WidgetEntryScreen component.
 *
 * Design choices:
 *   - Extends ReactActivity so the full RN bridge and JS runtime are available.
 *   - Overrides getMainComponentName() to render "WidgetEntryScreen" instead
 *     of the main "FinanceTracker" component.
 *   - Styled as a dialog/bottom-sheet in the manifest (Theme.Dialog) so it
 *     appears as an overlay over the home screen.
 *
 * The RN component is responsible for:
 *   - Loading categories from SQLite
 *   - Validating and saving the transaction
 *   - Calling finish() (via a NativeModule or BackHandler) when done
 */
class WidgetEntryActivity : ReactActivity() {

    override fun getMainComponentName(): String = "WidgetEntryScreen"

    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

    override fun onCreate(savedInstanceState: Bundle?) {
        // Do NOT call super.onCreate(savedInstanceState) with the saved state
        // for secondary activities — pass null to avoid state restore conflicts
        // with the RN bridge initialisation.
        super.onCreate(null)
    }
}
