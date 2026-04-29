/**
 * index.js — root entry point
 *
 * Two root components are registered:
 *
 *   1. "FinanceTracker"   → rendered by MainActivity       (normal app launch)
 *   2. "WidgetEntryScreen" → rendered by WidgetEntryActivity (widget tap)
 *
 * Each registration is self-contained: it initialises the DB before rendering
 * because WidgetEntryActivity is an independent Android entry point that may
 * launch without MainActivity ever having run in the current process.
 *
 * Replace the component name strings if your app/manifest uses different names.
 */

import {AppRegistry} from 'react-native';
import React from 'react';
import App from './App';
import WidgetEntryScreen from './src/screens/Widget/WidgetEntryScreen';
import {initDb} from './src/database/db';

// ---------------------------------------------------------------------------
// DB-guarded wrapper
// ---------------------------------------------------------------------------

/**
 * Higher-order component that ensures the SQLite database is initialised
 * before rendering the wrapped component.
 *
 * Rendering nothing (null) while loading is intentional — the widget entry
 * sheet is fast enough that no loading splash is needed. For the main app,
 * App.tsx already handles its own loading state.
 */
function withDb<P extends object>(
  Component: React.ComponentType<P>,
): React.FC<P> {
  return function DbGuard(props: P) {
    const [ready, setReady] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
      initDb()
        .then(() => setReady(true))
        .catch((e: any) => setError(e?.message ?? 'DB init failed'));
    }, []);

    if (error) {
      // Minimal error state — avoids a silent white screen on DB failure.
      const {View, Text, StyleSheet} = require('react-native');
      return (
        <View style={errStyles.container}>
          <Text style={errStyles.text}>Failed to open database.{'\n'}{error}</Text>
        </View>
      );
    }

    if (!ready) {
      return null;
    }

    return <Component {...props} />;
  };
}

const errStyles = {
  container: {flex: 1, alignItems: 'center' as const, justifyContent: 'center' as const, padding: 24},
  text: {fontSize: 14, color: '#ef4444', textAlign: 'center' as const},
};

// ---------------------------------------------------------------------------
// Registrations
// ---------------------------------------------------------------------------

// Main app — name must match getMainComponentName() in MainActivity.kt
AppRegistry.registerComponent('FinanceTracker', () => withDb(App));

// Widget entry — name must match getMainComponentName() in WidgetEntryActivity.kt
AppRegistry.registerComponent('WidgetEntryScreen', () => withDb(WidgetEntryScreen));
