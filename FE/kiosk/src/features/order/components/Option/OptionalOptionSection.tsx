import { Text } from '@/styles/typography'
import tw from 'twin.macro'
import { OptionButton } from './OptionButton'
import { MenuOption } from '@/interfaces/OrderInterface'
import { useDragScroll } from '@/hooks/useDragScroll'

const OptionalOption = tw.div`bg-littleGray px-8 h-[350px] overflow-auto`
const OptionRow = tw.div`flex items-center`

interface Props {
  optionalOptions: MenuOption[]
  selectedOptions: Record<string, number | null>
  handleSelectOption: (category: string, index: number) => void
}

export default function OptionalOptionsSection({
  optionalOptions,
  selectedOptions,
  handleSelectOption,
}: Props) {
  const {
    ref: scrollRef,
    onMouseDown,
    onMouseMove,
    onMouseUp,
  } = useDragScroll<HTMLDivElement>()

  return (
    <>
      {optionalOptions.length > 0 && (
        <OptionalOption
          ref={scrollRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        >
          {optionalOptions.map((option) => (
            <OptionRow key={option.optionCategory} className="my-8">
              <Text variant="body2" weight="semibold" className="w-1/5">
                {option.optionCategory}
              </Text>
              <div className="flex gap-4">
                {option.optionNames.map((name, idx) => (
                  <OptionButton
                    key={option.optionIds[idx]}
                    selected={selectedOptions[option.optionCategory] === idx}
                    category={option.optionCategory}
                    value={name}
                    onClick={() =>
                      handleSelectOption(option.optionCategory, idx)
                    }
                  >
                    <div className="flex flex-col m-4">
                      <Text
                        variant="caption1"
                        weight="semibold"
                        className="text-start"
                      >
                        {name}
                      </Text>
                      <Text
                        variant="caption2"
                        weight="semibold"
                        className="text-end"
                      >
                        {`+${option.additionalPrices[idx]}원`}
                      </Text>
                    </div>
                  </OptionButton>
                ))}
              </div>
            </OptionRow>
          ))}
        </OptionalOption>
      )}
    </>
  )
}
