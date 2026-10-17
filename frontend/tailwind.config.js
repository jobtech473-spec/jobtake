/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "Outfit", "ui-sans-serif", "system-ui"],
        body: ["var(--font-body)", "Satoshi", "ui-sans-serif", "system-ui"],
      },
      colors: {
        ink: {
          50: "#FAFAFA",
          100: "#F4F4F5",
          200: "#E4E4E7",
          300: "#D4D4D8",
          400: "#A1A1AA",
          500: "#71717A",
          600: "#52525B",
          700: "#3F3F46",
          800: "#27272A",
          900: "#18181B",
          950: "#09090B",
        },
        brand: {
          orange: "#F26A1F",
          blue: "#1F3DBB",
          deep: "#142A8C",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
