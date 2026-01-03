/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'warm-beige': '#F9F6F0', // Slightly warmer/lighter than before
        'paper': '#F5F2EA',
        'ink': '#1A1A1A',
        'ink-light': '#4A4A4A',
        'gold': '#C8A951',
        'deep-blue': '#0F172A', // Slate 900-ish, deep navy
        'muted-gold': '#D4AF37', // Classic metallic gold
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['"SF Pro Display"', '"Inter"', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      },
    },
  },
  plugins: [],
}
