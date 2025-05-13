import styled from '@emotion/styled'
import tw from 'twin.macro'

export const OptionButton = styled.button<{
  selected: boolean
  category: string
  value: string
}>`
  ${tw`w-[88px] h-[88px] rounded-3xl shadow-md`}
  ${({ selected, category, value }) => {
    if (category === 'HOT/ICED') {
      return selected
        ? value === 'HOT' || value === '뜨거운'
          ? tw`bg-red-500 text-white`
          : tw`bg-blue-500 text-white`
        : tw`bg-littleGray text-darkGray`
    }
    if (category === '사이즈' || category.toLowerCase().includes('size')) {
      return selected
        ? tw`bg-[#F44B9A] text-white`
        : tw`bg-littleGray text-darkGray`
    }
    return selected
      ? tw`w-36 h-24 rounded-xl bg-[#FFF2F6] border-2 border-littleDark`
      : tw`w-36 h-24 rounded-xl bg-white text-darkGray`
  }}
`
