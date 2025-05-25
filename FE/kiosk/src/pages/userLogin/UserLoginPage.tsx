import NewStartScreen from '@/features/userLogin/components/NewStartScreen'
import { changeDisplayType } from '@/lib/changeDisplay'
import { useDirectOrderStore } from '@/stores/directOrderStore'
import { useUserStore } from '@/stores/loginStore'
import { useOrderStore } from '@/stores/orderStore'
import { usePayResultStore, usePayStore } from '@/stores/payStore'
import { useRecommendationStore } from '@/stores/recommendStore'
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
  const resetRecommendedMenus = useRecommendationStore(
    (state) => state.resetRecommendedMenus,
  )
  const resetDirectOrder = useDirectOrderStore(
    (state) => state.resetDirectOrder,
  )
  const resetOrderId = usePayResultStore((s) => s.resetOrderId)

  useEffect(() => {
    changeDisplayType('default')
      .then((data) => console.log('성공:', data))
      .catch((error) => console.error('실패:', error))
    clearOrders()
    reset()
    resetPayData()
    resetStep()
    resetRecommendedMenus()
    resetDirectOrder()
    resetOrderId()
  }, [])

  return (
    <Container>
      <NewStartScreen />
    </Container>
  )
}
