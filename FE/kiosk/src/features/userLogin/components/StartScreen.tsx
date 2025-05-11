import { Text } from '@/styles/typography'
import tw from 'twin.macro'
import CustomDialog from '@/components/CustomDialog'
import { useState } from 'react'
import { useLoginStore } from '@/stores/loginStore'
import { useNavigate } from 'react-router-dom'
import { usePhoneLogin } from '../hooks/usePhoneLogin'

const TopLeftText = tw.div`
  absolute top-4 left-6 z-50
`

const ImageWrapper = tw.div`
  w-full my-8 flex justify-center items-center
`

// 풀 배경
// const FullImg = tw.img`
//   absolute top-0 left-0 w-full h-full object-cover
// `

// 중간 배경
const MiddleImg = tw.img`
  absolute top-40 w-[908px] h-[1224px] object-cover
`

const ButtonGroup = tw.div`
  absolute bottom-40 w-full flex justify-center gap-20 z-10
`

const Button = tw.button`
  px-8 py-4 rounded-lg w-[397px] h-[234px] bg-[#FEFEFE] shadow-[1px_4px_10px_6px_rgba(0,0,0,0.10)]
`

export default function StartScreen() {
  const navigate = useNavigate()
  const { login } = usePhoneLogin()

  type ModalState = 'waiting' | 'success' | 'failure' | 'phone'
  const [modalState, setModalState] = useState<ModalState>('waiting')
  const [showModal, setShowModal] = useState(false)

  const phoneNumber = useLoginStore((state) => state.phoneNumber)
  const resetPhoneNumber = useLoginStore((state) => state.resetPhoneNumber)

  let modalContent

  if (modalState === 'phone') {
    modalContent = {
      title: (
        <Text variant="title4" weight="extrabold" color="gray">
          PhoneSign --------------------------- ORDER.ME
        </Text>
      ),
      description: (
        <Text variant="title4" weight="extrabold">
          전화번호를 입력해 주세요!
        </Text>
      ),
      cancelText: '취소',
      confirmText: '확인',
    }
  } else {
    modalContent = {
      title: (
        <Text variant="title4" weight="extrabold" color="gray">
          FaceSign ----------------------------- ORDER.ME
        </Text>
      ),
      description: {
        waiting: '우측 단말기에\n얼굴을 인식해 주세요!',
        success: '이*환님\n맞으신가요?',
        failure: '인식을 실패했어요',
      }[modalState],
      icon: {
        waiting: '/face.gif',
        success: '/check.gif',
        failure: '/fail.gif',
      }[modalState],
      cancelText: modalState === 'success' ? '전화번호 로그인' : '취소',
      confirmText: modalState === 'success' ? '맞습니다' : '전화번호 로그인',
    }
  }

  const handlePhoneLogin = async () => {
    try {
      await login(phoneNumber)
      resetPhoneNumber()
      setShowModal(false)
      setModalState('waiting')
      alert('전화번호가 일치합니다')
      navigate('/order')
    } catch (err) {
      alert('일치하는 전화번호가 없습니다')
    }
  }

  return (
    <>
      <ImageWrapper>
        <MiddleImg
          src="https://picsum.photos/200"
          alt="Spring Garden"
          draggable={false}
        />
      </ImageWrapper>

      <TopLeftText>
        <Text variant="title4" weight="extrabold" color="littleDarkGray">
          ORDER.ME
        </Text>
      </TopLeftText>

      <ButtonGroup>
        <Button onClick={() => setShowModal(true)}>
          <Text variant="title4" weight="extrabold" color="main">
            ORDER.ME
          </Text>
          <br />
          <Text variant="title2" weight="bold">
            회원 주문
          </Text>
        </Button>
        <Button onClick={() => navigate('/order')}>
          <Text variant="title2" weight="bold">
            비회원 주문
          </Text>
        </Button>
      </ButtonGroup>

      <CustomDialog
        open={showModal}
        onOpenChange={setShowModal}
        title={modalContent.title}
        description={modalContent.description}
        icon={modalContent.icon}
        cancelText={modalContent.cancelText}
        confirmText={modalContent.confirmText}
        onCancel={() => {
          if (modalState === 'success') {
            setModalState('phone')
          } else {
            setShowModal(false)
            setModalState('waiting')
          }
        }}
        onConfirm={() => {
          if (modalState === 'phone') {
            handlePhoneLogin()
          } else if (modalState === 'success') {
            setShowModal(false)
            navigate('/order')
          } else {
            setModalState('phone')
          }
        }}
        showKeypad={modalState === 'phone'}
      />
    </>
  )
}
