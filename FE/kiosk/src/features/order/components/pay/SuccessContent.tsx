import { Text } from '@/styles/typography'
import { ConfirmPayRequest } from '@/interfaces/PayInterface'
import { useLocation, useNavigate } from 'react-router-dom'
import tw from 'twin.macro'
import { useConfirmPay } from '../../hooks/pay/useConfirmPay'
import { useEffect } from 'react'
import { useUserStore } from '@/stores/loginStore'
import { useLogout } from '@/features/userLogin/hooks/useLogout'
import CustomButton from '@/components/CustomButton'

const Content = tw.div`flex flex-col items-center justify-center flex-1 gap-8 z-10`

export function SuccessContent() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isMember } = useUserStore()
  const { logout } = useLogout()
  const { loading, result, error, confirmPay } = useConfirmPay()

  useEffect(() => {
    const processPayment = async () => {
      const query = new URLSearchParams(location.search)
      const paymentKey = query.get('paymentKey')
      const orderId = query.get('orderId')
      const amount = query.get('amount')

      if (!paymentKey || !orderId || !amount) {
        throw new Error('필수 결제 정보가 누락되었습니다.')
      }

      const payload: ConfirmPayRequest = {
        paymentKey,
        orderId,
        amount: parseFloat(amount),
        paymentType: 'CARD',
      }

      try {
        await confirmPay(payload)
      } catch (err: any) {
        console.error(error)
      }
    }

    processPayment()
  }, [location])

  const handleGoBack = async () => {
    if (isMember) {
      await logout(1)
    }
    navigate('/user')
  }

  useEffect(() => {
    if (error || result) {
      const timeout = setTimeout(() => {
        handleGoBack()
      }, 3000)

      return () => clearTimeout(timeout)
    }
  }, [error, result])

  return (
    <Content>
      {loading && (
        <>
          <img src="/pay.gif" className="mb-6" />
          <Text variant="title1" weight="bold" color="lightBlack">
            결제가 진행되고 있습니다...
          </Text>
        </>
      )}

      {error && (
        <>
          <>
            <Text variant="title3">❌ 결제 실패</Text>
            <Text variant="body2" color="darkGray">
              3초 후 첫 화면으로 이동합니다.
            </Text>
          </>
        </>
      )}

      {result && (
        <>
          <img src="/loading.gif" className="mb-6" />
          <Text variant="title2" weight="bold" color="black">
            {`주문 번호: ${result.orderNumber}`}
          </Text>
          <Text variant="title1" weight="bold" color="lightBlack">
            주문이 완료되었습니다!
          </Text>
          <Text variant="title3" weight="bold" color="dark">
            3초 뒤 첫 화면으로 이동합니다.
          </Text>
          <div className="w-60 mt-40">
            <CustomButton
              text={'닫기'}
              variant={'main'}
              onClick={handleGoBack}
            />
          </div>
        </>
      )}
    </Content>
  )
}
