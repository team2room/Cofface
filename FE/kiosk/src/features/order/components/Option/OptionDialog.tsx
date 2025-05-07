import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog'
import { Minus, Plus } from 'lucide-react'
import { useState } from 'react'
import tw from 'twin.macro'
import styled from '@emotion/styled'
import { Text } from '@/styles/typography'
import CustomButton from '@/components/CustomButton'

const CntButton = tw.button`border border-dark p-2 shadow-md`

interface OptionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const TempButton = styled.button<{ selected: boolean }>`
  ${tw`px-4 py-2 rounded-md border text-sm`}
  ${({ selected }) =>
    selected ? tw`border-main text-main bg-white` : tw`bg-gray text-gray`}
`

const SizeButton = styled.button<{ selected: boolean }>`
  ${tw`px-4 py-2 rounded-md border text-sm`}
  ${({ selected }) =>
    selected ? tw`bg-pink-500 text-white` : tw`bg-gray text-gray`}
`

const ExtraOptionButton = tw.button`
  bg-white border px-3 py-2 rounded-md text-sm text-gray
`

export default function OptionModal({ open, onOpenChange }: OptionModalProps) {
  const [temp, setTemp] = useState<'hot' | 'iced'>('iced')
  const [size, setSize] = useState<'small' | 'medium' | 'large'>('medium')

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <Text variant="title4" weight="extrabold" className="text-center">
          옵션을 선택해 주세요
        </Text>

        {/* 상품 정보 & 옵션 선택 */}
        <div className="bg-lightLight p-8">
          <div className="flex flex-row items-center gap-6">
            <img src="https://picsum.photos/200" alt="menu" className="w-80" />
            <div className="flex-1 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <Text variant="body2" weight="bold">
                  수량
                </Text>
                <div className="flex items-center gap-2">
                  <CntButton onClick={() => {}}>
                    <Minus size={16} className="text-dark" />
                  </CntButton>
                  <Text variant="caption1" weight="semibold" className="px-2">
                    1
                  </Text>
                  <CntButton onClick={() => {}}>
                    <Plus size={16} className="text-dark" />
                  </CntButton>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Text variant="body2" weight="bold">
                  HOT/ICED
                </Text>
                <div tw="flex gap-2">
                  <TempButton
                    selected={temp === 'hot'}
                    onClick={() => setTemp('hot')}
                  >
                    뜨겁게
                  </TempButton>
                  <TempButton
                    selected={temp === 'iced'}
                    onClick={() => setTemp('iced')}
                  >
                    차갑게
                  </TempButton>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Text variant="body2" weight="bold">
                  사이즈
                </Text>
                <div tw="flex gap-2">
                  {(['small', 'medium', 'large'] as const).map((sz) => (
                    <SizeButton
                      key={sz}
                      selected={size === sz}
                      onClick={() => setSize(sz)}
                    >
                      {sz === 'small'
                        ? '작은'
                        : sz === 'medium'
                          ? '중간'
                          : '큰'}
                    </SizeButton>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start">
            <Text variant="body1" weight="bold">
              디카페인 카페모카
            </Text>
            <Text variant="body2" weight="bold" color="darkGray">
              4,500원
            </Text>
            <Text variant="caption1" weight="bold" color="littleDarkGray">
              초코를 만나 풍부해진 디카페인 에스프레소와 고소한 우유, 부드러운
              휘핑크림까지 더해 달콤하게 즐기는 커피
            </Text>
          </div>
        </div>

        {/* 추가 옵션 */}
        <div>
          <Text variant="body2" weight="bold">
            추가 옵션
          </Text>
          <div className="bg-littleGray grid grid-cols-3 gap-3">
            {['적게', '보통', '많이'].map((level) => (
              <ExtraOptionButton key={level}>
                얼음 양 {level} +0원
              </ExtraOptionButton>
            ))}
          </div>
        </div>

        {/* 금액 */}
        <div className="border-y-2 border-dark p-3 flex flex-row justify-between">
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
              5,500
            </Text>
            <Text variant="body1" weight="semibold">
              원
            </Text>
          </div>
        </div>

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
