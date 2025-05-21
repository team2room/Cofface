import { useEffect, useRef } from 'react'

type GestureType = 'nod' | 'shake'

interface GestureDetectorProps {
  enabled: boolean
  onNodDetected: () => void
  onShakeDetected: () => void
}

export default function GestureDetector({
  enabled,
  onNodDetected,
  onShakeDetected,
}: GestureDetectorProps) {
  const socketRef = useRef<WebSocket | null>(null)
  // 웹소켓 연결 시작
  const startGestureDetection = () => {
    if (socketRef.current) {
      socketRef.current.close()
    }

    // 웹소켓 URL 생성
    const hostname = window.location.hostname || 'localhost'
    // const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `ws://${hostname}:8080/ws/gesture`

    console.log(`제스처 감지 연결 시작: ${wsUrl}`)

    const socket = new WebSocket(wsUrl)
    socketRef.current = socket

    socket.onopen = () => {
      console.log('웹소켓 연결 성공! 제스처 감지 시작')
    }

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data)

      switch (data.type) {
        case 'gesture_detected':
          const gestureName = data.gesture_name
          const gestureType = data.gesture_type as GestureType

          console.log(`제스처 감지됨: ${gestureName}`)

          // 감지된 제스처에 따라 콜백 실행
          if (gestureType === 'nod') {
            onNodDetected()
          } else if (gestureType === 'shake') {
            onShakeDetected()
          }
          break

        case 'error':
          console.error(`오류: ${data.message}`)
          break
      }
    }

    socket.onclose = () => {
      console.log('웹소켓 연결이 종료되었습니다.')
      socketRef.current = null
    }

    socket.onerror = (error) => {
      console.error('웹소켓 오류:', error)
    }
  }

  // 웹소켓 연결 종료
  const stopGestureDetection = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      console.log('제스처 감지 중지 요청 전송...')
      socketRef.current.send(JSON.stringify({ type: 'stop' }))
    } else {
      console.log('연결이 없거나 이미 닫혔습니다.')
    }
  }

  // enabled 상태가 변경될 때 웹소켓 연결 관리
  useEffect(() => {
    if (enabled) {
      startGestureDetection()
    } else {
      stopGestureDetection()
    }

    // 컴포넌트 언마운트 시 웹소켓 연결 종료
    return () => {
      if (socketRef.current) {
        socketRef.current.close()
      }
    }
  }, [enabled])

  return <></>
}
