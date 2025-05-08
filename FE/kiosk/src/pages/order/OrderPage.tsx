import { useState } from 'react'
import Header from '@/components/Header'
import tw from 'twin.macro'
import MenuContent from '../../features/order/components/MenuContent'
import PlaceSelectContent from '../../features/order/components/PlaceSelectContent'
import PayContent from '@/features/order/components/PayContent'

const Container = tw.div`flex flex-col min-h-screen bg-white px-7 my-4`

type Step = 'menu' | 'place' | 'pay'

export default function OrderPage() {
  const [step, setStep] = useState<Step>('menu')

  return (
    <Container>
      <Header isMember={true} />

      {step === 'menu' && <MenuContent onNext={() => setStep('place')} />}
      {step === 'place' && <PlaceSelectContent onNext={() => setStep('pay')} />}
      {step === 'pay' && <PayContent />}
    </Container>
  )
}
