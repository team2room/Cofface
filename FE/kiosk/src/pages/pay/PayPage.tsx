import { Text } from '@/styles/typography'
import { useEffect, useRef, useState } from 'react'
import {
  loadPaymentWidget,
  PaymentWidgetInstance,
} from '@tosspayments/payment-widget-sdk'
import { useUserStore } from '@/stores/loginStore'
import { usePayStore } from '@/stores/payStore'
import { usePreparePay } from '@/features/order/hooks/pay/usePreparePay'

const clientKey = 'test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm'
const customerKey = 'YbX2HuSlsC9uVJW6NMRMj'

export default function PayPage() {
  const [loading, setLoading] = useState(false)
  const userName = useUserStore((state) => state.user?.name)
  const totalAmount = usePayStore((state) => state.totalAmount)

  const paymentWidgetRef = useRef<PaymentWidgetInstance | null>(null)

  const [error, setError] = useState<string | null>(null)
  const [paymentWidgetLoaded, setPaymentWidgetLoaded] = useState(false)
  const [paymentWidget, setPaymentWidget] =
    useState<PaymentWidgetInstance | null>(null)
  const [paymentMethodsWidget, setPaymentMethodsWidget] = useState<ReturnType<
    PaymentWidgetInstance['renderPaymentMethods']
  > | null>(null)

  const { result, preparePay } = usePreparePay()
  const store = usePayStore.getState()

  useEffect(() => {
    ;(async () => {
      const paymentWidget = await loadPaymentWidget(clientKey, customerKey)

      paymentWidget.renderPaymentMethods('#payment-widget', totalAmount ?? 0)

      paymentWidgetRef.current = paymentWidget
    })()
  }, [])

  const handlePayment = async () => {
    setLoading(true)
    const paymentWidget = paymentWidgetRef.current

    try {
      await preparePay()

      await paymentWidget?.requestPayment({
        orderId: result?.orderId?.toString() ?? '',
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

  return (
    <>
      <Text variant="title4" weight="extrabold">
        휴대폰으로 QR을
        <br />
        인식해 주세요!
      </Text>

      {/* <h1>주문서</h1>
              <div id="payment-widget" />

              <button onClick={handlePayment}>
                {loading
                  ? '처리 중...'
                  : `${totalAmount?.toLocaleString()}원 결제하기`}
              </button> */}

      <div className="payment-section">
        <h2>결제 수단</h2>
        <div id="payment-widget" className="payment-methods-widget"></div>

        {error && <div className="payment-error">{error}</div>}

        <button className="payment-button" onClick={handlePayment}>
          {loading
            ? '처리 중...'
            : `${totalAmount?.toLocaleString()}원 결제하기`}
        </button>
      </div>
    </>
  )
}
