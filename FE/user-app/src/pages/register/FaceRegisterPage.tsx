import DetailHeader from '@/components/DetailHeader'
import { FaceRegisterCheckModal } from '@/features/register/components/FaceRegisterCheckModal'
import { FaceRegisterMainButton } from '@/features/register/components/FaceRegisterMainButton'
import { FaceRegisterMainButtonProps } from '@/interfaces/RegisterInterfaces'
import { Text } from '@/styles/typography'
import { useEffect, useState } from 'react'
import tw from 'twin.macro'

const HeaderWrapper = tw.div`
  sticky top-0 z-10 bg-white w-full
`

const Container = tw.div`
  w-full max-w-screen-sm mx-auto flex flex-col min-h-screen
`

const ContentWrapper = tw.div`
  flex flex-col px-6 flex-1 pb-6
`

const TextWrapper = tw.div`
  text-center mb-8
`

const ButtonWrapper = tw.div`
  flex flex-col gap-6
`

export function FaceRegisterPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  // 페이지 진입 시 drawer 자동으로 열기
  useEffect(() => {
    // 컴포넌트가 마운트된 후 drawer 열기
    setIsModalOpen(true)
  }, []) // 빈 배열을 넣어 컴포넌트 마운트 시 한 번만 실행되도록 함

  const handleRegisterFace = () => {
    setIsModalOpen(true)
  }

  const handleConfirmConsent = () => {
    // 얼굴 인식 화면으로 넘어가기
    setIsModalOpen(false)
  }

  const buttonProps: FaceRegisterMainButtonProps[] = [
    {
      content: '결제 정보를 등록한다면\n 얼굴 인식 한 번에 결제할 수 있어요',
      src: '/src/assets/face-scan.gif',
      onClick: () => {},
    },
    {
      content: '얼굴 정보는 보안 처리되어\n안전하게 저장해요',
      src: '/src/assets/shield.png',
      onClick: () => {},
    },
    {
      content: '얼굴 등록하러 가볼까요?',
      src: '/src/assets/phone.png',
      onClick: handleRegisterFace,
    },
  ]

  return (
    <Container>
      <HeaderWrapper>
        <DetailHeader title="ㅤ" />
      </HeaderWrapper>
      <ContentWrapper>
        <TextWrapper>
          <Text variant="title3" weight="heavy" color="main">
            ORDER.ME
          </Text>
          <Text variant="title3" weight="semibold" className="pl-2">
            키오스크에서
          </Text>
          <br />
          <Text variant="title3" weight="semibold">
            얼굴인증으로 결제하세요
          </Text>
        </TextWrapper>
        <ButtonWrapper>
          {buttonProps.map((button, index) => {
            return <FaceRegisterMainButton key={index} {...button} />
          })}
        </ButtonWrapper>
        <FaceRegisterCheckModal
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
          onConfirm={handleConfirmConsent}
        />
      </ContentWrapper>
    </Container>
  )
}
