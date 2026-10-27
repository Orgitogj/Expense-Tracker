const { defineConfig, globalIgnores } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const prettierConfig = require("eslint-config-prettier/flat");

module.exports = defineConfig([
  globalIgnores([
    "dist/*",
    "web-build/*",
    "android/*",
    "ios/*",
    ".expo/*",
    "expo-env.d.ts",
    "nativewind-env.d.ts",
  ]),
  expoConfig,
  prettierConfig,
  {
    rules: {
      "no-unreachable": "error",
      "react/no-unescaped-entities": "off",
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "react-native",
              importNames: ["StyleSheet"],
              message:
                "Style with NativeWind className instead (see apps/mobile/README.md).",
            },
          ],
        },
      ],
    },
  },
]);
