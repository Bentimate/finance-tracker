/**
 * index.js — root entry point
 *
 * This file wraps the main App in a DB-guarded component to ensure
 * the SQLite database and its schema are ready before any hooks
 * or screens attempt to query it.
 */

import {AppRegistry} from 'react-native';
import React from 'react';
import App from './App';
import {initDb} from './src/database/db';
import { name as appName } from './app.json';

// ---------------------------------------------------------------------------
// DB-guarded wrapper
// ---------------------------------------------------------------------------

/**
 * Higher-order component that ensures the SQLite database is initialised
 * before rendering the wrapped component.
 *
 * This prevents "Table not found" errors that occur when the UI
 * (AppNavigator -> Dashboard) tries to query the DB while it's still
 * opening or migrating.
 */
function withDb(Component) {
  return function DbGuard(props) {
    const [ready, setReady] = React.useState(false);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
      initDb()
        .then(() => setReady(true))
        .catch((e) => {
          console.error('Database initialization failed:', e);
          setError(e?.message ?? 'DB init failed');
        });
    }, []);

    if (error) {
      // Show error state if DB cannot be opened at all.
      const {View, Text, StyleSheet} = require('react-native');
      return (
        <View style={errStyles.container}>
          <Text style={errStyles.title}>Database Error</Text>
          <Text style={errStyles.text}>Failed to open database.{'\n'}{error}</Text>
        </View>
      );
    }

    if (!ready) {
      // Keep screen empty (or show splash) while DB is warming up.
      // Returning null prevents the rest of the React tree from mounting.
      return null;
    }

    return <Component {...props} />;
  };
}

const errStyles = {
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1f2937'
  },
  text: {
    fontSize: 14,
    color: '#ef4444',
    textAlign: 'center'
  },
};

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

// Apply withDb wrapper to the root App
AppRegistry.registerComponent(appName, () => withDb(App));
