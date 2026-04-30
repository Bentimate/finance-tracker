import React from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Provider as PaperProvider, MD3LightTheme} from 'react-native-paper';
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
    ...MD3LightTheme,                    // keep all defaults intact
    colors: {
      ...MD3LightTheme.colors,           // keep all MD3 color slots
      primary: theme.colors.primary,     // then override only what you need
      background: theme.colors.background,
      surface: theme.colors.background,
      error: theme.colors.error,
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
