import React from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';

/**
 * App.tsx
 *
 * The root component. It no longer handles DB initialization directly
 * (that is moved to index.js via withDb) to prevent race conditions
 * with the navigation state.
 */
function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}

export default App;
