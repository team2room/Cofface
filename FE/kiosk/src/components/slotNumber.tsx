import React from 'react'
import { SlotDigit } from './slotDigit'

interface SlotNumberProps {
  number: number
}

const SlotNumber: React.FC<SlotNumberProps> = ({ number }) => {
  const digits = number.toString().padStart(2, '0').split('').map(Number)

  return (
    <div className="inline-flex">
      {digits.map((digit, idx) => (
        <SlotDigit key={idx} digit={digit} delay={idx * 0.1} />
      ))}
    </div>
  )
}

export default SlotNumber
