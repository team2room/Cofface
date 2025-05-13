import React from 'react'
import { ActionButtonProps } from '@/interfaces/RegisterInterfaces'
import { ActionButtonContainer } from '@/features/register/components/capture/styles'

const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  disabled = false,
  secondary = false,
  children,
}) => {
  return (
    <ActionButtonContainer
      onClick={onClick}
      disabled={disabled}
      secondary={secondary}
    >
      {children}
    </ActionButtonContainer>
  )
}

export default ActionButton
