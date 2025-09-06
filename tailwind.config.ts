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
      animation: {
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        pulseCart: 'pulseCart 0.5s ease-in-out',
        'fade-in': 'fadeIn 0.5s ease-out',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.5' },
        },
        pulseCart: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
        },
        fadeIn: {
          '0%': { 
            opacity: '0',
            transform: 'translateY(10px)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;