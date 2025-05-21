import React from 'react'
import tw from 'twin.macro'
import { Text } from '@/styles/typography'
import { AnimationType } from '../../hooks/useSlideAnimation'
import { AnimatedContainer } from './AnimatedContainer'

const OptionBtn = tw.div`bg-white rounded-full shadow-md w-[175px] h-[175px] flex flex-col items-center justify-center`

interface OptionButtonProps {
  icon: React.ReactNode
  label: string
  onClick?: () => void
}

export function OptionButton({ icon, label, onClick }: OptionButtonProps) {
  return (
    <OptionBtn onClick={onClick} className="group">
      <div className="flex flex-col items-center">
        {typeof icon === 'string' ? (
          <img
            src={icon}
            alt={label}
            className="w-[80px] mb-2 group-hover:scale-105 transition-all"
          />
        ) : (
          icon
        )}
        <Text variant="body2" weight="semibold" fontFamily="Suite">
          {label}
        </Text>
      </div>
    </OptionBtn>
  )
}

export const iconMap: Record<string, Record<string, string>> = {
  'HOT/ICED': {
    차갑게: '/icons/icon-cold-on.png',
    뜨겁게: '/icons/icon-hot-on.png',
  },
  사이즈: {
    작은: '/icons/icon-small-on.png',
    중간: '/icons/icon-medium-on.png',
    큰: '/icons/icon-large-on.png',
  },
  얼음: {
    없음: '/icons/icon-nope-off.png',
    적게: '/icons/icon-ice1-on.png',
    보통: '/icons/icon-ice2-on.png',
    많이: '/icons/icon-ice3-on.png',
  },
  '샷 추가': {
    없음: '/icons/icon-nope-off.png',
    '1샷': '/icons/icon-shot1-on.png',
    '2샷': '/icons/icon-shot2-on.png',
    '3샷': '/icons/icon-shot3-on.png',
  },
}

export const labelMap: Record<string, string> = {
  'HOT/ICED': '온도',
  사이즈: '사이즈',
  얼음: '얼음 양',
  '샷 추가': '샷 추가',
}

interface OptionProps {
  menuId: number
  options: Array<{
    optionCategory: string
    optionNames: string[]
    isDefault: boolean[]
  }>
  animationType: AnimationType
  onOptionSelect?: (category: string, index: number) => void
}

export function OptionList({
  options,
  animationType,
  onOptionSelect,
}: OptionProps) {
  const handleOptionClick = (category: string) => {
    if (!onOptionSelect) return

    const option = options.find((opt) => opt.optionCategory === category)
    if (!option) return

    const currentIndex = option.isDefault.findIndex((v) => v === true)

    const nextIndex = (currentIndex + 1) % option.optionNames.length

    onOptionSelect(category, nextIndex)
  }

  return (
    <AnimatedContainer
      className="space-y-4 mt-12"
      animationType={animationType}
    >
      {options.map((option) => {
        const { optionCategory, optionNames, isDefault } = option
        const defaultIndex = isDefault.findIndex((v) => v === true)
        const defaultOptionName = optionNames[defaultIndex]

        const iconPath =
          iconMap[optionCategory]?.[defaultOptionName] || '/icons/default.png'

        const label = labelMap[optionCategory] || optionCategory

        return (
          <OptionButton
            key={`${optionCategory}-${defaultOptionName}-${defaultIndex}`}
            icon={iconPath}
            label={label}
            onClick={() => handleOptionClick(optionCategory)}
          />
        )
      })}
    </AnimatedContainer>
  )
}
