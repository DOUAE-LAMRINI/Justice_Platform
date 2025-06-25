module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#003049', // Deep blue
        primaryLight: '#013a63',
        secondary: '#780000', // Deep red
        secondaryLight: '#640d14',
        light: '#f8f9fa',
        dark: '#212529'
      },
      fontFamily: {
        'noto-sans-arabic': ['Noto Sans Arabic', 'sans-serif'],
      },
      animation: {
        fadeIn: 'fadeIn 1.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}