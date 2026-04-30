import React from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {PaperProvider} from 'react-native-paper';
import AppNavigator from './src/navigation/AppNavigator';
import {theme} from './src/theme';

/**
 * App.tsx
 *
 * The root component. It no longer handles DB initialization directly
 * (that is moved to index.js via withDb) to prevent race conditions
 * with the navigation state.
 */
function App() {
  // Convert custom theme to react-native-paper theme
  const paperTheme = {
    colors: {
      primary: theme.colors.primary,
      background: theme.colors.background,
      surface: theme.colors.background,
      error: theme.colors.error,
      text: theme.colors.text,
      onBackground: theme.colors.text,
      onSurface: theme.colors.text,
    },
  };

  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <StatusBar barStyle="dark-content" />
        <AppNavigator />
      </PaperProvider>
    </SafeAreaProvider>
  );
}

export default App;
