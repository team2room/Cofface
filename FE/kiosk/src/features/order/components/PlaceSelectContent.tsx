import tw from 'twin.macro'
import { Text } from '@/styles/typography'
import { usePayStore } from '@/stores/payStore'
import { useStepStore } from '@/stores/stepStore'
import { useUserStore } from '@/stores/loginStore'
import { useNavigate } from 'react-router-dom'
import ProgressContent from './pay/ProgressContent'
import { useEffect, useState } from 'react'
import { useDirectOrderStore } from '@/stores/directOrderStore'
import { changeDisplayType } from '@/lib/changeDisplay'

const Content = tw.div`flex flex-col items-center justify-center flex-1 gap-12 px-7`
const ImageButton = tw.button`
  w-[716px] h-[446px] rounded-[20px] bg-white shadow-[1px_3px_15px_5px_rgba(0,0,0,0.25)]
  flex flex-col items-center justify-center gap-3 
  hover:scale-105 transition-transform duration-200
`
const EmojiImage = tw.img`w-[328px] h-[328px]`

export default function PlaceSelectContent() {
  const navigate = useNavigate()
  const [showProgress, setShowProgress] = useState(false)
  const { originStep, setStep } = useStepStore()
  const payStore = usePayStore()
  const { isMember, loginMethod, hasAutoPayment, guestInfo, weather } =
    useUserStore()
  const directOrder = useDirectOrderStore((state) => state.directOrder)

  useEffect(() => {
    if (originStep === 'main') {
      const totalPrice = directOrder
        ? directOrder.totalPrice * directOrder.quantity
        : 0

      const menuOrder = directOrder
        ? [
            {
              menuId: directOrder.menuId,
              quantity: directOrder.quantity,
              options: directOrder.options.map((opt) => ({
                optionItemId: opt.optionId,
                quantity: 1,
              })),
            },
          ]
        : []

      payStore.setInitialPayData({
        kioskId: 1,
        totalAmount: totalPrice,
        menuOrders: menuOrder,
        age: guestInfo?.age ?? 0,
        gender: guestInfo?.gender ?? '여성',
        weather: weather?.dominant ?? '맑음',
      })
    }
  }, [])

  const handleSelect = (isTakeout: boolean) => {
    payStore.setIsTakeout(isTakeout)

    console.log('hasAutoPayment', hasAutoPayment)
    console.log('isMember', isMember)

    if (originStep === 'menu') {
      setStep('pay')
    } else if (originStep === 'main') {
      if (isMember && hasAutoPayment && loginMethod === 'face') {
        // 슬라이드 자동 결제
        changeDisplayType('pay')
          .then((data) => console.log('성공:', data))
          .catch((error) => console.error('실패:', error))
        setShowProgress(true)
      } else {
        // toss 결제
        navigate('/pay')
      }
    }
  }

  return (
    <>
      {/* 자동 주문 일시 자동 결제 화면 표시 */}
      {showProgress && <ProgressContent />}
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
    </>
  )
}
