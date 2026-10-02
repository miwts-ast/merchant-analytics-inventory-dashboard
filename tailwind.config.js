/** @type {import('tailwindcss').Config} */

// Each token points at a CSS variable (defined in index.css) so one class
// like `bg-card` or `text-muted` works in both light and dark mode.
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        // surfaces
        page: token("page"),
        card: token("card"),
        elevated: token("elevated"),
        line: token("line"),
        sidebar: token("sidebar"),

        // text
        ink: token("ink"),
        muted: token("muted"),

        // brand
        primary: {
          DEFAULT: token("primary"),
          hover: token("primary-hover"),
          tint: token("primary-tint"),
          "on-tint": token("primary-on-tint"),
        },
        accent: token("accent"),

        // table header
        thead: token("thead"),

        // status badges: bg + text pairs
        success: { DEFAULT: token("success"), tint: token("success-tint") },
        warning: { DEFAULT: token("warning"), tint: token("warning-tint") },
        danger: { DEFAULT: token("danger"), tint: token("danger-tint") },
        neutral: { DEFAULT: token("neutral"), tint: token("neutral-tint") },

        // chart series (same in both modes, readable on light and dark)
        chart: {
          1: "#7C3AED",
          2: "#06B6D4",
          3: "#F472B6",
          4: "#FBBF24",
          5: "#34D399",
        },
      },
      backgroundImage: {
        signature: "linear-gradient(135deg, #7C3AED, #06B6D4)",
      },
      boxShadow: {
        card: "0 1px 2px rgb(var(--shadow) / 0.06), 0 4px 16px rgb(var(--shadow) / 0.06)",
        glow: "0 0 24px rgb(124 58 237 / 0.35)",
      },
    },
  },
  plugins: [],
};
