import { useNavigate, useSearchParams } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { Text } from '@/styles/typography'
import { useAutoPay } from '@/features/order/hooks/useAutoPay'
import tw from 'twin.macro'
import CustomButton from '@/components/CustomButton'
import { useLogout } from '@/features/userLogin/hooks/useLogout'
import { useUserStore } from '@/stores/loginStore'
import { useWeather } from '@/features/userLogin/hooks/useWeather'
import { changeDisplayType } from '@/lib/changeDisplay'
import { usePayResultStore } from '@/stores/payStore'

const ImageWrapper = tw.div`
  w-full my-8 flex justify-center items-center
`
const FullImg = tw.img`
  absolute top-0 left-0 w-full h-full object-cover
`

const Content = tw.div`flex flex-col items-center justify-center flex-1 gap-8 z-10`

export default function LoadingPage() {
  const navigate = useNavigate()
  const { logout } = useLogout()
  const { isMember } = useUserStore()
  const orderId = usePayResultStore((s) => s.orderId)

  const handleHome = async () => {
    if (isMember) {
      await logout(1)
    }
    navigate('/user')
  }

  const [searchParams] = useSearchParams()
  const type = searchParams.get('type')

  const { result, error, startPayment } = useAutoPay()

  const calledRef = useRef(false)

  // api 호출
  useEffect(() => {
    if (!calledRef.current) {
      calledRef.current = true

      if (type === 'progress') {
        startPayment()
      } else if (type === 'recommend') {
        useWeather()
      }
    }
  }, [type])

  // 화면 유지
  useEffect(() => {
    if (type === 'progress' && result) {
      const timer = setTimeout(() => {
        navigate('/loading?type=complete')
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [type, result])

  useEffect(() => {
    if (type === 'progress' && error) {
      const timer = setTimeout(() => {
        navigate('/order')
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [type, error])

  useEffect(() => {
    if (type === 'complete') {
      const timer = setTimeout(() => {
        handleHome()
      }, 1000)

      return () => clearTimeout(timer)
    }

    if (type === 'recommend') {
      changeDisplayType('motion')
        .then((data) => console.log('성공:', data))
        .catch((error) => console.error('실패:', error))
      const timer = setTimeout(() => {
        navigate('/order')
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [type])

  // 렌더링
  const renderContent = () => {
    if (type === 'progress') {
      return (
        <>
          <img src="/pay.gif" className="mb-6" />
          <Text
            variant="title1"
            weight="bold"
            color="lightBlack"
            fontFamily="Suite"
          >
            결제가 진행되고 있습니다...
          </Text>

          {error && (
            <>
              <Text variant="title3" fontFamily="Suite">
                ❌ 결제 실패
              </Text>
              <Text variant="body2" color="darkGray" fontFamily="Suite">
                3초 후 주문 화면으로 이동합니다.
              </Text>
            </>
          )}
        </>
      )
    }

    if (type === 'recommend') {
      return (
        <>
          <img src="/loading.gif" className="mb-6" />
          <Text
            variant="title1"
            color="lightBlack"
            weight="bold"
            fontFamily="Suite"
          >
            맞춤 메뉴 추천 중입니다...
          </Text>
        </>
      )
    }

    if (type === 'complete') {
      return (
        <>
          <img src="/loading.gif" className="mb-6" />
          <Text variant="title2" weight="bold" color="black" fontFamily="Suite">
            {/* 주문번호 : {orderId} */}
            주문번호 : {orderId ? orderId : 'A-32'}
          </Text>
          <Text
            variant="title1"
            weight="bold"
            color="lightBlack"
            fontFamily="Suite"
          >
            주문이 완료되었습니다!
          </Text>
          <Text variant="title3" weight="bold" color="dark" fontFamily="Suite">
            3초 뒤 첫 화면으로 이동합니다.
          </Text>
          <div className="w-60 mt-40">
            <CustomButton text={'닫기'} variant={'main'} onClick={handleHome} />
          </div>
        </>
      )
    }

    return (
      <Text variant="title1" weight="bold" fontFamily="Suite">
        ⏳ 로딩 중입니다...
      </Text>
    )
  }

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center">
      <ImageWrapper>
        <FullImg src="/로딩배경.png" alt="Spring Garden" draggable={false} />
      </ImageWrapper>

      <Content>{renderContent()}</Content>
    </div>
  )
}
