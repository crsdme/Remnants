/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{ts,tsx,js,jsx}',
    './components/**/*.{ts,tsx,js,jsx}',
    './app/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Helvetica Neue"', 'sans-serif'],
      },
      fontSize: {
        'sm': '16px',
        'base': '18px',
        'lg': '20px',
        'xl': '22px',
        '2xl': '24px',
        '3xl': '30px',
        '4xl': '36px',
        '5xl': '42px',
      },
      // colors: {
      //   'border': 'var(--color-border)',
      //   'background': 'var(--color-background)',
      //   'foreground': 'var(--color-foreground)',
      //   'primary': 'var(--color-primary)',
      //   'primary-foreground': 'var(--color-primary-foreground)',
      // },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
  darkMode: 'class',
}
