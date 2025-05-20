/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      backgroundImage: {
        mainBgIce: "url('/mainBg-ice.png')",
        mainBgHot: "url('/mainBg-hot.png')",
      },
      animation: {
        ripple: 'ripple 0.5s ease-out',
      },
      keyframes: {
        ripple: {
          '0%': {
            transform: 'scale(0)',
            opacity: '0.7',
          },
          '100%': {
            transform: 'scale(2)',
            opacity: '0',
          },
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        suit: ['Suit'],
        suite: ['Suite'],
      },
      fontSize: {
        xs: '12px',
        sm: '14px',
        base: '16px',
        lg: '18px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '30px',
        '4xl': '36px',
        '5xl': '48px',
      },
      colors: {
        // text
        lightLight: '#FFF7FA',
        light: '#FFF0F6',
        littleLight: '#FEE0EC',
        main: '#E0115F',
        littleDark: '#CB1257',
        dark: '#AD124D',
        darkDark: '#772745',

        lightYellow: '#FFF8EC',
        lightOrange: '#FFF1EF',

        white: '#FFFFFF',
        littleGray: '#F4F4F4',
        gray: '#D9D9D9',
        littleDarkGray: '#B7B7B7',
        darkGray: '#6D6D6D',
        lightBlack: '#434343',
        black: '#000000',

        // background
        modal: 'rgba(0, 0, 0, 0.5)',
        lightModal: 'rgba(0, 0, 0, 0.3)',
        darkModal: 'rgba(0, 0, 0, 0.95)',

        // button
        default: '#E0115F',
        hover: '#FF2175',
        cancle: '#FAD4E3',
        disabled: '#FEE0EC',
        pressed: '#CB1257',
        // 기본
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
