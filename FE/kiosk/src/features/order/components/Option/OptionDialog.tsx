import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog'
import { useEffect, useMemo, useState } from 'react'
import tw from 'twin.macro'
import { Text } from '@/styles/typography'
import CustomButton from '@/components/CustomButton'
import { OptionModalProps } from '@/interfaces/OrderInterface'
import RequiredOptionsSection from './RequiredOptionSection'
import OptionalOptionsSection from './OptionalOptionSection'
import { useOrderStore } from '@/stores/orderStore'
import { Minus, Plus } from 'lucide-react'

const FirstSection = tw.div`bg-lightLight p-8 mb-4`
const InfoText = tw.div`flex flex-col items-start`
const DefaultButton = tw.button`w-80 border border-main rounded-xl py-1 mx-auto shadow-md`
const PriceRow = tw.div`border-y-2 border-dark p-3 flex justify-between my-6`

const OptionGroup = tw.div`flex flex-1 gap-4 justify-center`
const OptionRow = tw.div`flex items-center`
const RequiredOption = tw.div`flex-1 flex flex-col gap-10`
const CntButton = tw.button`border border-dark p-2 shadow-md`

export default function OptionModal({
  open,
  onOpenChange,
  menu,
}: OptionModalProps) {
  const addOrder = useOrderStore((state) => state.addOrder)

  const requiredOptions = menu.options.filter((opt) => opt.isRequired)
  const optionalOptions = menu.options.filter((opt) => !opt.isRequired)

  const [quantity, setQuantity] = useState(1)
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, number | null>
  >({})

  const handleSelectOption = (category: string, index: number) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [category]: prev[category] === index ? null : index,
    }))
  }

  // 필수 선택 옵션 확인
  const isAllRequiredSelected = useMemo(() => {
    return requiredOptions.every(
      (opt) =>
        selectedOptions.hasOwnProperty(opt.optionCategory) &&
        selectedOptions[opt.optionCategory] !== null,
    )
  }, [selectedOptions, requiredOptions])

  // 기본값 선택 버튼 함수
  const handleSetDefaults = () => {
    const defaults: Record<string, number | null> = {}
    menu.options.forEach((opt) => {
      const defaultIndex = opt.isDefault.findIndex((d) => d)
      defaults[opt.optionCategory] = defaultIndex >= 0 ? defaultIndex : null
    })
    setSelectedOptions(defaults)
  }

  // 선택된 옵션 저장
  const selectedOptionDetails = useMemo(() => {
    return Object.entries(selectedOptions).flatMap(([category, index]) => {
      if (index === null) return []
      const optionGroup = menu.options.find(
        (o) => o.optionCategory === category,
      )
      if (!optionGroup) return []
      return [
        {
          category,
          value: optionGroup.optionNames[index],
          price: optionGroup.additionalPrices[index],
          optionId: optionGroup.optionIds[index],
        },
      ]
    })
  }, [selectedOptions, menu.options])

  const totalOptionPrice = selectedOptionDetails.reduce(
    (sum, opt) => sum + opt.price,
    0,
  )
  const totalPrice = menu.price + totalOptionPrice

  const handleQuantityChange = (change: number) => {
    setQuantity((prev) => Math.max(1, prev + change))
  }

  const handleConfirm = () => {
    addOrder({
      menuId: menu.menuId,
      name: menu.menuName,
      basePrice: menu.price,
      quantity,
      options: selectedOptionDetails,
      totalPrice: totalPrice,
    })
    onOpenChange(false)
  }

  // 모달 닫힐 때 상태 초기화
  useEffect(() => {
    if (!open) {
      setQuantity(1)
      setSelectedOptions({})
    }
  }, [open])

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
            <RequiredOption>
              {/* 수량 */}
              <OptionRow>
                <Text variant="body2" weight="bold" className="w-44">
                  수량
                </Text>
                <OptionGroup>
                  <CntButton onClick={() => handleQuantityChange(-1)}>
                    <Minus size={16} className="text-dark" />
                  </CntButton>
                  <Text variant="caption1" weight="semibold" className="px-2">
                    {quantity}
                  </Text>
                  <CntButton onClick={() => handleQuantityChange(1)}>
                    <Plus size={16} className="text-dark" />
                  </CntButton>
                </OptionGroup>
              </OptionRow>

              <RequiredOptionsSection
                requiredOptions={requiredOptions}
                selectedOptions={selectedOptions}
                handleSelectOption={handleSelectOption}
              />
            </RequiredOption>
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
              {(totalPrice * quantity).toLocaleString()}
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
            variant={isAllRequiredSelected ? 'main' : 'disabled'}
            onClick={handleConfirm}
          />
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
