import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      container: {
        center: true,
        padding: {
          DEFAULT: "1rem",
          sm: "2rem",
          md: "3rem",
        },
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // The brand accent hues are routed through CSS variables (default values
        // match Tailwind's originals exactly, so default mode is unchanged) so
        // that Avengers mode can flip the whole accent palette in one place —
        // every shade/opacity/utility inherits it automatically. See the
        // `--acc-*` defaults in globals.css and the overrides in avengers.css.
        cyan: {
          300: "rgb(var(--acc-cyan-300) / <alpha-value>)",
          400: "rgb(var(--acc-cyan-400) / <alpha-value>)",
          500: "rgb(var(--acc-cyan-500) / <alpha-value>)",
          600: "rgb(var(--acc-cyan-600) / <alpha-value>)",
        },
        indigo: {
          300: "rgb(var(--acc-indigo-300) / <alpha-value>)",
          400: "rgb(var(--acc-indigo-400) / <alpha-value>)",
          500: "rgb(var(--acc-indigo-500) / <alpha-value>)",
        },
        fuchsia: {
          300: "rgb(var(--acc-fuchsia-300) / <alpha-value>)",
          400: "rgb(var(--acc-fuchsia-400) / <alpha-value>)",
          500: "rgb(var(--acc-fuchsia-500) / <alpha-value>)",
        },
        sky: {
          400: "rgb(var(--acc-sky-400) / <alpha-value>)",
          500: "rgb(var(--acc-sky-500) / <alpha-value>)",
        },
        blue: {
          400: "rgb(var(--acc-blue-400) / <alpha-value>)",
          600: "rgb(var(--acc-blue-600) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
        comic: ["var(--font-comic)", "var(--font-geist-sans)", "system-ui", "sans-serif"],
      },
      keyframes: {
        "aurora-drift": {
          "0%, 100%": { transform: "translate3d(0, 0, 0) scale(1)" },
          "33%": { transform: "translate3d(6%, -8%, 0) scale(1.12)" },
          "66%": { transform: "translate3d(-7%, 6%, 0) scale(0.94)" },
        },
        "aurora-drift-alt": {
          "0%, 100%": { transform: "translate3d(0, 0, 0) scale(1.05)" },
          "40%": { transform: "translate3d(-8%, 7%, 0) scale(0.92)" },
          "75%": { transform: "translate3d(5%, -5%, 0) scale(1.1)" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "spin-slow-reverse": {
          from: { transform: "rotate(360deg)" },
          to: { transform: "rotate(0deg)" },
        },
        "border-rotate": {
          to: { "--border-angle": "360deg" },
        },
        shimmer: {
          from: { backgroundPosition: "200% 0" },
          to: { backgroundPosition: "-200% 0" },
        },
        "float-y": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
        "scroll-hint": {
          "0%": { transform: "translateY(0)", opacity: "0" },
          "30%": { opacity: "1" },
          "100%": { transform: "translateY(14px)", opacity: "0" },
        },
        "caret-blink": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
      animation: {
        "aurora-drift": "aurora-drift 26s ease-in-out infinite",
        "aurora-drift-alt": "aurora-drift-alt 32s ease-in-out infinite",
        "spin-slow": "spin-slow 40s linear infinite",
        "spin-slow-reverse": "spin-slow-reverse 40s linear infinite",
        "spin-slower": "spin-slow 60s linear infinite",
        "spin-slower-reverse": "spin-slow-reverse 60s linear infinite",
        "border-rotate": "border-rotate 6s linear infinite",
        shimmer: "shimmer 6s linear infinite",
        "float-y": "float-y 7s ease-in-out infinite",
        "scroll-hint": "scroll-hint 2.2s ease-in-out infinite",
        "caret-blink": "caret-blink 1.1s linear infinite",
      },
      boxShadow: {
        "glow-sm": "0 0 24px -6px rgb(var(--acc-indigo-400) / 0.45)",
        glow: "0 0 48px -8px rgb(var(--acc-indigo-400) / 0.5)",
        "card-float":
          "0 24px 60px -20px rgba(5, 6, 13, 0.45), 0 8px 20px -12px rgba(5, 6, 13, 0.3)",
      },
    },
  },
  plugins: [],
  darkMode: "class",
};
export default config;
