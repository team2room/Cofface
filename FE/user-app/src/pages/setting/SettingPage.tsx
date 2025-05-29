import DetailHeader from '@/components/DetailHeader'
import { useAuth } from '@/features/login/hooks/useAuth'
import { Text } from '@/styles/typography'
import { useNavigate } from 'react-router-dom'
import tw from 'twin.macro'

const Container = tw.div`
  w-full max-w-screen-sm mx-auto flex flex-col h-screen pb-4
`
const HeaderWrapper = tw.div`
  sticky top-0 z-10 bg-white w-full
`
const ContentContainer = tw.div`
  flex-1 overflow-auto px-4 pt-2
`
const SectionWrapper = tw.div`
  mt-3
`
const SectionTitle = tw.div`
  ml-2 mb-2
`
const MenuItem = tw.div`
  flex justify-between items-center py-3 px-2
`

export function SettingPage() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  return (
    <Container>
      <HeaderWrapper>
        <DetailHeader title="설정" />
      </HeaderWrapper>
      <ContentContainer>
        {/* 내 정보 관리 */}
        <SectionWrapper>
          <SectionTitle>
            <Text variant="caption1" weight="bold" color="main">
              내 정보 관리
            </Text>
          </SectionTitle>
          <MenuItem onClick={() => {}}>
            <Text variant="body1">얼굴 등록 변경</Text>
          </MenuItem>
          <MenuItem
            onClick={() => {
              navigate('/setting/pay')
            }}
          >
            <Text variant="body1">결제 수단 관리</Text>
          </MenuItem>
          <MenuItem
            onClick={() => {
              navigate('/survey')
            }}
          >
            <Text variant="body1">선호 메뉴/옵션 변경</Text>
          </MenuItem>
        </SectionWrapper>
        {/* 설정 - 구색맞추기용 */}
        <SectionWrapper>
          <SectionTitle>
            <Text variant="caption1" weight="bold" color="main">
              설정
            </Text>
          </SectionTitle>
          <MenuItem>
            <Text variant="body1">알림 설정</Text>
          </MenuItem>
        </SectionWrapper>
        {/* 기타 - 구색맞추기용 */}
        <SectionWrapper>
          <SectionTitle>
            <Text variant="caption1" weight="bold" color="main">
              기타
            </Text>
          </SectionTitle>
          <MenuItem>
            <Text variant="body1">COFFACE 가 궁금해요</Text>
          </MenuItem>
          <MenuItem>
            <Text variant="body1">고객센터</Text>
          </MenuItem>
          <MenuItem>
            <Text variant="body1">
              <a href="https://cofface.netlify.app/">서비스 이용약관</a>
            </Text>
          </MenuItem>
          <MenuItem>
            <Text variant="body1">
              <a href="https://cofface.netlify.app/privacy">
                개인정보처리 방침
              </a>
            </Text>
          </MenuItem>
          <MenuItem>
            <Text variant="body1">버전 정보</Text>
            <Text variant="body1" color="darkGray">
              0.0.1
            </Text>
          </MenuItem>
        </SectionWrapper>
        <div className="border-t border-pay mt-4 py-4">
          <MenuItem onClick={() => logout()}>
            <Text variant="body1">로그아웃</Text>
          </MenuItem>
          <MenuItem onClick={() => {}}>
            <Text variant="body1">탈퇴하기</Text>
          </MenuItem>
        </div>
      </ContentContainer>
    </Container>
  )
}
