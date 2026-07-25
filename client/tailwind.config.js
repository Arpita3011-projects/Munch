/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          pink: '#FF2D87',
          'pink-dark': '#E0176B',
          charcoal: '#1F1B24',
          cream: '#FFF8F0',
          'cream-2': '#FFEFDD',
        },
        accent: {
          rainbow: [
            '#FF3B5C',
            '#FF9F40',
            '#FFD93B',
            '#6BCB77',
            '#4D96FF',
            '#9B5DE5',
          ],
        },
        success: '#2FAE6B',
        warning: '#F5A623',
        error: '#E5484D',
      },
      fontFamily: {
        display: ['"Baloo 2"', 'Fredoka', 'Poppins', 'sans-serif'],
        body: ['Inter', 'Manrope', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
      },
      boxShadow: {
        warm: '0 8px 24px -8px rgba(31, 27, 36, 0.15)',
        'warm-lg': '0 16px 48px -12px rgba(31, 27, 36, 0.2)',
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-out',
        'slide-up': 'slideUp 250ms ease-out',
        'scale-in': 'scaleIn 150ms ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};

