import { motion } from 'framer-motion'
import { Text } from '@/styles/typography'

interface SlotDigitProps {
  digit: number
  delay?: number
}

export const SlotDigit: React.FC<SlotDigitProps> = ({ digit, delay = 0 }) => {
  const lineHeightRem = 4.5 // rem 기준 (4.5rem = 72px)

  return (
    <div className="overflow-hidden h-[4.5rem] w-[2.5rem] inline-block relative">
      <motion.div
        initial={{ y: '-100%' }}
        animate={{ y: `-${digit * lineHeightRem}rem` }}
        transition={{
          duration: 1,
          delay,
          ease: 'easeOut',
        }}
      >
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="h-[4.5rem] flex items-center justify-center text-center"
          >
            <Text
              variant="title1"
              weight="bold"
              fontFamily="Suite"
              className="text-blue-600"
            >
              {i}
            </Text>
          </div>
        ))}
      </motion.div>
    </div>
  )
}
