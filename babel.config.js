module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
      // ... your other plugins
      'react-native-reanimated/plugin', // ← must be last
    ],
};
