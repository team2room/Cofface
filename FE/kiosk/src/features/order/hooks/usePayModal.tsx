import { Text } from '@/styles/typography'
import { useEffect, useRef, useState } from 'react'
import {
  loadPaymentWidget,
  PaymentWidgetInstance,
} from '@tosspayments/payment-widget-sdk'
import { useUserStore } from '@/stores/loginStore'
import { usePayStore } from '@/stores/payStore'
import { usePreparePay } from './pay/usePreparePay'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
} from '@/components/ui/alert-dialog'
import CustomButton from '@/components/CustomButton'

const clientKey = 'test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm'
const customerKey = 'YbX2HuSlsC9uVJW6NMRMj'

// export function usePayModal(modalState: 'face' | 'qr') {
//   const [loading, setLoading] = useState(false)
//   const userName = useUserStore((state) => state.user?.name)
//   const totalAmount = usePayStore((state) => state.totalAmount)

//   const paymentWidgetRef = useRef<PaymentWidgetInstance | null>(null)

//   useEffect(() => {
//     const initPaymentWidget = async () => {
//       try {
//         if (!clientKey || !customerKey) {
//           console.warn('결제 위젯 초기화 실패: clientKey 또는 customerKey 누락')
//           return
//         }

//         const paymentWidget = await loadPaymentWidget(clientKey, customerKey)

//         paymentWidget.renderPaymentMethods('#payment-widget', totalAmount ?? 0)

//         paymentWidgetRef.current = paymentWidget
//       } catch (err) {
//         console.error('결제 위젯 로딩 실패:', err)
//       }
//     }

//     initPaymentWidget()
//   }, [clientKey, customerKey, totalAmount])

//   const handlePayment = async () => {
//     const { result, preparePay } = usePreparePay()
//     const store = usePayStore.getState()
//     setLoading(true)
//     const paymentWidget = paymentWidgetRef.current

//     try {
//       preparePay()

//       await paymentWidget?.requestPayment({
//         orderId: result?.orderId?.toString() ?? '',
//         orderName: `커피 주문 (${store?.menuOrders?.reduce((acc, cur) => acc + cur.quantity, 0)}건)`,
//         customerName: userName || '고객',
//         customerEmail: 'customer123@gmail.com',
//         successUrl: `${window.location.origin}/success`,
//         failUrl: `${window.location.origin}/fail`,
//       })
//     } catch (err) {
//       console.error('결제 처리 오류:', err)
//       setLoading(false)
//     }
//   }

//   return {
//     title: (
//       <Text variant="title4" weight="extrabold" color="gray">
//         QRPay ------------------------- ORDER.ME
//       </Text>
//     ),
//     description: (
//       <>
//         <Text variant="title4" weight="extrabold">
//           휴대폰으로 QR을
//           <br />
//           인식해 주세요!
//         </Text>

//         <h1>주문서</h1>
//         <div id="payment-widget" />

//         <button onClick={handlePayment}>
//           {loading
//             ? '처리 중...'
//             : `${totalAmount?.toLocaleString()}원 결제하기`}
//         </button>
//       </>
//     ),
//     icon: undefined,
//     cancelText: '취소',
//     hideConfirm: true,
//   }
// }

interface CommonAlertDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function Dialog({ open, onOpenChange }: CommonAlertDialogProps) {
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

  // 토스페이먼츠 결제 위젯 로드
  useEffect(() => {
    if (!clientKey) return

    const loadWidget = async () => {
      try {
        const paymentWidgetInstance = await loadPaymentWidget(clientKey, 'test')
        setPaymentWidget(paymentWidgetInstance)
        setPaymentWidgetLoaded(true)
      } catch (err) {
        console.error('결제 위젯 로드 오류:', err)
        setError('결제 위젯을 로드하는데 실패했습니다.')
      }
    }

    loadWidget()
  }, [clientKey])

  // 결제 수단 위젯 마운트
  useEffect(() => {
    if (!paymentWidgetLoaded || !paymentWidget) return

    try {
      const paymentMethodsWidgetInstance = paymentWidget.renderPaymentMethods(
        '#payment-methods',
        { value: totalAmount ?? 0 },
        { variantKey: 'DEFAULT' },
      )

      setPaymentMethodsWidget(paymentMethodsWidgetInstance)
    } catch (err) {
      console.error('결제 수단 위젯 마운트 오류:', err)
    }
  }, [paymentWidgetLoaded, paymentWidget, totalAmount])

  const handlePayment = async () => {
    const { result, preparePay } = usePreparePay()
    const store = usePayStore.getState()
    setLoading(true)
    const paymentWidget = paymentWidgetRef.current

    try {
      preparePay()

      await paymentWidget?.requestPayment({
        orderId: result?.orderId?.toString() ?? '',
        orderName: `커피 주문 (${store?.menuOrders?.reduce((acc, cur) => acc + cur.quantity, 0)}건)`,
        customerName: userName || '고객',
        customerEmail: 'customer123@gmail.com',
        successUrl: `${window.location.origin}/success`,
        failUrl: `${window.location.origin}/fail`,
      })
    } catch (err) {
      console.error('결제 처리 오류:', err)
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-xl p-12 pb-16 text-center">
        <AlertDialogTitle>
          <Text variant="title4" weight="extrabold" color="gray">
            QRPay ------------------------- ORDER.ME
          </Text>
        </AlertDialogTitle>
        <AlertDialogDescription className="mt-28 mb-28 whitespace-pre-line leading-10">
          <Text variant="title3" weight="extrabold" color="lightBlack">
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
                <div
                  id="payment-methods"
                  className="payment-methods-widget"
                ></div>

                {error && <div className="payment-error">{error}</div>}

                <button className="payment-button" onClick={handlePayment}>
                  {loading
                    ? '처리 중...'
                    : `${totalAmount?.toLocaleString()}원 결제하기`}
                </button>
              </div>
            </>
          </Text>
        </AlertDialogDescription>

        <AlertDialogFooter className="w-[576px] mx-auto flex gap-8 justify-center">
          <CustomButton text="취소" variant="cancle" onClick={() => {}} />
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
