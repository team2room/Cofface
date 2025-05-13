import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog'
import { useMemo, useState } from 'react'
import tw from 'twin.macro'
import { Text } from '@/styles/typography'
import CustomButton from '@/components/CustomButton'
import { OptionModalProps } from '@/interfaces/OrderInterface'
import RequiredOptionsSection from './RequiredOptionSection'
import OptionalOptionsSection from './OptionalOptionSection'

const FirstSection = tw.div`bg-lightLight p-8 mb-4`
const InfoText = tw.div`flex flex-col items-start`
const DefaultButton = tw.button`w-80 border border-main rounded-xl py-1 mx-auto shadow-md`
const PriceRow = tw.div`border-y-2 border-dark p-3 flex justify-between my-6`

export default function OptionModal({
  open,
  onOpenChange,
  menu,
}: OptionModalProps) {
  const requiredOptions = menu.options.filter((opt) => opt.isRequired)
  const optionalOptions = menu.options.filter((opt) => !opt.isRequired)

  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, number | null>
  >({})

  const handleSelectOption = (category: string, index: number) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [category]: prev[category] === index ? null : index,
    }))
  }

  const handleSetDefaults = () => {
    const defaults: Record<string, number | null> = {}
    menu.options.forEach((opt) => {
      const defaultIndex = opt.isDefault.findIndex((d) => d)
      defaults[opt.optionCategory] = defaultIndex >= 0 ? defaultIndex : null
    })
    setSelectedOptions(defaults)
  }

  const totalOptionPrice = useMemo(() => {
    return Object.entries(selectedOptions).reduce((sum, [category, index]) => {
      if (index === null) return sum
      const optionGroup = menu.options.find(
        (o) => o.optionCategory === category,
      )
      return optionGroup ? sum + optionGroup.additionalPrices[index] : sum
    }, 0)
  }, [selectedOptions, menu.options])

  const totalPrice = menu.price + totalOptionPrice

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-[95%]">
        <Text variant="title4" weight="extrabold" className="text-center my-4">
          옵션을 선택해 주세요
        </Text>

        {/* 상품 정보 & 필수 옵션 선택 */}
        <Text variant="body2" weight="bold">
          필수 옵션
        </Text>
        <FirstSection>
          <div className="flex flex-row items-center gap-6">
            <img src={menu.imageUrl} alt={menu.menuName} className="w-80" />
            <RequiredOptionsSection
              requiredOptions={requiredOptions}
              selectedOptions={selectedOptions}
              handleSelectOption={handleSelectOption}
            />
          </div>

          <InfoText>
            <Text variant="body1" weight="bold" className="mt-4">
              {menu.menuName}
            </Text>
            <Text
              variant="body2"
              weight="bold"
              color="darkGray"
              className="mb-6"
            >
              {menu.price.toLocaleString()}원
            </Text>
            <Text variant="caption1" weight="bold" color="littleDarkGray">
              {menu.description}
            </Text>
          </InfoText>
        </FirstSection>

        {/* 기본값 버튼 */}
        <DefaultButton onClick={handleSetDefaults}>
          <Text variant="body2" weight="bold" color="main">
            기본값으로 설정
          </Text>
        </DefaultButton>

        {/* 추가 옵션 */}
        <Text variant="body2" weight="bold">
          추가 옵션
        </Text>
        <OptionalOptionsSection
          optionalOptions={optionalOptions}
          selectedOptions={selectedOptions}
          handleSelectOption={handleSelectOption}
        />

        {/* 금액 */}
        <PriceRow>
          <div>
            <Text variant="body1" weight="semibold">
              총 금액
            </Text>
            <Text
              variant="caption1"
              weight="semibold"
              color="darkGray"
              className="ml-2"
            >
              (제품가격 + 옵션가격)
            </Text>
          </div>
          <div>
            <Text variant="body1" weight="bold" color="main">
              {totalPrice.toLocaleString()}
            </Text>
            <Text variant="body1" weight="semibold">
              원
            </Text>
          </div>
        </PriceRow>

        {/* 하단 버튼 */}
        <AlertDialogFooter className="h-20 flex gap-3 justify-center">
          <CustomButton
            text={'취소'}
            variant="cancle"
            onClick={() => onOpenChange(false)}
          />
          <CustomButton
            text={'선택 완료'}
            variant="main"
            onClick={() => onOpenChange(false)}
          />
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
