import CustomButton from '@/components/CustomButton'
import { useLogout } from '@/features/userLogin/hooks/useLogout'
import { useUserStore } from '@/stores/loginStore'
import { Text } from '@/styles/typography'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import tw from 'twin.macro'

const Content = tw.div`flex flex-col items-center justify-center flex-1 gap-8 z-10`

export function FailContent() {
  const navigate = useNavigate()
  const { isMember } = useUserStore()
  const { logout } = useLogout()

  const handleGoBack = async () => {
    if (isMember) {
      await logout(1)
    }
    navigate('/order')
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      handleGoBack()
    }, 1000)

    return () => clearTimeout(timeout)
  }, [])

  return (
    <Content>
      <Text variant="title1" weight="bold" color="lightBlack">
        결제 처리 중 오류가 발생했습니다.
      </Text>
      <Text variant="title3" weight="bold" color="dark">
        3초 뒤 주문 화면으로 이동합니다.
      </Text>
      <div className="w-60 mt-40">
        <CustomButton text={'닫기'} variant={'main'} onClick={handleGoBack} />
      </div>
    </Content>
  )
}
