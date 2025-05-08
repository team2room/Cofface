import styled from '@emotion/styled';
import { FaceCircleProps, TimerCircleProps } from '../types';

// 메인 컨테이너
export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  height: 100vh;
  background-color: #000000;
  color: white;
  font-family: 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif;
  box-sizing: border-box;
`;

export const ContentWrapper = styled.div`
  display: flex;
  width: 100%;
  max-width: 1200px;
  margin-top: 20px;
  gap: 20px;
`;

export const CameraColumn = styled.div`
  flex: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const InfoColumn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const BackButton = styled.button`
  position: absolute;
  top: 20px;
  left: 20px;
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
`;

export const FaceCircle = styled.div<FaceCircleProps>`
  position: relative;
  width: 300px;
  height: 300px;
  margin-bottom: 40px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid ${(props) => props.borderColor || '#333'};
  transition: border-color 0.3s ease;
`;

export const VideoContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

export const Video = styled.video`
  position: absolute;
  top: 50%;
  left: 50%;
  min-width: 100%;
  min-height: 100%;
  width: auto;
  height: auto;
  transform: translateX(-50%) translateY(-50%) scaleX(-1);
`;

export const Canvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform: scaleX(-1); // 캔버스도 비디오와 동일하게 좌우 반전
`;

export const GuideLine = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
`;

export const Message = styled.div`
  font-size: 22px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 10px;
`;

export const SubMessage = styled.div`
  font-size: 16px;
  text-align: center;
  margin-bottom: 30px;
  color: #aaa;
`;

export const Button = styled.button`
  width: 90%;
  padding: 15px;
  border-radius: 10px;
  background-color: #333;
  color: white;
  border: none;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

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
`;

// 디버그 패널 스타일 컴포넌트
export const DebugPanel = styled.div`
  width: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  border: 1px solid #555;
  border-radius: 8px;
  padding: 15px;
  font-family: monospace;
  color: #0f0;
`;

export const DebugCanvasContainer = styled.div`
  width: 100%;
  margin-bottom: 15px;
`;

export const DebugCanvas = styled.canvas`
  width: 100%;
  height: 180px;
  background-color: rgba(0, 0, 0, 0.7);
  border: 1px solid #555;
  border-radius: 8px;
`;

export const DebugValue = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
`;

// 색상 가이드 스타일 컴포넌트
export const ColorGuide = styled.div`
  width: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  border: 1px solid #555;
  border-radius: 8px;
  padding: 15px;
`;

export const ColorItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

export const ColorSwatch = styled.div<{ color: string }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${(props) => props.color};
  margin-right: 10px;
`;

// 타이머 원형 게이지 스타일 컴포넌트
export const TimerCircleContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
`;

export const TimerCircleSVG = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;

export const TimerCirclePath = styled.circle<TimerCircleProps>`
  fill: none;
  stroke: ${(props) => props.color};
  stroke-width: 8px;
  stroke-linecap: round;
  stroke-dasharray: 1570;
  stroke-dashoffset: ${(props) => 1570 * (1 - props.progress)};
  transition: stroke-dashoffset 0.3s ease;
  filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.5));
`;

// 단계 표시기 스타일 컴포넌트
export const ProgressStepsContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  width: 80%;
`;

export const ProgressStep = styled.div<{ active: boolean; completed: boolean }>`
  width: 40px;
  height: 8px;
  margin: 0 5px;
  border-radius: 4px;
  background-color: ${(props) =>
    props.completed
      ? '#4CAF50'
      : props.active
      ? '#2196F3'
      : 'rgba(255, 255, 255, 0.3)'};
  transition: background-color 0.3s ease;
`;

// 얼굴 가이드라인 컴포넌트
export const FaceGuideline = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 1;
  pointer-events: none;
`;

// 캡처된 이미지 그리드 스타일
export const CapturedImagesGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  max-width: 90%;
  margin: 0 auto 20px;
`;

export const CapturedImageContainer = styled.div`
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 10px;
  overflow: hidden;
  border: 2px solid #4caf50;
`;

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
`;

export const CapturedImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;