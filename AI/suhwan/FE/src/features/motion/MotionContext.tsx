// features/motion/MotionContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react'
import { MotionEventBus } from './services/MotionEventBus'
import MotionApiService from './services/MotionApiService'

interface MotionContextType {
  isActive: boolean
  lastMotion: string | null
  setActive: (active: boolean) => void
}

const MotionContext = createContext<MotionContextType>({
  isActive: false,
  lastMotion: null,
  setActive: () => {},
})

export const useMotion = () => useContext(MotionContext)

interface MotionProviderProps {
  children: React.ReactNode
  initialActive?: boolean
}

export const MotionProvider: React.FC<MotionProviderProps> = ({
  children,
  initialActive = false,
}) => {
  const [isActive, setIsActive] = useState<boolean>(initialActive)
  const [lastMotion, setLastMotion] = useState<string | null>(null)

  // 활성화 상태 변경 함수
  const setActive = (active: boolean) => {
    console.log(`[MotionContext] 모션 감지 ${active ? '활성화' : '비활성화'}`)
    setIsActive(active)
    MotionApiService.setActive(active)
  }

  // 모션 이벤트 구독
  useEffect(() => {
    console.log('[MotionContext] 모션 이벤트 구독 설정')

    // API 서비스 리스너 설정
    MotionApiService.setupMotionListener()

    // 직접 이벤트 구독 (UI에 표시하기 위함)
    const subscription = MotionEventBus.subscribe((event) => {
      console.log(`[MotionContext] 모션 이벤트 수신: ${event.type}`)
      setLastMotion(event.type)

      // 일정 시간 후 lastMotion 초기화
      setTimeout(() => {
        setLastMotion(null)
      }, 3000)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <MotionContext.Provider value={{ isActive, lastMotion, setActive }}>
      {children}
    </MotionContext.Provider>
  )
}

export default MotionContext
