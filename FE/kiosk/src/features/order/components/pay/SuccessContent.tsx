import { ConfirmPayRequest } from '@/interfaces/PayInterface'
import { useLocation, useNavigate } from 'react-router-dom'
import tw from 'twin.macro'
import { useConfirmPay } from '../../hooks/pay/useConfirmPay'
import { useEffect, useState } from 'react'

const Content = tw.div`flex flex-col items-center justify-center flex-1 gap-8 z-10`

export function SuccessContent() {
  const location = useLocation()
  const navigate = useNavigate()
  const { loading, result, error, confirmPay } = useConfirmPay()

  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    const processPayment = async () => {
      const query = new URLSearchParams(location.search)
      const paymentKey = query.get('paymentKey')
      const orderId = query.get('orderId')
      const amount = query.get('amount')

      if (!paymentKey || !orderId || !amount) {
        setErrorMsg('필수 결제 정보가 누락되었습니다.')
        return
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

  const handleGoBack = () => {
    navigate('/user')
  }

  if (loading) {
    return (
      <div className="payment-container">
        <div className="payment-loading">
          <h2>결제 승인 중...</h2>
          <p>잠시만 기다려주세요.</p>
          <div className="loading-spinner"></div>
        </div>
      </div>
    )
  }

  if (errorMsg) {
    return (
      <div className="payment-container">
        <div className="payment-error">
          <h1>결제 오류</h1>
          <p className="error-message">{error}</p>
          <button onClick={handleGoBack} className="payment-button">
            처음으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <Content>
      <h1>결제 성공</h1>
      {result && (
        <>
          <div>{`주문 아이디: ${result.orderNumber}`}</div>
          <div>{`결제 금액: ${result.amount.toLocaleString()}원`}</div>
          <div className="info-row">
            <span>결제 상태:</span>
            <span>
              {result.status === 'DONE' ? '결제 완료' : result.status}
            </span>
          </div>
        </>
      )}
    </Content>
  )
}
