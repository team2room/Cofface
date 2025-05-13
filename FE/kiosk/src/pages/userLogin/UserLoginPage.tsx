import StartScreen from '@/features/userLogin/components/StartScreen'
import tw from 'twin.macro'

const Container = tw.div`
  flex flex-col items-center justify-center min-h-screen bg-white px-20
`

export default function UserLoginPage() {
  return (
    <Container>
      <StartScreen />
    </Container>
  )
}
