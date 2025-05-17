import { Text } from '@/styles/typography'
import tw from 'twin.macro'
import CustomDialog from '@/components/CustomDialog'
import { useEffect, useRef, useState } from 'react'
import { useLoginStore, useUserStore } from '@/stores/loginStore'
import { useNavigate } from 'react-router-dom'
import { useLogin } from '../hooks/useLogin'
import { newFaceRecogRequest } from '../services/faceRecogService'
import { maskName } from '@/utils/maskUserName'
import { useLogout } from '../hooks/useLogout'

const TopLeftText = tw.div`absolute top-4 left-6 z-50`
const ImageWrapper = tw.div`w-full my-8 flex justify-center items-center`
const FullImg = tw.img`absolute top-0 left-0 w-full h-full object-contain`

export default function NewStartScreen() {
  const navigate = useNavigate()
  const { phoneNumLogin, faceLogin } = useLogin()
  const { logout } = useLogout()

  // const calledRef = useRef(false)

  const handleStart = () => {
    // if (calledRef.current) return
    // calledRef.current = true

    setShowModal(true)
    handleFaceLogin()
  }

  type ModalState = 'waiting' | 'success' | 'failure' | 'phone' | 'error'
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
  } else if (modalState === 'error') {
    modalContent = {
      title: (
        <Text variant="title4" weight="extrabold" color="gray">
          FaceSign ----------------------- ORDER.ME
        </Text>
      ),
      description: (
        <Text variant="title4" weight="extrabold">
          서버 에러 발생
        </Text>
      ),
      icon: '/fail.gif',
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
        success: `${maskName(user?.name || '')}님,\n다시 만나 반갑습니다.`,
        failure:
          'COFFACE가 처음이신가요? 등록된 얼굴 정보가 없어요\n하단의 큐알 코드로 회원 가입 및 얼굴 등록을 해주세요',
      }[modalState],
      icon: {
        waiting: '/face.gif',
        success: '/check.gif',
        failure: '/QR.png',
      }[modalState],
      cancelText: modalState === 'waiting' ? '취소' : '전화번호 로그인',
      confirmText: modalState === 'waiting' ? '전화번호 로그인' : '추천받기',
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
      const { phone_number, success, genderage } = await newFaceRecogRequest()
      if (modalStateRef.current !== 'phone') {
        if (success) {
          await faceLogin(phone_number)
          setModalState('success')
        } else {
          // 비회원, 회원이지만 얼굴 등록 안한사람 (모달 띄우기)
          setModalState('failure')
          useUserStore
            .getState()
            .setGuestInfo({ age: genderage.age, gender: genderage.gender })
        }
      }
    } catch (err) {
      console.error('얼굴 로그인 실패:', err)

      if (modalStateRef.current !== 'phone') {
        setModalState('error')
      }
    }
  }

  // const handleGuestOrder = async () => {
  //   try {
  //     const { age, gender } = await genderAgeRequest()
  //     useUserStore.getState().setGuestInfo({ age, gender })
  //     // 얼굴 인식 중이라는 표현하기..
  //     navigate('/loading?type=recommend')
  //   } catch (err) {
  //     alert('비회원 얼굴 분석에 실패했습니다.')
  //     navigate('/loading?type=recommend')
  //   }
  // }

  return (
    <div onClick={handleStart}>
      <ImageWrapper>
        <FullImg src="/포스터.png" alt="Spring Garden" draggable={false} />

        <div className="absolute bottom-60 left-1/2 transform -translate-x-1/2 rounded-lg animate-pulse">
          <Text variant="body1" weight="bold" color="white">
            화면을 터치해 주세요.
          </Text>
        </div>
      </ImageWrapper>

      <TopLeftText>
        <Text variant="title4" weight="heavy" color="main">
          COFFACE
        </Text>
      </TopLeftText>

      <CustomDialog
        open={showModal}
        onOpenChange={setShowModal}
        title={modalContent.title}
        description={modalContent.description}
        icon={modalContent.icon}
        cancelText={modalContent.cancelText}
        confirmText={modalContent.confirmText}
        onCancel={() => {
          if (modalState === 'success' || modalState === 'failure') {
            logout(1)
            setModalState('phone')
          } else {
            // calledRef.current = false
            setShowModal(false)
            resetPhoneNumber()
            setModalState('waiting')
          }
        }}
        onConfirm={() => {
          if (modalState === 'phone') {
            handlePhoneLogin()
          } else if (modalState === 'success' || modalState === 'failure') {
            // calledRef.current = false
            setShowModal(false)
            resetPhoneNumber()
            navigate('/loading?type=recommend')
          } else {
            setModalState('phone')
          }
        }}
        showKeypad={modalState === 'phone'}
      />
    </div>
  )
}
