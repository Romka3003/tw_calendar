import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "vas3k-bg": "var(--vas3k-bg)",
        "vas3k-text": "var(--vas3k-text)",
        "vas3k-text-bright": "var(--vas3k-text-bright)",
        "vas3k-block": "var(--vas3k-block-bg)",
        "vas3k-input": "var(--vas3k-input-bg)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Helvetica", "Verdana", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "Times", "serif"],
      },
      borderRadius: {
        vas3k: "var(--vas3k-border-radius)",
      },
      boxShadow: {
        vas3k: "var(--vas3k-block-shadow)",
      },
    },
  },
  plugins: [],
};
export default config;
