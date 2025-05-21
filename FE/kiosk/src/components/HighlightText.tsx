import { motion } from 'framer-motion'
import React, { useEffect, useState } from 'react'

interface HighlightTextProps {
  children: React.ReactNode
  trigger: any // 부모에서 넘겨주는 재실행용 값 (ex. index나 고유 키)
  delay?: number
}

export const HighlightText: React.FC<HighlightTextProps> = ({
  children,
  trigger,
  delay = 0,
}) => {
  const [play, setPlay] = useState(false)

  useEffect(() => {
    setPlay(false) // 애니메이션 초기화
    const timeout = setTimeout(() => setPlay(true), 10) // 살짝 딜레이 후 재실행
    return () => clearTimeout(timeout)
  }, [trigger])

  return (
    <span className="relative inline-block">
      {play && (
        <motion.span
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{
            duration: 0.6,
            ease: 'easeOut',
            delay,
          }}
          className="absolute bottom-1 left-0 h-[0.6em] bg-yellow-200 z-0 rounded-sm"
        />
      )}
      <span className="relative z-10 font-semibold text-black">{children}</span>
    </span>
  )
}
