//SECTION - 얼굴 등록 화면 헤더
import { colors } from '@/styles/colors'
import { Text } from '@/styles/typography'
import { NavArrowLeft } from 'iconoir-react'
import { useNavigate } from 'react-router-dom'
import tw from 'twin.macro'

const HeaderContainer = tw.div`
  flex
  p-6
  z-10
  items-center
  relative
  bg-black
`

const BackButton = tw.button`
  absolute
  left-6
`

const TitleContainer = tw.div`
  flex-1
  flex
  justify-center
`

export default function CaptureHeader() {
  const navigate = useNavigate()

  const handleBack = () => {
    navigate('/register/face')
  }

  return (
    <HeaderContainer>
      <BackButton onClick={handleBack}>
        <NavArrowLeft
          height={24}
          width={24}
          strokeWidth={2}
          color={colors.white}
        />
      </BackButton>
      <TitleContainer>
        <Text variant="body2" weight="bold" color="white">
          얼굴 등록
        </Text>
      </TitleContainer>
    </HeaderContainer>
  )
}
