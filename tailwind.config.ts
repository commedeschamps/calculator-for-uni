import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      colors: {
        border: "var(--border)",
        input: "var(--border)",
        ring: "var(--accent)",
        background: "var(--bg)",
        foreground: "var(--text)",
        "white-100": "var(--color-white-100)",
        "primary-400": "var(--color-primary-400)",
        "button-primary-background": "var(--color-button-primary-background)",
        "button-primary-hover-background": "var(--color-button-primary-hover-background)",
        "button-primary-text": "var(--color-button-primary-text)",
        "button-primary-focus-ring": "var(--color-button-primary-focus-ring)",
        "button-outline-background": "var(--color-button-outline-background)",
        "button-outline-hover-background": "var(--color-button-outline-hover-background)",
        "button-outline-border": "var(--color-button-outline-border)",
        "button-outline-focus-ring": "var(--color-button-outline-focus-ring)",
        "button-outline-text": "var(--color-button-outline-text)",
        "button-outline-hover-text": "var(--color-button-outline-hover-text)",
        "button-outline-disabled-background": "var(--color-button-outline-disabled-background)",
        "button-outline-disabled-text": "var(--color-button-outline-disabled-text)",
        "button-outline-disabled-border": "var(--color-button-outline-disabled-border)",
        "button-disabled-background": "var(--color-button-disabled-background)",
        "button-disabled-border": "var(--color-button-disabled-border)",
        "button-disabled-text": "var(--color-button-disabled-text)",
        "button-error-background": "var(--color-button-error-background)",
        "button-error-hover-background": "var(--color-button-error-hover-background)",
        "button-error-border": "var(--color-button-error-border)",
        "button-error-text": "var(--color-button-error-text)",
        "button-error-focus-ring": "var(--color-button-error-focus-ring)",
        "button-error-outline-background": "var(--color-button-error-outline-background)",
        "button-error-outline-hover-background": "var(--color-button-error-outline-hover-background)",
        "button-error-outline-border": "var(--color-button-error-outline-border)",
        "button-error-outline-focus-border": "var(--color-button-error-outline-focus-border)",
        "button-error-outline-focus-ring": "var(--color-button-error-outline-focus-ring)",
        "button-error-outline-text": "var(--color-button-error-outline-text)",
        "button-error-outline-hover-text": "var(--color-button-error-outline-hover-text)",
        "button-success-background": "var(--color-button-success-background)",
        "button-success-hover-background": "var(--color-button-success-hover-background)",
        "button-success-border": "var(--color-button-success-border)",
        "button-success-text": "var(--color-button-success-text)",
        "button-success-focus-ring": "var(--color-button-success-focus-ring)",
        "button-success-outline-background": "var(--color-button-success-outline-background)",
        "button-success-outline-hover-background": "var(--color-button-success-outline-hover-background)",
        "button-success-outline-border": "var(--color-button-success-outline-border)",
        "button-success-outline-focus-border": "var(--color-button-success-outline-focus-border)",
        "button-success-outline-text": "var(--color-button-success-outline-text)",
        "button-success-outline-hover-text": "var(--color-button-success-outline-hover-text)",
        "button-success-outline-focus-ring": "var(--color-button-success-outline-focus-ring)",
        "button-ghost-text": "var(--color-button-ghost-text)",
        "button-ghost-hover-text": "var(--color-button-ghost-hover-text)",
        "button-ghost-hover-background": "var(--color-button-ghost-hover-background)",
        primary: {
          DEFAULT: "var(--accent)",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "var(--surface-hover)",
          foreground: "var(--text)",
        },
        destructive: {
          DEFAULT: "var(--danger)",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "var(--surface-hover)",
          foreground: "var(--text-secondary)",
        },
        accent: {
          DEFAULT: "var(--surface-hover)",
          foreground: "var(--text)",
        },
        popover: {
          DEFAULT: "var(--surface)",
          foreground: "var(--text)",
        },
        card: {
          DEFAULT: "var(--surface)",
          foreground: "var(--text)",
        },
      },
      borderRadius: {
        lg: "var(--radius-lg)",
        md: "var(--radius)",
        sm: "calc(var(--radius) - 2px)",
      },
      ringWidth: {
        3: "3px",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [animate],
};

export default config;
