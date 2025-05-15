import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

type Ripple = {
  x: number
  y: number
  id: number
}

export default function GlobalRippleEffect() {
  const [ripples, setRipples] = useState<Ripple[]>([])

  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      const id = Date.now()
      const x = e.clientX
      const y = e.clientY
      setRipples((prev) => [...prev, { x, y, id }])

      // 500ms 뒤 ripple 제거
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id))
      }, 500)
    }

    window.addEventListener('pointerdown', handlePointerDown)
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [])

  return createPortal(
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute w-16 h-16 rounded-full bg-yellow-300 opacity-70 animate-[ripple_0.6s_ease-out]"
          style={{
            left: ripple.x - 32,
            top: ripple.y - 32,
          }}
        />
      ))}
    </div>,
    document.body,
  )
}
