import { useRef } from 'react'

export function useDragScroll<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  const isDragging = useRef(false)
  const startY = useRef(0)
  const scrollTop = useRef(0)

  const onMouseDown = (e: React.MouseEvent) => {
    if (!ref.current) return
    isDragging.current = true
    startY.current = e.clientY
    scrollTop.current = ref.current.scrollTop
  }

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !ref.current) return
    const dy = e.clientY - startY.current
    ref.current.scrollTop = scrollTop.current - dy
  }

  const onMouseUp = () => {
    isDragging.current = false
  }

  return {
    ref,
    onMouseDown,
    onMouseMove,
    onMouseUp,
  }
}
