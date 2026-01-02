/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'crash-green': '#10b981',
        'crash-red': '#ef4444',
        'crash-bg': '#0f172a',
        'crash-card': '#1e293b',
      },
    },
  },
  plugins: [],
}
