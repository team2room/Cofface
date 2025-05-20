import tw from 'twin.macro'
import { Text } from '@/styles/typography'
import { useNavigate } from 'react-router-dom'
import { useLogout } from '@/features/userLogin/hooks/useLogout'
import { useUserStore } from '@/stores/loginStore'
import { maskName } from '@/utils/maskUserName'

const HeaderContainer = tw.div`w-full flex justify-between items-center mt-4 mb-8 px-7`
const TimeBox = tw.div`flex w-[250px] justify-center border-b-2 border-gray`

interface HeaderProps {
  remainingSeconds: number
}

export default function Header({ remainingSeconds }: HeaderProps) {
  const navigate = useNavigate()
  const { logout } = useLogout()
  const token = useUserStore((state) => state.token)
  const userName = useUserStore((state) => state.user?.name)
  const { isMember } = useUserStore()

  const handleHomeClick = async () => {
    if (isMember) {
      await logout(1)
    }
    navigate('/user')
  }

  return (
    <HeaderContainer>
      <div>
        <Text variant="body2" weight="bold" color="darkGray">
          {token
            ? `${maskName(userName || '')}님, 반갑습니다😊`
            : '처음 오셨나요?😊'}
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
        onClick={handleHomeClick}
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
