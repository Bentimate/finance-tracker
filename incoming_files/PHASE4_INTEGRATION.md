# Phase 4 — Integration Guide

## 1. Install dependencies

```bash
npm install react-native-fs
cd android && ./gradlew clean
```

`react-native-fs` is the only new JS dependency for Phase 4.  
The widget is pure native (Kotlin + XML) with no additional libraries.

---

## 2. File placement

### JS / TS files — drop into `src/`

| Delivered file | Destination |
|---|---|
| `index.js` | Project root (replace existing) |
| `src/repositories/exportRepository.ts` | `src/repositories/` |
| `src/utils/exportCsv.ts` | `src/utils/` |
| `src/hooks/useExport.ts` | `src/hooks/` |
| `src/screens/Settings/SettingsScreen.tsx` | Replace existing |
| `src/screens/Settings/SettingsScreen.styles.ts` | Replace existing |
| `src/screens/Widget/WidgetEntryScreen.tsx` | New folder `src/screens/Widget/` |
| `src/screens/Widget/WidgetEntryScreen.styles.ts` | New folder `src/screens/Widget/` |

### Android files — drop into your Android project

| Delivered file | Destination |
|---|---|
| `FinanceWidget.kt` | `android/app/src/main/java/com/financetracker/` |
| `WidgetEntryActivity.kt` | `android/app/src/main/java/com/financetracker/` |
| `res/layout/widget_finance.xml` | `android/app/src/main/res/layout/` |
| `res/xml/widget_info.xml` | `android/app/src/main/res/xml/` |
| `res/drawable/widget_background.xml` | `android/app/src/main/res/drawable/` |
| `res/drawable/widget_btn_background.xml` | `android/app/src/main/res/drawable/` |

---

## 3. AndroidManifest.xml

Add the following inside your `<application>` tag in
`android/app/src/main/AndroidManifest.xml`:

```xml
<!-- Widget entry activity (transparent, dialog-style) -->
<activity
    android:name=".WidgetEntryActivity"
    android:theme="@style/Theme.AppCompat.Dialog"
    android:exported="false"
    android:windowSoftInputMode="adjustResize" />

<!-- Widget receiver -->
<receiver
    android:name=".FinanceWidget"
    android:exported="true">
    <intent-filter>
        <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
    </intent-filter>
    <meta-data
        android:name="android.appwidget.provider"
        android:resource="@xml/widget_info" />
</receiver>
```

Also add the storage write permission (required by `react-native-fs` to write
to the Downloads folder) if it is not already present:

```xml
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"
    android:maxSdkVersion="28" />
```

On Android 29+ the Downloads directory is accessible without this permission
via the scoped storage APIs that `react-native-fs` uses automatically.

---

## 4. Package name

Both Kotlin files default to `package com.financetracker`.  
If your `applicationId` in `build.gradle` differs, update the package
declaration at the top of each `.kt` file to match.

---

## 5. Verify `index.js` component names

The two strings in `index.js` must match `getMainComponentName()` in the
corresponding Activity files:

| `AppRegistry.registerComponent(name)` | Activity |
|---|---|
| `"FinanceTracker"` | `MainActivity.kt` |
| `"WidgetEntryScreen"` | `WidgetEntryActivity.kt` |

Check your existing `MainActivity.kt` to confirm the main component name —
it may be different from `"FinanceTracker"` depending on how you initialised
the project.

---

## 6. Build and test

```bash
# JS bundle
npx react-native start --reset-cache

# Android (in a separate terminal)
npx react-native run-android
```

To test the widget:
1. Long-press on the Android home screen → Widgets
2. Find "Finance" and drag it onto the home screen
3. Tap the indigo "Add" button → WidgetEntryScreen should appear as a bottom sheet
4. Enter an amount, select a category, tap Save
5. Open the app → Transactions tab → confirm the expense was recorded

---

## 7. Known constraints

- **Widget is expenses-only.** The design spec (§3.4) requires only Amount +
  Category for the widget. Type is hardcoded to `'expense'`. If you want to
  support income later, add a toggle to `WidgetEntryScreen` — no native
  changes are needed.

- **`BackHandler.exitApp()` in `WidgetEntryScreen`** finishes the Activity on
  Android, which is correct for a secondary activity. It does not exit the
  whole app process.

- **Downloads folder on Android 10+ (API 29+)** does not require the
  `WRITE_EXTERNAL_STORAGE` permission. `react-native-fs`'s
  `DownloadDirectoryPath` resolves to the shared Downloads directory correctly
  on all modern API levels.
