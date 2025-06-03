// src/components/common/Notification.tsx

import React, { useEffect } from 'react'

interface NotificationProps {
  show: boolean
  message: string
  type: 'success' | 'error' | 'info'
  onClose: () => void
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  autoClose?: boolean
  duration?: number
}

const Notification: React.FC<NotificationProps> = ({
  show,
  message,
  type,
  onClose,
  position = 'top-right',
  autoClose = true,
  duration = 5000,
}) => {
  // 알림 타입별 스타일 클래스
  const typeClasses = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  }

  // 알림 위치별 스타일 클래스
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  }

  // 자동 닫기 타이머
  useEffect(() => {
    if (show && autoClose) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [show, autoClose, duration, onClose])

  if (!show) return null

  return (
    <div
      className={`fixed ${positionClasses[position]} max-w-sm w-full ${typeClasses[type]} text-white p-4 rounded-md shadow-lg z-50 transition-all duration-300 transform translate-y-0 opacity-100`}
      role="alert"
    >
      <div className="flex justify-between items-center">
        <div className="flex-1">{message}</div>
        <button
          onClick={onClose}
          className="ml-4 text-white hover:text-gray-200 focus:outline-none"
          aria-label="Close"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default Notification
