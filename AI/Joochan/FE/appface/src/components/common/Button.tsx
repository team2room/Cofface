// src/components/common/Button.tsx

import React from 'react'

interface ButtonProps {
  onClick?: (e?: any) => void
  disabled?: boolean
  type?: 'primary' | 'secondary' | 'danger' | 'success' | 'submit'
  size?: 'small' | 'medium' | 'large'
  className?: string
  children: React.ReactNode
}

const Button: React.FC<ButtonProps> = ({
  onClick,
  disabled = false,
  type = 'primary',
  size = 'medium',
  className = '',
  children,
}) => {
  // 버튼 타입별 스타일 클래스
  const typeClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-500 hover:bg-gray-600 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    submit: 'bg-teal-500 hover:bg-teal-600 text-white',
  }

  // 버튼 크기별 스타일 클래스
  const sizeClasses = {
    small: 'px-2 py-1 text-sm',
    medium: 'px-4 py-2',
    large: 'px-6 py-3 text-lg',
  }

  // 기본 버튼 스타일
  const baseClasses =
    'font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'

  // 비활성화 스타일
  const disabledClasses = disabled
    ? 'opacity-50 cursor-not-allowed'
    : 'cursor-pointer'

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${typeClasses[type]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
    >
      {children}
    </button>
  )
}

export default Button
