import NewStartScreen from '@/features/userLogin/components/NewStartScreen'
import { useUserStore } from '@/stores/loginStore'
// import StartScreen from '@/features/userLogin/components/StartScreen'
import { useOrderStore } from '@/stores/orderStore'
import { usePayStore } from '@/stores/payStore'
import { useStepStore } from '@/stores/stepStore'
import { useEffect } from 'react'
import tw from 'twin.macro'

const Container = tw.div`
  flex flex-col items-center justify-center min-h-screen bg-white px-20
`

export default function UserLoginPage() {
  const clearOrders = useOrderStore((state) => state.clearOrders)
  const reset = useUserStore((state) => state.reset)
  const resetPayData = usePayStore((state) => state.resetPayData)
  const resetStep = useStepStore((state) => state.resetStep)

  useEffect(() => {
    clearOrders()
    reset()
    resetPayData()
    resetStep()
  }, [])

  return (
    <Container>
      {/* <StartScreen /> */}
      <NewStartScreen />
    </Container>
  )
}
