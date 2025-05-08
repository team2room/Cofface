import { useState } from 'react'
import Header from '@/components/Header'
import tw from 'twin.macro'
import MenuContent from '../../features/order/components/MenuContent'
import PlaceSelectContent from '../../features/order/components/PlaceSelectContent'
import PayContent from '@/features/order/components/PayContent'
import CompleteContent from '@/features/order/components/CompleteContent'
import CustomDialog from '@/components/CustomDialog'
import { Text } from '@/styles/typography'
import { useNavigate } from 'react-router-dom'

const Container = tw.div`flex flex-col min-h-screen bg-white px-7 my-4`

type Step = 'menu' | 'place' | 'pay' | 'complete'

export default function OrderPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('menu')
  const [showTimeoutModal, setShowTimeoutModal] = useState(false)

  return (
    <>
      <Container>
        <Header isMember={true} onTimeout={() => setShowTimeoutModal(true)} />

        {step === 'menu' && <MenuContent onNext={() => setStep('place')} />}
        {step === 'place' && (
          <PlaceSelectContent onNext={() => setStep('pay')} />
        )}
        {step === 'pay' && <PayContent />}
        {step === 'complete' && <CompleteContent />}
      </Container>

      <CustomDialog
        open={showTimeoutModal}
        onOpenChange={setShowTimeoutModal}
        title={
          <Text variant="title3" weight="extrabold">
            시간 초과😥
          </Text>
        }
        description={
          <Text variant="body1" weight="bold">
            세션이 만료되어
            <br />
            로그아웃 및 첫 화면으로 이동합니다.
          </Text>
        }
        confirmText="확인"
        hideCancel={true}
        onConfirm={() => navigate('/user')}
      />
    </>
  )
}
