/* eslint-env node */
/** @type {import('tailwindcss/types').Config} */

const config = {
  content: ["./index.html", "./src/**/*.{vue,js,ts}"],
  theme: {
    extend: {},
  },
  plugins: [],
  darkMode: "class",
};

module.exports = config;
