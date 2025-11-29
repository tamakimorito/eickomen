/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{ts,tsx,html}",
    "!./node_modules/**/*",
  ],
  theme: { extend: {} },
  plugins: [],
};
