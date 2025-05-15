import MainButton from '@/components/MainButton'
import { Text } from '@/styles/typography'
import { useLocation, useNavigate } from 'react-router-dom'
import tw from 'twin.macro'
import shieldCheck from '@/assets/shield-check.gif'

const Container = tw.div`
  w-full max-w-screen-sm mx-auto flex flex-col min-h-screen p-6 justify-center
`
const ContentWrapper = tw.div`
  flex flex-col items-center gap-28
`
const ButtonGroup = tw.div`
  w-full flex flex-col gap-4
`

interface LocationState {
  success?: boolean
  error?: string
}

export function FaceRegisterConfirmPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const { success = true, error } = (location.state as LocationState) || {}

  return (
    <Container>
      <ContentWrapper>
        {success ? (
          // 성공 화면
          <>
            <img src={shieldCheck} className="w-36" alt="성공" />
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
          </>
        ) : (
          // 실패 화면
          <>
            <img src={shieldCheck} className="w-36" alt="실패" />
            <Text variant="title2" weight="bold">
              얼굴 등록을 실패했어요
            </Text>
            {error && (
              <Text variant="body1" weight="regular" color="darkGray">
                {error}
              </Text>
            )}
            <ButtonGroup>
              <MainButton
                text="다시 등록하기"
                onClick={() => {
                  navigate('/register/face/capture')
                }}
              />
              <MainButton
                text="홈으로 돌아가기"
                sub={true}
                onClick={() => {
                  navigate('/')
                }}
              />
            </ButtonGroup>
          </>
        )}
      </ContentWrapper>
    </Container>
  )
}
