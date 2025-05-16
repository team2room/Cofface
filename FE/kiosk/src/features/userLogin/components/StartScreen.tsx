import { Text } from '@/styles/typography'
import tw from 'twin.macro'
import CustomDialog from '@/components/CustomDialog'
import { useEffect, useRef, useState } from 'react'
import { useLoginStore, useUserStore } from '@/stores/loginStore'
import { useNavigate } from 'react-router-dom'
import { useLogin } from '../hooks/useLogin'
import {
  faceRecogRequest,
  genderAgeRequest,
} from '../services/faceRecogService'
import { maskName } from '@/utils/maskUserName'
import { useWeather } from '../hooks/useWeather'
import { useLogout } from '../hooks/useLogout'

const TopLeftText = tw.div`
  absolute top-4 left-6 z-50
`

const ImageWrapper = tw.div`
  w-full my-8 flex justify-center items-center
`

const FullImg = tw.img`
  absolute top-0 left-0 w-full h-full object-cover
`

const ButtonGroup = tw.div`
  absolute bottom-40 w-full flex justify-center gap-20 z-10
`

const Button = tw.button`
  px-8 py-4 rounded-lg w-[397px] h-[234px] bg-[#FEFEFE] shadow-[1px_4px_10px_6px_rgba(0,0,0,0.10)] 
  hover:scale-105 transition-transform duration-200
`

export default function StartScreen() {
  const navigate = useNavigate()
  useWeather()
  const { phoneNumLogin, faceLogin } = useLogin()
  const { logout } = useLogout()

  type ModalState = 'waiting' | 'success' | 'failure' | 'phone'
  const [modalState, setModalState] = useState<ModalState>('waiting')
  const [showModal, setShowModal] = useState(false)

  const phoneNumber = useLoginStore((state) => state.phoneNumber)
  const resetPhoneNumber = useLoginStore((state) => state.resetPhoneNumber)
  const user = useUserStore((state) => state.user)

  let modalContent

  if (modalState === 'phone') {
    modalContent = {
      title: (
        <Text variant="title4" weight="extrabold" color="gray">
          PhoneSign --------------------- ORDER.ME
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
          FaceSign ----------------------- ORDER.ME
        </Text>
      ),
      description: {
        waiting: '우측 단말기에\n얼굴을 인식해 주세요!',
        success: `${maskName(user?.name || '')}님\n맞으신가요?`,
        failure: '등록된 얼굴 정보가 없어요',
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

  const modalStateRef = useRef(modalState)
  useEffect(() => {
    modalStateRef.current = modalState
  }, [modalState])

  const handlePhoneLogin = async () => {
    try {
      await phoneNumLogin(phoneNumber)
      setModalState('success')
    } catch (err) {
      alert('일치하는 전화번호가 없습니다')
    } finally {
      resetPhoneNumber()
    }
  }

  const handleFaceLogin = async () => {
    try {
      const { phone_number } = await faceRecogRequest()
      if (modalStateRef.current !== 'phone') {
        await faceLogin(phone_number)
        setModalState('success')
      }
    } catch (err) {
      console.error('얼굴 로그인 실패:', err)

      if (modalStateRef.current !== 'phone') {
        setModalState('failure')
      }
    }
  }

  const handleGuestOrder = async () => {
    try {
      const { age, gender } = await genderAgeRequest()
      useUserStore.getState().setGuestInfo({ age, gender })
      navigate('/order')
    } catch (err) {
      alert('비회원 얼굴 분석에 실패했습니다.')
      navigate('/order')
    }
  }

  return (
    <>
      <ImageWrapper>
        <FullImg src="/시작광고.png" alt="Spring Garden" draggable={false} />
      </ImageWrapper>

      <TopLeftText>
        <Text variant="title4" weight="heavy" color="main">
          ORDER.ME
        </Text>
      </TopLeftText>

      <ButtonGroup>
        <Button
          onClick={() => {
            setShowModal(true)
            handleFaceLogin()
          }}
        >
          <Text variant="title4" weight="extrabold" color="main">
            ORDER.ME
          </Text>
          <br />
          <Text variant="title2" weight="bold">
            회원 주문
          </Text>
        </Button>
        <Button onClick={handleGuestOrder}>
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
            logout(1)
            setModalState('phone')
          } else {
            setShowModal(false)
            resetPhoneNumber()
            setModalState('waiting')
          }
        }}
        onConfirm={() => {
          if (modalState === 'phone') {
            handlePhoneLogin()
          } else if (modalState === 'success') {
            setShowModal(false)
            resetPhoneNumber()
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
