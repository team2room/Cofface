import tw from 'twin.macro'
import styled from '@emotion/styled'
import { colors, ColorName } from './colors'

export const typography = {
  title1: {
    normal: tw`font-normal text-[64px]`,
    medium: tw`font-medium text-[64px]`,
    semibold: tw`font-semibold text-[64px]`,
    bold: tw`font-bold text-[64px]`,
    extrabold: tw`font-extrabold text-[64px]`,
    heavy: tw`font-black text-[64px]`,
  },
  title2: {
    normal: tw`font-normal text-[54px]`,
    medium: tw`font-medium text-[54px]`,
    semibold: tw`font-semibold text-[54px]`,
    bold: tw`font-bold text-[54px]`,
    extrabold: tw`font-extrabold text-[54px]`,
    heavy: tw`font-black text-[54px]`,
  },
  title3: {
    normal: tw`font-normal text-5xl`,
    medium: tw`font-medium text-5xl`,
    semibold: tw`font-semibold text-5xl`,
    bold: tw`font-bold text-5xl`,
    extrabold: tw`font-extrabold text-5xl`,
    heavy: tw`font-black text-5xl`,
  },
  title4: {
    normal: tw`font-normal text-[40px]`,
    medium: tw`font-medium text-[40px]`,
    semibold: tw`font-semibold text-[40px]`,
    bold: tw`font-bold text-[40px]`,
    extrabold: tw`font-extrabold text-[40px]`,
    heavy: tw`font-black text-[40px]`,
  },
  body1: {
    normal: tw`font-normal text-4xl`,
    medium: tw`font-medium text-4xl`,
    semibold: tw`font-semibold text-4xl`,
    bold: tw`font-bold text-4xl`,
    extrabold: tw`font-extrabold text-4xl`,
    heavy: tw`font-black text-4xl`,
  },
  body2: {
    normal: tw`font-normal text-[32px]`,
    medium: tw`font-medium text-[32px]`,
    semibold: tw`font-semibold text-[32px]`,
    bold: tw`font-bold text-[32px]`,
    extrabold: tw`font-extrabold text-[32px]`,
    heavy: tw`font-black text-[32px]`,
  },
  body3: {
    normal: tw`font-normal text-3xl`,
    medium: tw`font-medium text-3xl`,
    semibold: tw`font-semibold text-3xl`,
    bold: tw`font-bold text-3xl`,
    extrabold: tw`font-extrabold text-3xl`,
    heavy: tw`font-black text-3xl`,
  },
  body4: {
    normal: tw`font-normal text-[26px]`,
    medium: tw`font-medium text-[26px]`,
    semibold: tw`font-semibold text-[26px]`,
    bold: tw`font-bold text-[26px]`,
    extrabold: tw`font-extrabold text-[26px]`,
    heavy: tw`font-black text-[26px]`,
  },
  caption1: {
    normal: tw`font-normal text-2xl`,
    medium: tw`font-medium text-2xl`,
    semibold: tw`font-semibold text-2xl`,
    bold: tw`font-bold text-2xl`,
    extrabold: tw`font-extrabold text-2xl`,
    heavy: tw`font-black text-2xl`,
  },
  caption2: {
    normal: tw`font-normal text-xl`,
    medium: tw`font-medium text-xl`,
    semibold: tw`font-semibold text-xl`,
    bold: tw`font-bold text-xl`,
    extrabold: tw`font-extrabold text-xl`,
    heavy: tw`font-black text-xl`,
  },
}

export const Text = styled.span<{
  variant?: keyof typeof typography
  weight?: keyof (typeof typography)[keyof typeof typography]
  color?: ColorName
  fontFamily?: 'Suit' | 'Suite'
  tw?: string
}>`
  ${({ variant = 'body1', weight = 'normal' }) => typography[variant][weight]}
  ${({ color }) => color && `color: ${colors[color]};`}
  ${({ fontFamily = 'Suit' }) => fontFamily && `font-family: ${fontFamily};`}
  ${({ tw }) => tw && tw}
`
