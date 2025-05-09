import styled from '@emotion/styled'
import { colors } from '@/styles/colors'

// 캡처 컨테이너 스타일
export const CaptureContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  flex: 1;
  position: relative;
`

// 메시지 스타일
export const Message = styled.div`
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 8px;
`

export const SubMessage = styled.div`
  font-size: 16px;
  text-align: center;
  margin-bottom: 16px;
  color: #aaa;
`

// 카메라 뷰 스타일
export const FaceCircle = styled.div<FaceCircleProps>`
  position: relative;
  width: 280px;
  height: 280px;
  margin-bottom: 24px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid ${(props) => props.borderColor || '#333'};
  transition: border-color 0.3s ease;
`

export const VideoContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`

export const Video = styled.video`
  position: absolute;
  top: 50%;
  left: 50%;
  min-width: 100%;
  min-height: 100%;
  width: auto;
  height: auto;
  transform: translateX(-50%) translateY(-50%) scaleX(-1);
`

export const Canvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform: scaleX(-1); // 캔버스도 비디오와 동일하게 좌우 반전
`

export const GuideLine = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
`

// 타이머 관련 스타일
export const TimerDisplay = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 24px;
  font-weight: bold;
  color: white;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
`

export const TimerCircleContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
`

export const TimerCircleSVG = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`

export const TimerCirclePath = styled.circle<TimerCircleProps>`
  fill: none;
  stroke: ${(props) => props.color};
  stroke-width: 8px;
  stroke-linecap: round;
  stroke-dasharray: 1570;
  stroke-dashoffset: ${(props) => 1570 * (1 - props.progress)};
  transition: stroke-dashoffset 0.3s ease;
  filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.5));
`

// 가이드라인 스타일
export const FaceGuideline = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 1;
  pointer-events: none;
`

// 버튼 스타일
export const ActionButtonContainer = styled.button<{ secondary?: boolean }>`
  width: 100%;
  padding: 16px;
  border-radius: 12px;
  background-color: ${(props) =>
    props.secondary ? 'transparent' : colors.main};
  color: white;
  border: ${(props) => (props.secondary ? `1px solid ${colors.main}` : 'none')};
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  margin-top: ${(props) => (props.secondary ? '12px' : '16px')};

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background-color: ${(props) => (props.secondary ? 'transparent' : '#666')};
  }
`

// 캡처된 이미지 스타일
export const CapturedImagesGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  width: 100%;
  margin: 0 auto 24px;
`

export const CapturedImageContainer = styled.div`
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid ${colors.main};
`

export const CapturedImageLabel = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  text-align: center;
  padding: 4px 0;
  font-size: 12px;
`

export const CapturedImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`
