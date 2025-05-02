import tw from 'twin.macro'
import styled from '@emotion/styled'
import MainTopSection from '@/features/login/components/MainTopSection'
import MainLoginButton from '@/features/login/components/MainLoginButton'
import { useNavigate } from 'react-router-dom'

const Container = styled.div`
  ${tw`
    w-full
    h-screen
    max-w-screen-sm 
    flex 
    flex-col 
    p-9
    overflow-x-hidden
    items-center
    justify-center
    gap-60
  `}
`

export default function MainPage() {
  const navigate = useNavigate()
  return (
    <Container>
      <MainTopSection />
      <MainLoginButton
        text="휴대폰 번호로 계속하기"
        onClick={() => {
          navigate('/login/verify')
        }}
      />
    </Container>
  )
}
