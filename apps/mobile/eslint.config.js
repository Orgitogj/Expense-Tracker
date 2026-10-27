const { defineConfig, globalIgnores } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  globalIgnores([
    'dist/*',
    'android/*',
    'ios/*',
    '.expo/*',
    'expo-env.d.ts',
    'scripts/*',
  ]),
  expoConfig,
  {
    rules: {
      'no-unreachable': 'error',
      'react/no-unescaped-entities': 'off',
    },
  },
]);
