/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        dada: {
          950: '#070d1e',
          900: '#0a1435',
          800: '#0f2257',
          700: '#18347f',
          600: '#1e40af',
          500: '#2563eb',
          400: '#3b82f6',
          100: '#dbeafe',
          50: '#eff6ff',
        },
        emerald: {
          900: '#064e3b',
          800: '#065f46',
          700: '#047857',
          600: '#059669',
          500: '#10b981',
          400: '#34d399',
          100: '#d1fae5',
          50: '#ecfdf5',
        },
        amber: {
          900: '#78350f',
          800: '#92400e',
          700: '#b45309',
          600: '#d97706',
          500: '#f59e0b',
          100: '#fef3c7',
          50: '#fffbeb',
        },
      },
    },
  },
  plugins: [],
};
