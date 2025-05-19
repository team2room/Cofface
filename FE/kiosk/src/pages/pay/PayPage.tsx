import { Text } from '@/styles/typography'
import { useEffect, useRef, useState } from 'react'
import {
  loadPaymentWidget,
  PaymentWidgetInstance,
} from '@tosspayments/payment-widget-sdk'
import { useUserStore } from '@/stores/loginStore'
import { usePayStore } from '@/stores/payStore'
import { usePreparePay } from '@/features/order/hooks/pay/usePreparePay'
import { useClientKey } from '@/features/order/hooks/pay/useClientKey'
import tw from 'twin.macro'
// import { useLogout } from '@/features/userLogin/hooks/useLogout'
import { useNavigate } from 'react-router-dom'

const ImageWrapper = tw.div`w-full my-8 flex justify-center items-center`
const FullImg = tw.img`absolute top-0 left-0 w-full h-full object-cover`
const Content = tw.div`flex flex-col items-center justify-center flex-1 gap-8 z-10`

const customerKey = 'YbX2HuSlsC9uVJW6NMRMj'

export default function PayPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  // const { isMember } = useUserStore()
  const userName = useUserStore((state) => state.user?.name)
  const totalAmount = usePayStore((state) => state.totalAmount)
  const store = usePayStore.getState()
  // const { logout } = useLogout()

  const { clientKey } = useClientKey()
  const { preparePay } = usePreparePay()

  // 결제 위젯 렌더링
  const paymentWidgetRef = useRef<PaymentWidgetInstance | null>(null)
  useEffect(() => {
    const loadWidget = async () => {
      if (!clientKey) return
      try {
        const paymentWidget = await loadPaymentWidget(clientKey, customerKey)
        paymentWidget.renderPaymentMethods('#payment-widget', totalAmount ?? 0)
        paymentWidgetRef.current = paymentWidget
      } catch (err) {
        console.error('결제 위젯 로딩 실패:', err)
      }
    }

    loadWidget()
  }, [clientKey, customerKey, totalAmount])

  // 결제 요청
  const handlePayment = async () => {
    setLoading(true)
    const paymentWidget = paymentWidgetRef.current

    try {
      const prepareResult = await preparePay()

      if (!prepareResult?.orderId) {
        throw new Error('주문 번호가 없습니다.')
      }

      await paymentWidget?.requestPayment({
        orderId: prepareResult.orderId.toString(),
        orderName: `커피 주문 (${store?.menuOrders?.reduce((acc, cur) => acc + cur.quantity, 0)}건)`,
        customerName: userName || '고객',
        customerEmail: 'customer123@gmail.com',
        successUrl: `http://localhost:5173/pay/success`,
        failUrl: `http://localhost:5173/pay/fail`,
      })
    } catch (err) {
      console.error('결제 처리 오류:', err)
      setLoading(false)
    }

    setLoading(false)
  }

  // 홈 화면으로 이동
  // const handleHomeClick = async () => {
  //   if (isMember) {
  //     await logout(1)
  //   }
  //   navigate('/user')
  // }

  const handlePrevClick = () => {
    navigate('/order')
  }

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center">
      <ImageWrapper>
        <FullImg src="/로딩배경.png" alt="Spring Garden" draggable={false} />
      </ImageWrapper>

      <Content>
        <Text variant="title2" weight="extrabold" color="darkGray">
          결제 수단을 선택해 주세요
        </Text>
        <Text variant="body1" weight="extrabold" color="darkGray">
          (현재 토스/카카오/네이버만 가능)
        </Text>
        <div className="w-[800px] flex flex-col items-center">
          <div
            id="payment-widget"
            className="w-[800px] h-[400px] bg-white mb-20 border border-2-black"
          ></div>

          <div className="flex w-full gap-4">
            <div
              className="w-1/3 flex items-center justify-center px-2 py-4 rounded-lg bg-white"
              onClick={handlePrevClick}
              style={{
                boxShadow: `1.462px 1.462px 4px 2px #f774a275`,
              }}
            >
              <Text variant="body2" weight="bold" color="main">
                이전으로
              </Text>
            </div>

            <div
              className="w-2/3 flex items-center justify-center px-2 py-4 rounded-lg bg-main"
              onClick={handlePayment}
              style={{
                boxShadow: `1.462px 1.462px 4px 2px #f774a275`,
              }}
            >
              <Text variant="body2" weight="bold" color="white">
                {loading
                  ? '처리 중...'
                  : `${totalAmount?.toLocaleString()}원 결제하기`}
              </Text>
            </div>
          </div>
        </div>
      </Content>
    </div>
  )
}
