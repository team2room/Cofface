// pages/motion/HeadMotionPage.tsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import HeadMotionTracker from '../../components/HeadShaking/HeadMotionTracker'
import { MotionEventBus } from '../../services/MotionEventBus'
import styled from '@emotion/styled'

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`

const Header = styled.header`
  margin-bottom: 30px;
`

const Title = styled.h1`
  font-size: 32px;
  margin-bottom: 10px;
`

const Description = styled.p`
  font-size: 18px;
  color: #666;
  margin-bottom: 20px;
`

const ButtonContainer = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
`

const Button = styled.button`
  padding: 12px 20px;
  background-color: #333;
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

const TestButton = styled(Button)`
  background-color: #2196f3;
  &:hover {
    background-color: #1976d2;
  }
`

const EventLogContainer = styled.div`
  margin-top: 30px;
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 15px;
  height: 200px;
  overflow-y: auto;
`

const EventItem = styled.div<{ eventType: string }>`
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 4px;
  background-color: ${props => {
    switch(props.eventType) {
      case 'QUICK_LEFT_TURN': return 'rgba(76, 175, 80, 0.2)';
      case 'QUICK_RIGHT_TURN': return 'rgba(33, 150, 243, 0.2)';
      case 'HEAD_SHAKE': return 'rgba(244, 67, 54, 0.2)';
      case 'HEAD_NOD': return 'rgba(255, 152, 0, 0.2)';
      default: return 'rgba(158, 158, 158, 0.2)';
    }
  }};
  color: ${props => {
    switch(props.eventType) {
      case 'QUICK_LEFT_TURN': return '#2e7d32';
      case 'QUICK_RIGHT_TURN': return '#1565c0';
      case 'HEAD_SHAKE': return '#c62828';
      case 'HEAD_NOD': return '#ef6c00';
      default: return '#424242';
    }
  }};
`

export const HeadMotionPage: React.FC = () => {
  const navigate = useNavigate()
  const [eventLog, setEventLog] = useState<Array<{type: string, timestamp: string}>>([])
  const [trackerEnabled, setTrackerEnabled] = useState(true)

  // 모션 이벤트 핸들러
  const handleMotionDetected = (motionType: string, data: any) => {
    console.log(`모션 감지: ${motionType}`, data)
    
    // 이벤트 로그에 추가
    const timestamp = new Date().toLocaleTimeString()
    setEventLog(prev => [{
      type: motionType,
      timestamp
    }, ...prev].slice(0, 20))
    
    // 전역 이벤트 버스에 발행
    MotionEventBus.publish({
      type: motionType,
      source: 'motion-page',
      data,
      timestamp: Date.now()
    })
    
    // 모션에 따른 특정 동작 실행
    switch(motionType) {
      case 'QUICK_LEFT_TURN':
        // 왼쪽 회전 시 특정 동작
        break
        
      case 'QUICK_RIGHT_TURN':
        // 오른쪽 회전 시 특정 동작
        break
        
      case 'HEAD_SHAKE':
        // 머리 흔들기 시 특정 동작
        break
        
      case 'HEAD_NOD':
        // 고개 끄덕임 시 특정 동작
        break
    }
  }
  
  return (
    <Container>
      <Header>
        <Title>머리 움직임 인식 시스템</Title>
        <Description>
          머리 움직임을 통해 다양한 동작을 제어할 수 있습니다.
          좌우 회전, 머리 흔들기, 고개 끄덕임 등의 제스처가 인식됩니다.
        </Description>
      </Header>
      
      <ButtonContainer>
        <Button onClick={() => navigate('/')}>홈으로</Button>
        <TestButton onClick={() => navigate('/motion/test')}>테스트 모드</TestButton>
        <Button onClick={() => setTrackerEnabled(!trackerEnabled)}>
          {trackerEnabled ? '인식 일시정지' : '인식 재개'}
        </Button>
      </ButtonContainer>
      
      {trackerEnabled && (
        <HeadMotionTracker 
          onMotionDetected={handleMotionDetected}
          debug={true}
        />
      )}
      
      <EventLogContainer>
        <h3>모션 감지 로그</h3>
        {eventLog.length === 0 ? (
          <p>아직 감지된 모션이 없습니다.</p>
        ) : (
          eventLog.map((event, index) => (
            <EventItem key={index} eventType={event.type}>
              [{event.timestamp}] {event.type}
            </EventItem>
          ))
        )}
      </EventLogContainer>
    </Container>
  )
}