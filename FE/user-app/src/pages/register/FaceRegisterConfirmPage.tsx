import MainButton from '@/components/MainButton'
import { Text } from '@/styles/typography'
import { useNavigate } from 'react-router-dom'
import tw from 'twin.macro'
import shieldCheck from '@/assets/shield-check.gif'

const Container = tw.div`
  w-full max-w-screen-sm mx-auto flex flex-col min-h-screen p-6 justify-center
`
const ContentWrapper = tw.div`
  flex flex-col items-center gap-28
`

export function FaceRegisterConfirmPage() {
  const navigate = useNavigate()

  return (
    <Container>
      <ContentWrapper>
        <img src={shieldCheck} className="w-36" />
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
