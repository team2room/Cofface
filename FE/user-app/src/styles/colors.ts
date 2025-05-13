export const colors = {
  main: '#E0115F',
  littleLight: '#FEE0EC',
  littleDark: '#CB1257',
  dark: '#AD124D',
  white: '#FFFFFF',
  black: '#000000',
  modal: 'rgba(0, 0, 0, 0.7)',
  littleGray: '#F4F4F4',
  gray: '#D9D9D9',
  littleDarkGray: '#B7B7B7',
  darkGray: '#6D6D6D',
  light: '#FFF0F6',
  lightLight: '#FFF7FA',
  lightBlack: '#434343',
  lightModal: 'rgba(0, 0, 0, 0.3)',
  darkDark: '#772745',
  hover: 'FF2175',
} as const

export type ColorName = keyof typeof colors
