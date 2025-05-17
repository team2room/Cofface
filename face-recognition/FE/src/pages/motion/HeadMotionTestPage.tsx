// pages/motion/HeadMotionTestPage.tsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import HeadMotionTracker from '../../features/motion/components/HeadMotionTracker'
import { MotionDetector } from '../../features/motion/services/MotionDetectorService'
import styled from '@emotion/styled'

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`

const Header = styled.header`
  margin-bottom: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const Title = styled.h1`
  font-size: 28px;
  margin: 0;
`

const Button = styled.button`
  padding: 10px 15px;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background-color: #555;
  }
`

const Content = styled.div`
  display: flex;
  gap: 20px;
`

const LeftPanel = styled.div`
  flex: 1.5;
`

const RightPanel = styled.div`
  flex: 1;
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 20px;
`

const SettingsSection = styled.div`
  margin-bottom: 20px;
`

const SettingLabel = styled.label`
  display: block;
  margin-bottom: 15px;
  font-weight: bold;
`

const SettingInput = styled.input`
  width: 100%;
  padding: 8px;
  margin-top: 5px;
  box-sizing: border-box;
`

const TestResultSection = styled.div`
  margin-top: 30px;
`

const TestResult = styled.div<{ success: boolean }>`
  padding: 15px;
  border-radius: 8px;
  background-color: ${(props) =>
    props.success ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)'};
  color: ${(props) => (props.success ? '#2e7d32' : '#c62828')};
  margin-bottom: 10px;
`

