// components/HeadShaking/KioskMotionWrapper.tsx
import React, { useEffect } from 'react'
import KioskMotionTracker from './KioskMotionTracker'
import { MotionProvider, useMotion } from './MotionContext'
import { MotionDetector } from '../services/MotionDetectorService'

interface KioskMotionWrapperProps {
  debug?: boolean
}

const KioskMotionComponent: React.FC<{ debug?: boolean }> = ({ debug }) => {
  const { setActive } = useMotion()

  // 컴포넌트 마운트 시 활성화 및 모션 감지 최적화
  useEffect(() => {
    console.log('[KioskMotionWrapper] 컴포넌트 마운트, 모션 감지 활성화')
    setActive(true)

    // 도리도리 및 끄덕임 모션에 최적화
    console.log('[KioskMotionWrapper] 도리도리 및 끄덕임 모션 감지 최적화 적용')
    MotionDetector.optimizeForHeadShakeAndNod()

    return () => {
      console.log('[KioskMotionWrapper] 컴포넌트 언마운트, 모션 감지 비활성화')
      setActive(false)
    }
  }, [setActive])

  // 얼굴 감지 콜백
  const handleFaceDetected = (detected: boolean) => {
    console.log(
      `[KioskMotionWrapper] 얼굴 감지 상태: ${detected ? '감지됨' : '감지되지 않음'}`,
    )
  }

  return (
    <KioskMotionTracker debug={debug} onFaceDetected={handleFaceDetected} />
  )
}

// MotionProvider로 감싼 컴포넌트 내보내기
const KioskMotionWrapper: React.FC<KioskMotionWrapperProps> = ({
  debug = false,
}) => {
  return (
    <MotionProvider initialActive={true}>
      <KioskMotionComponent debug={debug} />
    </MotionProvider>
  )
}

export default KioskMotionWrapper
