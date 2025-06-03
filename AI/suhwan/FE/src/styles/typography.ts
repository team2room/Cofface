import tw from 'twin.macro'
import styled from '@emotion/styled'
import { colors, ColorName } from './colors'

export const typography = {
  logo1: {
    regular: tw`font-normal text-5xl`, // 48px
    medium: tw`font-medium text-5xl`, // 48px
    semibold: tw`font-semibold text-5xl`, // 48px
    bold: tw`font-bold text-5xl`, // 48px
    heavy: tw`font-black text-5xl`, // 48px
  },
  logo2: {
    regular: tw`font-normal text-4xl`, // 36px
    medium: tw`font-medium text-4xl`, // 36px
    semibold: tw`font-semibold text-4xl`, // 36px
    bold: tw`font-bold text-4xl`, // 36px
    heavy: tw`font-black text-4xl leading-[2.75rem]`, // 36px
  },
  body1: {
    regular: tw`font-normal text-base`, // 16px
    medium: tw`font-medium text-base`, // 16px
    semibold: tw`font-semibold text-base`, // 16px
    bold: tw`font-bold text-base`, // 16px
    heavy: tw`font-black text-base`, // 16px
  },
  body2: {
    regular: tw`font-normal text-lg`, // 18px
    medium: tw`font-medium text-lg`, // 18px
    semibold: tw`font-semibold text-lg`, // 18px
    bold: tw`font-bold text-lg`, // 18px
    heavy: tw`font-black text-lg`, // 18px
  },
  title1: {
    regular: tw`font-normal text-3xl`, // 30px
    medium: tw`font-medium text-3xl`, // 30px
    semibold: tw`font-semibold text-3xl`, // 30px
    bold: tw`font-bold text-3xl`, // 30px
    heavy: tw`font-black text-3xl`, // 30px
  },
  title2: {
    regular: tw`font-normal text-2xl`, // 24px
    medium: tw`font-medium text-2xl`, // 24px
    semibold: tw`font-semibold text-2xl`, // 24px
    bold: tw`font-bold text-2xl`, // 24px
    heavy: tw`font-black text-2xl`, // 24px
  },
  title3: {
    regular: tw`font-normal text-xl`, // 20px
    medium: tw`font-medium text-xl`, // 20px
    semibold: tw`font-semibold text-xl`, // 20px
    bold: tw`font-bold text-xl`, // 20px
    heavy: tw`font-black text-xl`, // 20px
  },
  caption1: {
    regular: tw`font-normal text-sm`, // 14px
    medium: tw`font-medium text-sm`, // 14px
    semibold: tw`font-semibold text-sm`, // 14px
    bold: tw`font-bold text-sm`, // 14px
    heavy: tw`font-black text-sm`, // 14px
  },
  caption2: {
    regular: tw`font-normal text-xs`, // 12px
    medium: tw`font-medium text-xs`, // 12px
    semibold: tw`font-semibold text-xs`, // 12px
    bold: tw`font-bold text-xs`, // 12px
    heavy: tw`font-black text-xs`, // 12px
  },
  caption3: {
    regular: tw`font-normal text-[10px]`, // 10px
    medium: tw`font-medium text-[10px]`, // 10px
    semibold: tw`font-semibold text-[10px]`, // 10px
    bold: tw`font-bold text-[10px]`, // 10px
    heavy: tw`font-black text-[10px]`, // 10px
  },
}

export const Text = styled.span<{
  variant?: keyof typeof typography
  weight?: 'regular' | 'medium' | 'semibold' | 'bold' | 'heavy'
  color?: ColorName
  tw?: string
  fontFamily?: 'Suit' | 'Suite'
}>`
  ${({ variant = 'body1', weight = 'medium' }) => typography[variant][weight]}
  ${({ color }) => color && `color: ${colors[color]};`}
  ${({ fontFamily = 'Suit' }) => fontFamily && `font-family: ${fontFamily};`}
  ${({ tw }) => tw && tw}
`
