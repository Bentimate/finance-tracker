package com.finance_tracker_rn

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.modules.core.DeviceEventManagerModule

/**
 * A bridge module that listens for "TRANSACTION_ADDED" broadcasts from the
 * native WidgetEntryActivity and relays them to the React Native JS layer.
 */
class WidgetUpdateModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "WidgetUpdateModule"

    private val receiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            if (intent?.action == "com.finance_tracker_rn.TRANSACTION_ADDED") {
                // Emit event to JS
                reactApplicationContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    .emit("WidgetTransactionAdded", null)
            }
        }
    }

    init {
        val filter = IntentFilter("com.finance_tracker_rn.TRANSACTION_ADDED")
        // Note: In newer Android versions, receivers must specify exported/non-exported
        // if they are not system broadcasts.
        reactContext.registerReceiver(receiver, filter, Context.RECEIVER_EXPORTED)
    }

    override fun onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy()
        try {
            reactApplicationContext.unregisterReceiver(receiver)
        } catch (e: Exception) {
            // Ignore if already unregistered
        }
    }
}
