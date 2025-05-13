import StartScreen from '@/features/userLogin/components/StartScreen'
import { useOrderStore } from '@/stores/orderStore'
import { useEffect } from 'react'
import tw from 'twin.macro'

const Container = tw.div`
  flex flex-col items-center justify-center min-h-screen bg-white px-20
`

export default function UserLoginPage() {
  const clearOrders = useOrderStore((state) => state.clearOrders)

  useEffect(() => {
    clearOrders()
  }, [])

  return (
    <Container>
      <StartScreen />
    </Container>
  )
}
