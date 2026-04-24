/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    screens: {
      xs: "420px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'ui-sans-serif', 'sans-serif'],
      },
      colors: {
        // Warm, near-neutral canvas. Was a near-black stack; now a
        // stone-warm light stack, with the darker numbers used for text
        // and the lighter numbers for surfaces/borders.
        ink: {
          50: "#FAFAF9",   // body background — warm off-white, stone-50
          100: "#F5F5F4",  // subtle surface tint, stone-100
          200: "#E7E5E4",  // hairline borders, stone-200
          300: "#D6D3D1",  // dividers, stone-300
          400: "#A8A29E",  // muted placeholder text, stone-400
          500: "#78716C",  // secondary text, stone-500
          600: "#57534E",  // body text, stone-600
          700: "#44403C",  // strong body text, stone-700
          800: "#292524",  // headings, stone-800
          900: "#1C1917",  // near-black, stone-900 (primary text)
        },
        // Primary — muted indigo / soft slate-blue. Not bright.
        brand: {
          50: "#F1F2F7",
          100: "#E1E4EF",
          200: "#C0C5DD",
          300: "#98A0C7",
          400: "#747EB3",
          500: "#5361A8",  // primary
          600: "#434F8C",
          700: "#363F6F",
          800: "#292F53",
          900: "#1D213A",
        },
        // Accent — warm cocoa-tan for contrast against the cool primary.
        accent: {
          100: "#F6EFE8",
          200: "#E8D9C7",
          300: "#D1B6A8",
          400: "#B89986",
          500: "#95785F",
          600: "#77604B",
          700: "#5A4838",
        },
      },
      letterSpacing: {
        "extra-tight": "-0.035em",
      },
    },
  },
  plugins: [],
};
