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
import { changeCamera } from '@/lib/changeCamera'
import { changeDisplayType } from '@/lib/changeDisplay'

const ImageWrapper = tw.div`w-full my-8 flex justify-center items-center`
const FullImg = tw.img`absolute top-0 left-0 w-full h-full object-contain`

export default function NewStartScreen() {
  const navigate = useNavigate()
  const { phoneNumLogin, faceLogin } = useLogin()
  const { logout } = useLogout()

  type ModalState =
    | 'waiting'
    | 'success'
    | 'failure'
    | 'phone'
    | 'error'
    | 'live'
  const [modalState, setModalState] = useState<ModalState>('waiting')
  const [showModal, setShowModal] = useState(false)

  const phoneNumber = useLoginStore((state) => state.phoneNumber)
  const resetPhoneNumber = useLoginStore((state) => state.resetPhoneNumber)
  const user = useUserStore((state) => state.user)

  // 시작 화면 터치 중복 방지
  // const calledRef = useRef(false)
  const handleStart = () => {
    // if (calledRef.current) return
    // calledRef.current = true
    // if (modalStateRef.current !== 'phone') {
    setShowModal(true)
    handleFaceLogin()
    // }
  }

  useEffect(() => {
    if (!showModal) {
      changeDisplayType('default')
        .then((data) => console.log('성공:', data))
        .catch((error) => console.error('실패:', error))
    }
  }, [showModal])

  let modalContent
  if (modalState === 'phone') {
    modalContent = {
      title: (
        <Text variant="title4" weight="extrabold" color="gray">
          PhoneSign --------------------- COFFACE
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
  } else if (modalState === 'error' || modalState === 'live') {
    modalContent = {
      title: (
        <Text variant="title4" weight="extrabold" color="gray">
          FaceSign ----------------------- COFFACE
        </Text>
      ),
      description: {
        error: '서버 에러 발생',
        live: '사진이나 영상은 인식할 수 없습니다',
      }[modalState],
      icon: '/fail.gif',
      cancelText: '취소',
      confirmText: '전화번호 로그인',
    }
  } else {
    modalContent = {
      title: (
        <Text variant="title4" weight="extrabold" color="gray">
          FaceSign ----------------------- COFFACE
        </Text>
      ),
      description: {
        waiting: '우측 단말기에\n얼굴을 인식해 주세요!',
        success: `${maskName(user?.name || '')}님,\n다시 만나 반갑습니다.`,
        failure: 'COFFACE가 처음이신가요?\n등록된 얼굴 정보가 없어요',
      }[modalState],
      subText: {
        waiting: '',
        success: '',
        failure: 'QR 코드를 통해 회원가입 및 얼굴 등록을 할 수 있어요!',
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

  useEffect(() => {
    const updateCameraMode = async () => {
      try {
        if (modalState !== 'waiting') {
          await changeCamera(false)
        }
      } catch (error) {
        console.error('카메라 모드 변경 실패:', error)
      }
    }

    updateCameraMode()
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
          if (genderage.is_live === false) {
            console.error('얼굴 인식 실패: 생체 정보가 일치하지 않음')
          } else {
            setModalState('failure')
            useUserStore
              .getState()
              .setGuestInfo({ age: genderage.age, gender: genderage.gender })
          }
        }
      }
    } catch (err) {
      console.error('얼굴 로그인 실패:', err)
      if (modalStateRef.current !== 'phone') {
        setModalState('error')
      }
    }
  }

  return (
    <>
      <div onClick={handleStart}>
        <ImageWrapper>
          <FullImg src="/포스터3.png" alt="Spring Garden" draggable={false} />

          <div className="absolute bottom-60 left-1/2 transform -translate-x-1/2 rounded-lg animate-pulse">
            <Text variant="body1" weight="bold" color="white">
              화면을 터치해 주세요.
            </Text>
          </div>
        </ImageWrapper>
      </div>

      <CustomDialog
        open={showModal}
        onOpenChange={setShowModal}
        title={modalContent.title}
        description={modalContent.description}
        subText={modalContent.subText}
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
    </>
  )
}
