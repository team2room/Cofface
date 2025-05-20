import tw from 'twin.macro'
import { Text } from '@/styles/typography'
import { usePayStore } from '@/stores/payStore'
import { useStepStore } from '@/stores/stepStore'
import { useUserStore } from '@/stores/loginStore'
import { useNavigate } from 'react-router-dom'
import ProgressContent from './pay/ProgressContent'
import { useState } from 'react'

const Content = tw.div`flex flex-col items-center justify-center flex-1 gap-12 px-7`
const ImageButton = tw.button`
  w-[716px] h-[446px] rounded-[20px] bg-white shadow-[1px_3px_15px_5px_rgba(0,0,0,0.25)]
  flex flex-col items-center justify-center gap-3 
  hover:scale-105 transition-transform duration-200
`
const EmojiImage = tw.img`w-[328px] h-[328px]`

export default function PlaceSelectContent() {
  const navigate = useNavigate()
  const { originStep, setStep } = useStepStore()
  const isMember = useUserStore((state) => state.isMember)
  const hasAutoPayment = useUserStore((state) => state.hasAutoPayment)
  const payStore = usePayStore()
  const showProgress = useState(false)

  const handleSelect = (isTakeout: boolean) => {
    payStore.setIsTakeout(isTakeout)

    console.log(hasAutoPayment)

    if (originStep === 'menu') {
      setStep('pay')
    } else if (originStep === 'main') {
      if (isMember && hasAutoPayment) {
        // 슬라이드 자동 결제
        
      } else {
        // toss 결제
        navigate('/pay')
      }
    }
  }

  return (
    <>
      <Content>
        <div className="my-20">
          <Text variant="title1" weight="extrabold" color="lightBlack">
            어디에서 드실건가요?
          </Text>
        </div>

        <div className="flex flex-col gap-20 mb-60">
          <ImageButton onClick={() => handleSelect(false)}>
            <EmojiImage src="/매장.png" alt="매장" />
            <Text variant="title4" weight="extrabold" color="lightBlack">
              매장에서 먹고가기
            </Text>
          </ImageButton>

          <ImageButton onClick={() => handleSelect(true)}>
            <EmojiImage src="/포장.png" alt="포장" />
            <Text variant="title4" weight="extrabold" color="lightBlack">
              포장하기
            </Text>
          </ImageButton>
        </div>
      </Content>

      {/* 자동 주문 일시 자동 결제 화면 표시 */}
      {isMember && hasAutoPayment && <ProgressContent />}
    </>
  )
}
