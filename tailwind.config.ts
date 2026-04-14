import type { Config } from "tailwindcss";

const config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        terminal: {
          bg: "#050505",
          surface: "#0f0f0f",
          border: "#262626",
          text: "#ffffff",
          muted: "#a1a1aa",
          success: "#10b981",
          danger: "#ef4444",
        },
      },
    },
  },
} satisfies Config;

export default config;
