import tw from 'twin.macro'
import { Text } from '@/styles/typography'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

const HeaderContainer = tw.div`w-full flex justify-between items-center my-4`
const TimeBox = tw.div`flex w-[250px] justify-center border-b-2 border-gray`

interface HeaderProps {
  isMember: boolean
  userName?: string
  onTimeout?: () => void
}

export default function Header({ isMember, userName, onTimeout }: HeaderProps) {
  const navigate = useNavigate()
  const [remainingSeconds, setRemainingSeconds] = useState(180)

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          onTimeout?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <HeaderContainer>
      <div>
        <Text variant="body2" weight="bold" color="darkGray">
          {isMember ? `${userName}님, 반갑습니다😊` : '처음 오셨나요?😊'}
        </Text>
      </div>

      <TimeBox>
        <Text variant="body2" weight="bold">
          남은 시간 :
        </Text>
        <div className="w-[60px] text-end">
          <Text variant="body2" weight="extrabold" className="text-red-600">
            {remainingSeconds}
          </Text>
        </div>
        <Text variant="body2" weight="bold">
          초
        </Text>
      </TimeBox>

      <div
        className="flex items-center px-2 py-1 rounded-lg"
        onClick={() => navigate('/user')}
        style={{
          boxShadow: `1.462px 1.462px 4px 2px #f774a275`,
        }}
      >
        <img src="/home.png" alt="홈" sizes="45" />
        <Text variant="body2" weight="bold" color="main">
          처음으로
        </Text>
      </div>
    </HeaderContainer>
  )
}
