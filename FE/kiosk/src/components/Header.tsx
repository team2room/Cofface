import tw from 'twin.macro'
import { Text } from '@/styles/typography'
import { useNavigate } from 'react-router-dom'

const HeaderContainer = tw.div`w-full flex justify-between items-center mb-4`
const Actions = tw.div`flex items-center gap-8`

interface HeaderProps {
  isMember: boolean
  userName?: string
}

export default function Header({ isMember, userName }: HeaderProps) {
  const navigate = useNavigate()

  return (
    <HeaderContainer>
      <Text variant="body2" weight="bold" color="darkGray">
        {isMember ? `${userName}님, 반갑습니다😊` : '처음 오셨나요?😊'}
      </Text>
      <Actions>
        <div>남은 시간</div>
        <Text
          variant="body2"
          weight="bold"
          color="main"
          className="underline"
          onClick={() => navigate('/user')}
        >
          처음으로
        </Text>
      </Actions>
    </HeaderContainer>
  )
}
