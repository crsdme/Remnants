/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/view/**/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      margin: {
        '15px': '15px',
      },
      colors: {
        neutral: {
          white: '#ffffff',
          black: '#262626',
          surfaceSubtle: '#f0eef0',
          border: {
            dark: '#504f50', // Corresponding to {Gray.700}
            default: '#9c9a9c', // Corresponding to {Gray.400}
            subtle: '#b7b5b7' // Corresponding to {Gray.300}
          },
          surface: {
            dark: '#d4d2d4', // Corresponding to {Gray.200}
            default: '#fffdff', // Corresponding to {Gray.50}
            subtle: '#f0eef0' // Corresponding to {Gray.100}
          },
          textIcon: {
            title: '#191819', // Corresponding to {Gray.950}
            text: '#6a686a', // Corresponding to {Gray.600}
            subtitle: '#818081', // Corresponding to {Gray.500}
            negative: '#fffdff', // Corresponding to {Gray.50}
            disabled: '#9c9a9c' // Corresponding to {Gray.400}
          }
        },
        primary: {
          50: '#ababab',
          100: '#9c9c9c',
          200: '#7f7f7f',
          300: '#616161',
          400: '#444444',
          500: '#262626',
          600: '#1e1e1e',
          700: '#171717',
          800: '#0f0f0f',
          900: '#080808',
          950: '#040404',
          border: {
            dark: '#171717',
            default: '#262626',
            light: '#616161',
            subtle: '#9c9c9c'
          },
          surface: {
            dark: '#171717',
            default: '#262626',
            light: '#616161',
            subtle: '#9c9c9c'
          },
          textIcon: {
            title: '#262626'
          }
        },
        red: {
          50: '#fdeeee',
          100: '#fbdddd',
          200: '#f7bcbc',
          300: '#f39a9a',
          400: '#ef7979',
          500: '#eb5757',
          600: '#c04646',
          700: '#963535',
          800: '#6c2525',
          900: '#411414',
          950: '#2c0b0b'
        },
        gray: {
          50: '#fffdff',
          100: '#f0eef0',
          200: '#d4d2d4',
          300: '#b7b5b7',
          400: '#9c9a9c',
          500: '#818081',
          600: '#6a686a',
          700: '#504f50',
          800: '#393839',
          900: '#212022',
          950: '#191819'
        },
        lightBlue: {
          100: '#ddf5fc',
          200: '#bbebfa',
          300: '#9ae0f7',
          400: '#78d6f5',
          500: '#56ccf2',
          600: '#45a8c8',
          700: '#34839d',
          800: '#245f73',
          900: '#133b48',
          950: '#0a2933'
        },
        blightBlue: {
          50: '#eefafe'
        },
        purple: {
          50: '#f5eefc',
          100: '#ebdcf9',
          200: '#d7b9f3',
          300: '#c397ec',
          400: '#af74e6',
          500: '#9b51e0',
          600: '#7d41b5',
          700: '#5f318a',
          800: '#41215e',
          900: '#231133',
          950: '#14091e'
        },
        blue: {
          50: '#eaf2fd',
          100: '#d5e6fb',
          200: '#acccf8',
          300: '#82b3f4',
          400: '#5999f1',
          500: '#2f80ed',
          600: '#2666be',
          700: '#1c4d8e',
          800: '#13335f',
          900: '#091a2f',
          950: '#050d18'
        },
        green: {
          50: '#d1efde',
          100: '#bee5cf',
          200: '#97d1b0',
          300: '#6fbe91',
          400: '#48aa72',
          500: '#219653',
          600: '#1a7842',
          700: '#145a32',
          800: '#0d3c21',
          900: '#071e11',
          950: '#030f08'
        },
        yellow: {
          50: '#fefaed',
          100: '#fcf4db',
          200: '#fae9b7',
          300: '#f7df94',
          400: '#f5d470',
          500: '#f2c94c',
          600: '#c6a43d',
          700: '#9a7f2e',
          800: '#6d5a20',
          900: '#413511',
          950: '#2b2209'
        },
        orange: {
          50: '#fef5ed',
          100: '#fcebdb',
          200: '#fad6b7',
          300: '#f7c292',
          400: '#f5ad6e',
          500: '#f2994a',
          600: '#c57c3b',
          700: '#99602d',
          800: '#6c431e',
          900: '#402710',
          950: '#291808'
        }
      }
    }
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  }
}

