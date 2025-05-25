import MainButton from '@/components/MainButton'
import { Text } from '@/styles/typography'
import { useNavigate, useLocation } from 'react-router-dom'
import tw from 'twin.macro'
import shieldCheck from '@/assets/shield-check.gif'
import { useEffect } from 'react'

const Container = tw.div`
  w-full max-w-screen-sm mx-auto flex flex-col min-h-screen p-6 justify-center
`
const ContentWrapper = tw.div`
  flex flex-col items-center gap-28
`

export function FaceRegisterConfirmPage() {
  const navigate = useNavigate()
  const location = useLocation()
  
  // location.state에서 등록 결과 및 사용자 ID 가져오기
  const { userId, registrationResult } = location.state || {}
  
  // 성공 메시지 로그
  useEffect(() => {
    if (registrationResult) {
      console.log('등록 결과:', registrationResult)
    }
  }, [registrationResult])

  return (
    <Container>
      <ContentWrapper>
        <img src={shieldCheck} className="w-36" alt="완료" />
        <Text variant="title2" weight="bold">
          얼굴 등록을 완료했어요
        </Text>
        <MainButton
          text="확인"
          sub={true}
          onClick={() => {
            navigate('/')
          }}
        />
      </ContentWrapper>
    </Container>
  )
}