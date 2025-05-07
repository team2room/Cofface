import { Minus, Plus } from 'lucide-react'
import { Text } from '@/styles/typography'
import tw from 'twin.macro'
import { OptionButton } from './OptionButton'
import { MenuOption } from '@/interfaces/OrderInterface'

const OptionGroup = tw.div`flex flex-1 gap-4 justify-center`
const OptionRow = tw.div`flex items-center`
const RequiredOption = tw.div`flex-1 flex flex-col gap-10`
const CntButton = tw.button`border border-dark p-2 shadow-md`

interface Props {
  requiredOptions: MenuOption[]
  selectedOptions: Record<string, number | null>
  handleSelectOption: (category: string, index: number) => void
}

export default function RequiredOptionsSection({
  requiredOptions,
  selectedOptions,
  handleSelectOption,
}: Props) {
  return (
    <RequiredOption>
      {/* 수량 */}
      <OptionRow>
        <Text variant="body2" weight="bold" className="w-44">
          수량
        </Text>
        <OptionGroup>
          <CntButton onClick={() => {}}>
            <Minus size={16} className="text-dark" />
          </CntButton>
          <Text variant="caption1" weight="semibold" className="px-2">
            1
          </Text>
          <CntButton onClick={() => {}}>
            <Plus size={16} className="text-dark" />
          </CntButton>
        </OptionGroup>
      </OptionRow>

      {/* 필수 옵션 */}
      {requiredOptions.map((option) => (
        <OptionRow key={option.optionCategory}>
          <Text variant="body2" weight="bold" className="w-44">
            {option.optionCategory}
          </Text>
          <OptionGroup>
            {option.optionNames.map((name, idx) => (
              <OptionButton
                key={option.optionIds[idx]}
                selected={selectedOptions[option.optionCategory] === idx}
                category={option.optionCategory}
                value={name}
                onClick={() => handleSelectOption(option.optionCategory, idx)}
              >
                <div className="flex flex-col items-center">
                  <Text variant="caption1" weight="bold">
                    {name}
                  </Text>
                  <Text variant="caption2" weight="normal">
                    {`+${option.additionalPrices[idx]}원`}
                  </Text>
                </div>
              </OptionButton>
            ))}
          </OptionGroup>
        </OptionRow>
      ))}
    </RequiredOption>
  )
}
