// pages/motion/HeadMotionPage.tsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BackgroundMotionService from '../../features/motion/services/BackgroundMotionService'
import AuthService from '../../features/motion/services/AuthService'
import { MotionEventBus } from '../../features/motion/services/MotionEventBus'
import styled from '@emotion/styled'

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #222;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
`

const Header = styled.header`
  margin-bottom: 30px;
`

const Title = styled.h1`
  font-size: 28px;
  margin-bottom: 10px;
  color: #fff;
`

const Description = styled.p`
  font-size: 16px;
  color: #bbb;
  margin-bottom: 20px;
  line-height: 1.5;
`

const ButtonContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 30px;
`

const Button = styled.button`
  padding: 12px 20px;
  background-color: #444;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #555;
  }
`

const PrimaryButton = styled(Button)`
  background-color: #2196f3;
  &:hover {
    background-color: #1976d2;
  }
`

const SuccessButton = styled(Button)`
  background-color: #4caf50;
  &:hover {
    background-color: #388e3c;
  }
`

const DangerButton = styled(Button)`
  background-color: #f44336;
  &:hover {
    background-color: #d32f2f;
  }
`

const EventLogContainer = styled.div`
  margin-top: 30px;
  background-color: #333;
  border-radius: 8px;
  padding: 15px;
  height: 200px;
  overflow-y: auto;
`

const EventItem = styled.div<{ eventType: string }>`
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 4px;
  background-color: ${(props) => {
    switch (props.eventType) {
      case 'HEAD_SHAKE':
        return 'rgba(244, 67, 54, 0.2)'
      case 'HEAD_NOD':
        return 'rgba(76, 175, 80, 0.2)'
      default:
        return 'rgba(158, 158, 158, 0.2)'
    }
  }};
  color: ${(props) => {
    switch (props.eventType) {
      case 'HEAD_SHAKE':
        return '#f44336'
      case 'HEAD_NOD':
        return '#4caf50'
      default:
        return '#ccc'
    }
  }};
`

const StatusBox = styled.div<{ active: boolean }>`
  padding: 15px;
  margin-bottom: 20px;
  background-color: ${(props) =>
    props.active ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)'};
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const StatusIndicator = styled.div<{ active: boolean }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${(props) => (props.active ? '#4caf50' : '#f44336')};
  margin-right: 10px;
`

const StatusText = styled.span<{ active: boolean }>`
  color: ${(props) => (props.active ? '#4caf50' : '#f44336')};
  font-weight: bold;
`

