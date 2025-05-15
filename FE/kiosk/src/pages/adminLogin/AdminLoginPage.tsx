import tw from 'twin.macro'
import LoginForm from '@/features/adminLogin/components/LoginForm'

const Container = tw.div`
  w-full mx-auto flex flex-col h-screen box-border overflow-x-hidden p-10
`

export default function AdminLoginPage() {
  return (
    <Container>
      <LoginForm />
    </Container>
  )
}