export const HeadMotionTestPage: React.FC = () => {
  const navigate = useNavigate()

  // 초기 설정 가져오기
  const [settings, setSettings] = useState(() => {
    // 초기 설정은 MotionDetector의 현재 설정을 사용
    return MotionDetector.getCurrentSettings()
  })

  // 테스트 결과
  const [testResults, setTestResults] = useState<
    Array<{
      type: string
      success: boolean
      timestamp: string
    }>
  >([])

  // 테스트 미션
  const [currentMission, setCurrentMission] = useState<string | null>(null)
  const missions = [
    '왼쪽으로 고개 돌리기',
    '오른쪽으로 고개 돌리기',
    '고개 좌우로 흔들기',
    '고개 끄덕이기',
  ]

  // 미션 시작
  const startRandomMission = () => {
    const randomIndex = Math.floor(Math.random() * missions.length)
    setCurrentMission(missions[randomIndex])

    // 10초 후 미션 종료
    setTimeout(() => {
      setCurrentMission(null)
    }, 10000)
  }

  // 설정 변경 핸들러
  const handleSettingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    const updatedSettings = {
      ...settings,
      [name]: parseFloat(value),
    }

    setSettings(updatedSettings)
    // 변경된 설정 즉시 적용
    MotionDetector.updateSettings(updatedSettings)
  }

  // 모션 이벤트 핸들러
  const handleMotionDetected = (motionType: string, data: any) => {
    // 현재 미션이 있는 경우만 처리
    if (currentMission) {
      let success = false

      // 미션과 감지된 모션 비교
      if (
        (currentMission === '왼쪽으로 고개 돌리기' &&
          motionType === 'QUICK_LEFT_TURN') ||
        (currentMission === '오른쪽으로 고개 돌리기' &&
          motionType === 'QUICK_RIGHT_TURN') ||
        (currentMission === '고개 좌우로 흔들기' &&
          motionType === 'HEAD_SHAKE') ||
        (currentMission === '고개 끄덕이기' && motionType === 'HEAD_NOD')
      ) {
        success = true
        // 미션 종료
        setCurrentMission(null)
      }

      // 결과 기록
      setTestResults((prev) =>
        [
          {
            type: motionType,
            success,
            timestamp: new Date().toLocaleTimeString(),
          },
          ...prev,
        ].slice(0, 10),
      )
    }
  }

  const applyHeadShakeOptimization = () => {
    const optimizedSettings = {
      yawThreshold: 8,
      yawVelocityThreshold: 0.08,
      pitchThreshold: 8,
      eventCooldown: 1200,
    }

    setSettings(optimizedSettings)
    MotionDetector.updateSettings(optimizedSettings)
    alert('도리도리/끄덕임 최적화 설정이 적용되었습니다.')
  }

  // 설정 업데이트
  useEffect(() => {
    // 필요한 경우 모션 감지기 설정값 업데이트
    // MotionDetector 인스턴스가 싱글톤으로 관리되는 경우 사용
    const detector = MotionDetector.getInstance()
    detector.updateSettings(settings)
  }, [settings])

  return (
    <Container>
      <Header>
        <Title>모션 인식 테스트 및 설정</Title>
        <Button onClick={() => navigate('/motion')}>
          기본 모드로 돌아가기
        </Button>
      </Header>

      <Content>
        <LeftPanel>
          <HeadMotionTracker
            onMotionDetected={handleMotionDetected}
            debug={true}
          />

          {currentMission && (
            <div
              style={{
                marginTop: '20px',
                padding: '15px',
                backgroundColor: 'rgba(33, 150, 243, 0.2)',
                color: '#0d47a1',
                borderRadius: '8px',
                fontSize: '18px',
                fontWeight: 'bold',
                textAlign: 'center',
              }}
            >
              미션: {currentMission}
            </div>
          )}

          {!currentMission && (
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <Button
                onClick={startRandomMission}
                style={{
                  padding: '15px 30px',
                  fontSize: '16px',
                  backgroundColor: '#2196f3',
                }}
              >
                모션 인식 테스트 시작
              </Button>
            </div>
          )}
        </LeftPanel>

        <RightPanel>
          <SettingsSection>
            <h2>모션 감지 설정</h2>

            <SettingLabel>
              Yaw 변화 임계값 ({settings.yawThreshold}°)
              <SettingInput
                type="range"
                name="yawThreshold"
                min="5"
                max="30"
                step="1"
                value={settings.yawThreshold}
                onChange={handleSettingChange}
              />
            </SettingLabel>

            <SettingLabel>
              Yaw 속도 임계값 ({settings.yawVelocityThreshold})
              <SettingInput
                type="range"
                name="yawVelocityThreshold"
                min="0.05"
                max="0.3"
                step="0.01"
                value={settings.yawVelocityThreshold}
                onChange={handleSettingChange}
              />
            </SettingLabel>

            <SettingLabel>
              Pitch 변화 임계값 ({settings.pitchThreshold}°)
              <SettingInput
                type="range"
                name="pitchThreshold"
                min="5"
                max="30"
                step="1"
                value={settings.pitchThreshold}
                onChange={handleSettingChange}
              />
            </SettingLabel>

            <SettingLabel>
              이벤트 쿨다운 ({settings.eventCooldown}ms)
              <SettingInput
                type="range"
                name="eventCooldown"
                min="500"
                max="2000"
                step="100"
                value={settings.eventCooldown}
                onChange={handleSettingChange}
              />
            </SettingLabel>
          </SettingsSection>

          <TestResultSection>
            <h2>테스트 결과</h2>

            {testResults.length === 0 ? (
              <p>아직 테스트 결과가 없습니다.</p>
            ) : (
              testResults.map((result, index) => (
                <TestResult key={index} success={result.success}>
                  <div>
                    <b>감지된 모션:</b> {result.type}
                  </div>
                  <div>
                    <b>결과:</b> {result.success ? '성공' : '실패'}
                  </div>
                  <div>
                    <b>시간:</b> {result.timestamp}
                  </div>
                </TestResult>
              ))
            )}
          </TestResultSection>
          <Button
            onClick={applyHeadShakeOptimization}
            style={{
              backgroundColor: '#4caf50',
              marginBottom: '15px',
            }}
          >
            도리도리/끄덕임 최적화 설정 적용
          </Button>
        </RightPanel>
      </Content>
    </Container>
  )
}
