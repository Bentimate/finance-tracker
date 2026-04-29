/**
 * index.js — root entry point
 *
 * Only one root component is registered: the main React Native app.
 * The widget now launches a fully native Android Activity (WidgetEntryActivity)
 * that talks directly to SQLite — the RN bridge is not involved at all.
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
