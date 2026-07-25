/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#080617',
        surface: '#251B4E',
        'surface-overlay': '#130F2A',
        primary: '#8B5CF6',
        secondary: '#3B82F6',
        'accent-warm': '#F59E0B',
        success: '#22C55E',
        danger: '#EF4444',
        'text-primary': '#FFFFFF',
        'text-secondary': '#E8E0FF',
        'text-muted': '#8B80B0',
      },
    },
  },
  plugins: [],
};
