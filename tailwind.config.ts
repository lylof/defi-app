import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Couleurs principales
        "primary": {
          DEFAULT: "#1E88E5",
          light: "#64B5F6",
          dark: "#0D47A1",
        },
        // Couleurs d'accent pour les domaines
        domain: {
          design: "#9C27B0",    // Violet
          dev: "#1E88E5",       // Bleu
          community: "#F44336", // Rouge
          devops: "#4CAF50",    // Vert
          ai: "#FFC107",        // Jaune
        },
        // Surfaces
        surface: {
          light: "#F5F7FA",
          DEFAULT: "#ECF0F5",
          dark: "#E3E8F0",
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