export const HeadMotionPage: React.FC = () => {
  const navigate = useNavigate()
  const [eventLog, setEventLog] = useState<
    Array<{ type: string; timestamp: string }>
  >([])
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [motionActive, setMotionActive] = useState(false)

  // 모션 이벤트 및 로그인 상태 감시
  useEffect(() => {
    // 모션 이벤트 구독
    const subscription = MotionEventBus.subscribe((event) => {
      console.log(`모션 감지: ${event.type}`, event)

      // 이벤트 로그에 추가
      const timestamp = new Date().toLocaleTimeString()
      setEventLog((prev) =>
        [
          {
            type: event.type,
            timestamp,
          },
          ...prev,
        ].slice(0, 20),
      )
    })

    // 인증 상태 변경 리스너
    const handleAuthChange = (event: any) => {
      const { type } = event.detail
      setIsLoggedIn(type === 'login')
    }

    // 인증 상태 변경 리스너 등록
    AuthService.addAuthStateListener(handleAuthChange)

    // 초기 상태 설정
    setIsLoggedIn(AuthService.isLoggedIn())
    setMotionActive(BackgroundMotionService.isRunning())

    // 주기적으로 모션 서비스 상태 체크
    const interval = setInterval(() => {
      setMotionActive(BackgroundMotionService.isRunning())
    }, 1000)

    return () => {
      subscription.unsubscribe()
      AuthService.removeAuthStateListener(handleAuthChange)
      clearInterval(interval)
    }
  }, [])

  // 로그인 시뮬레이션
  const handleLoginSimulation = () => {
    AuthService.login({ id: 'user123', name: '테스트 사용자' })
  }

  // 로그아웃 시뮬레이션
  const handleLogoutSimulation = () => {
    AuthService.logout()
  }

  // 백그라운드 모션 서비스 직접 제어
  const handleStartMotionService = () => {
    BackgroundMotionService.start()
  }

  const handleStopMotionService = () => {
    BackgroundMotionService.stop()
  }

  return (
    <Container>
      <Header>
        <Title>모션 인식 테스트 페이지</Title>
        <Description>
          얼굴 모션으로 도리도리(좌우)와 끄덕임(상하) 동작을 인식할 수 있습니다.
          로그인 상태에 따라 자동으로 활성화/비활성화됩니다.
        </Description>
      </Header>

      <StatusBox active={isLoggedIn}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <StatusIndicator active={isLoggedIn} />
          <span>로그인 상태: </span>
          <StatusText active={isLoggedIn}>
            {isLoggedIn ? '로그인됨' : '로그아웃됨'}
          </StatusText>
        </div>
        <span style={{ color: '#888' }}>
          ({isLoggedIn ? '로그아웃' : '로그인'} 버튼을 눌러 테스트)
        </span>
      </StatusBox>

      <StatusBox active={motionActive}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <StatusIndicator active={motionActive} />
          <span>모션 인식: </span>
          <StatusText active={motionActive}>
            {motionActive ? '활성화됨' : '비활성화됨'}
          </StatusText>
        </div>
        <span style={{ color: '#888' }}>
          (로그인 상태에 따라 자동으로 변경됨)
        </span>
      </StatusBox>

      <ButtonContainer>
        <Button onClick={() => navigate('/')}>홈으로</Button>

        {isLoggedIn ? (
          <DangerButton onClick={handleLogoutSimulation}>
            로그아웃 시뮬레이션
          </DangerButton>
        ) : (
          <SuccessButton onClick={handleLoginSimulation}>
            로그인 시뮬레이션
          </SuccessButton>
        )}
      </ButtonContainer>

      <ButtonContainer>
        <PrimaryButton
          onClick={handleStartMotionService}
          disabled={motionActive}
        >
          모션 인식 시작 (수동)
        </PrimaryButton>
        <DangerButton
          onClick={handleStopMotionService}
          disabled={!motionActive}
        >
          모션 인식 중지 (수동)
        </DangerButton>
      </ButtonContainer>

      <h3 style={{ color: '#ccc', marginTop: '30px' }}>모션 감지 로그</h3>
      <EventLogContainer>
        {eventLog.length === 0 ? (
          <p style={{ color: '#888' }}>아직 감지된 모션이 없습니다.</p>
        ) : (
          eventLog.map((event, index) => (
            <EventItem key={index} eventType={event.type}>
              [{event.timestamp}]{' '}
              {event.type === 'HEAD_SHAKE' ? '도리도리' : '끄덕임'}
            </EventItem>
          ))
        )}
      </EventLogContainer>

      <div
        style={{
          marginTop: '30px',
          padding: '15px',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          borderRadius: '6px',
        }}
      >
        <h3 style={{ margin: '0 0 10px 0', color: '#2196f3' }}>
          백그라운드 모드 정보
        </h3>
        <p style={{ color: '#aaa', lineHeight: '1.6' }}>
          현재 모션 인식은 백그라운드에서 돌아가고 있습니다. 이 페이지를 닫아도
          로그인 상태가 유지되는 동안 계속 작동합니다. 실제 프로덕션 환경에서는
          로그인 시 자동으로 활성화되고, 로그아웃 시 비활성화됩니다.
        </p>
      </div>
    </Container>
  )
}

export default HeadMotionPage
