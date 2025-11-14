// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Exclude build directories and caches from watching to prevent ENOENT errors
config.watchFolders = config.watchFolders || [];
config.watcher = {
  ...config.watcher,
  additionalExts: config.watcher?.additionalExts || [],
  // Ignore build directories
  ignored: [
    ...(config.watcher?.ignored || []),
    '**/node_modules/**/build/**',
    '**/node_modules/**/.gradle/**',
    '**/node_modules/**/build/kotlin/**',
    '**/android/build/**',
    '**/ios/build/**',
  ],
};

module.exports = config;

