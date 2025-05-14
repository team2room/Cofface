import { useSearchParams } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { Text } from '@/styles/typography'
import { useAutoPay } from '@/features/order/hooks/useAutoPay'
import tw from 'twin.macro'

const ImageWrapper = tw.div`
  w-full my-8 flex justify-center items-center
`
const FullImg = tw.img`
  absolute top-0 left-0 w-full h-full object-cover
`

export default function LoadingPage() {
  const [searchParams] = useSearchParams()
  const type = searchParams.get('type')

  const { loading: paymentLoading, result, error, startPayment } = useAutoPay()

  const calledRef = useRef(false)

  useEffect(() => {
    if (!calledRef.current) {
      calledRef.current = true

      if (type === 'progress') {
        startPayment()
      } else if (type === 'recommend') {
        // 추천 메뉴 API 호출
      }
    }
  }, [type])

  const renderContent = () => {
    if (type === 'progress') {
      if (paymentLoading)
        return (
          <>
            <img src="/pay.gif" className="w-40 h-40 mb-6" />
            <Text variant="title1" color="lightBlack">
              💳 결제가 진행되고 있습니다...
            </Text>
          </>
        )
      if (result) return <Text variant="title3">✅ 결제가 완료되었습니다!</Text>
      if (error) return <Text variant="title3">❌ 결제 실패: {error}</Text>
    }

    if (type === 'recommend') {
      return (
        <>
          <img src="/loading.gif" className="w-40 h-40 mb-6" />
          <Text variant="title1" color="lightBlack">
            맞춤 메뉴 추천 중입니다...
          </Text>
        </>
      )
    }

    if (type === 'complete') {
      return (
        <>
          <img src="/loading.gif" className="w-40 h-40 mb-6" />
          <Text variant="title1" color="lightBlack">
            🎉 주문 완료되었습니다!
          </Text>
        </>
      )
    }

    return <Text variant="title1">⏳ 로딩 중입니다...</Text>
  }

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center">
      <ImageWrapper>
        <FullImg src="/로딩배경.png" alt="Spring Garden" draggable={false} />
      </ImageWrapper>

      {renderContent()}
    </div>
  )
}
