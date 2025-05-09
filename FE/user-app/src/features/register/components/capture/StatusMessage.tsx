import { StatusMessageProps } from '@/interfaces/RegisterInterfaces'
import { Text } from '@/styles/typography'
import styled from '@emotion/styled'

// 상태 메시지 스타일
export const StatusMessageContainer = styled.div`
  margin-top: 16px;
  padding: 12px 16px;
  border-radius: 12px;
  background-color: rgba(0, 0, 0, 0.5);
  width: 100%;
`

export function StatusMessage({ message }: StatusMessageProps) {
  if (!message) return null

  return (
    <StatusMessageContainer>
      <Text variant="body1" weight="medium" color="white">
        {message}
      </Text>
    </StatusMessageContainer>
  )
}
