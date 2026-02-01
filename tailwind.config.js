/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Kid-friendly theme customization
      colors: {
        primary: {
          50: "#fef3e2",
          100: "#fce4b6",
          200: "#fad488",
          300: "#f8c45a",
          400: "#f7b737",
          500: "#f5aa14", // Main bright orange/yellow
          600: "#f39c12",
          700: "#e08a0e",
          800: "#ce780b",
          900: "#ad5900",
        },
        success: {
          50: "#e8f8f5",
          100: "#c3ede3",
          200: "#9ae2d0",
          300: "#6fd6bd",
          400: "#4fcdaf",
          500: "#27c4a1", // Bright teal for success
          600: "#21b591",
          700: "#19a37e",
          800: "#12926b",
          900: "#007349",
        },
        danger: {
          50: "#fee",
          100: "#fdd",
          200: "#fbb",
          300: "#f88",
          400: "#f55",
          500: "#f33", // Bright red for errors/warnings
          600: "#e11",
          700: "#c00",
          800: "#a00",
          900: "#800",
        },
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      fontSize: {
        xs: ["0.75rem", {lineHeight: "1rem"}],
        sm: ["0.875rem", {lineHeight: "1.25rem"}],
        base: ["1rem", {lineHeight: "1.5rem"}],
        lg: ["1.25rem", {lineHeight: "1.75rem"}],
        xl: ["1.5rem", {lineHeight: "2rem"}],
        "2xl": ["1.875rem", {lineHeight: "2.25rem"}],
        "3xl": ["2.25rem", {lineHeight: "2.5rem"}],
        "4xl": ["3rem", {lineHeight: "3.5rem"}],
        "5xl": ["3.75rem", {lineHeight: "1"}],
      },
      boxShadow: {
        soft: "0 2px 8px rgba(0, 0, 0, 0.08)",
        medium: "0 4px 12px rgba(0, 0, 0, 0.12)",
        large: "0 8px 24px rgba(0, 0, 0, 0.16)",
      },
    },
  },
  plugins: [],
};
