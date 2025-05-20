export const colors = {
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
  darkModal: 'rgba(0, 0, 0, 0.9)',

  // button
  default: '#E0115F',
  hover: '#FF2175',
  cancle: '#FAD4E3',
  disabled: '#FEE0EC',
  pressed: '#CB1257',
} as const

export type ColorName = keyof typeof colors
