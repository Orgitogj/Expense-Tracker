const { colors } = require("./src/theme/colors");

module.exports = {
  content: {
    relative: true,
    files: ["./src/**/*.{js,jsx,ts,tsx}"],
  },
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: colors.primary,
          light: colors.primaryLight,
          dark: colors.primaryDark,
        },
        foreground: {
          DEFAULT: colors.text,
          light: colors.textLight,
          lighter: colors.textLighter,
        },
        rose: { DEFAULT: colors.rose },
        green: { DEFAULT: colors.green },
        neutral: {
          50: colors.neutral50,
          100: colors.neutral100,
          200: colors.neutral200,
          300: colors.neutral300,
          350: colors.neutral350,
          400: colors.neutral400,
          500: colors.neutral500,
          600: colors.neutral600,
          700: colors.neutral700,
          800: colors.neutral800,
          900: colors.neutral900,
        },
      },
    },
  },
  plugins: [],
};
