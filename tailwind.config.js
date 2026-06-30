/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      colors: {
        carbon: '#050505',
        panel: '#101010',
        panelSoft: '#171717',
        line: '#272727',
        fuel: '#f97316'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'SFMono-Regular', 'ui-monospace', 'monospace']
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(249, 115, 22, 0.22), 0 20px 80px rgba(0, 0, 0, 0.35)'
      }
    }
  },
  plugins: []
}
