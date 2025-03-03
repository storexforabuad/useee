import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        'card-background': "var(--card-background)",
        'card-hover': "var(--card-hover)",
        'border-color': "var(--border-color)",
        'text-primary': "var(--text-primary)",
        'text-secondary': "var(--text-secondary)",
        'navbar-bg': "var(--navbar-bg)",
        'input-background': "var(--input-background)",
        'input-border': "var(--input-border)",
        'button-secondary': "var(--button-secondary)",
      },
      keyframes: {
        pulseCart: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' },
        },
      },
      animation: {
        pulseCart: 'pulseCart 0.5s ease-in-out',
      },
    },
  },
  plugins: [],
} satisfies Config;