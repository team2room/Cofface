import React, { useState, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import * as facemesh from '@mediapipe/face_mesh';
import * as camera_utils from '@mediapipe/camera_utils';
import * as drawing_utils from '@mediapipe/drawing_utils';

// 얼굴인식 상태 열거형
enum FaceDetectionState {
  INIT = 0,
  FRONT_FACE = 1,
  LEFT_FACE = 2,
  RIGHT_FACE = 3,
  UP_FACE = 4,
  DOWN_FACE = 5,
  COMPLETED = 6,
  VERIFYING = 7,
}

// 스타일 컴포넌트 타입 정의
interface FaceCircleProps {
  borderColor: string;
}

interface TimerCircleProps {
  progress: number;
  color: string;
}

interface ProgressStepProps {
  active: boolean;
  completed: boolean;
}

// 스타일 컴포넌트 정의
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #000000;
  color: white;
  font-family: 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif;
`;

const BackButton = styled.button`
  position: absolute;
  top: 20px;
  left: 20px;
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
`;

const FaceCircle = styled.div<FaceCircleProps>`
  position: relative;
  width: 300px;
  height: 300px;
  margin-bottom: 40px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid ${(props) => props.borderColor || '#333'};
`;

const VideoContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const Video = styled.video`
  position: absolute;
  top: 50%;
  left: 50%;
  min-width: 100%;
  min-height: 100%;
  width: auto;
  height: auto;
  transform: translateX(-50%) translateY(-50%) scaleX(-1);
`;

const Canvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform: scaleX(-1); // 캔버스도 비디오와 동일하게 좌우 반전
`;

const GuideLine = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
`;

const Message = styled.div`
  font-size: 22px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 10px;
`;

const SubMessage = styled.div`
  font-size: 16px;
  text-align: center;
  margin-bottom: 30px;
  color: #aaa;
`;

const Button = styled.button`
  width: 90%;
  padding: 15px;
  border-radius: 10px;
  background-color: #333;
  color: white;
  border: none;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
`;

const TimerDisplay = styled.div`
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

// 타이머 원형 게이지 스타일 컴포넌트
const TimerCircleContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
`;

const TimerCircleSVG = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;

const TimerCirclePath = styled.circle<TimerCircleProps>`
  fill: none;
  stroke: ${(props) => props.color};
  stroke-width: 8px; // 선 굵기 증가
  stroke-linecap: round;
  stroke-dasharray: 1570; /* 대략 원의 둘레 (2 * PI * R) */
  stroke-dashoffset: ${(props) =>
    1570 * (1 - props.progress)}; /* 진행도에 따라 변경 */
  transition: stroke-dashoffset 0.3s ease; // 부드러운 전환 효과
  filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.5)); // 발광 효과 추가
`;

// 단계 표시기 스타일 컴포넌트
const ProgressStepsContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  width: 80%;
`;

const ProgressStep = styled.div<ProgressStepProps>`
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
const FaceGuideline = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 1;
  pointer-events: none;
`;

// 색상 안내 컴포넌트
const ColorGuideContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 10px;
  font-size: 14px;
`;

const ColorGuideItem = styled.div`
  display: flex;
  align-items: center;
  margin: 5px 0;
`;

const ColorIndicator = styled.div<{ color: string }>`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: ${(props) => props.color};
  margin-right: 8px;
`;

// 회전 가이드 마커 컴포넌트 추가
const RotationMarker = styled.div`
  position: absolute;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: white;
  box-shadow: 0 0 5px rgba(255, 255, 255, 0.8);
`;

// 디버깅 패널
const DebugPanel = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: rgba(0, 0, 0, 0.7);
  padding: 10px;
  border-radius: 5px;
  font-size: 12px;
  z-index: 1000;
`;

// 한글 텍스트 처리를 위한 유틸리티 클래스
class KoreanTextUtil {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;

  constructor() {
    // 임시 캔버스 생성
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
  }

  // 한글 텍스트를 이미지로 변환
  public createTextImage(
    text: string,
    fontSize: number = 24,
    fontFamily: string = 'Noto Sans KR, sans-serif',
    color: string = 'white',
    backgroundColor: string = 'transparent'
  ): HTMLCanvasElement {
    if (!this.ctx) return this.canvas;

    // 폰트 설정
    this.ctx.font = `${fontSize}px ${fontFamily}`;

    // 텍스트 크기 측정
    const metrics = this.ctx.measureText(text);
    const textWidth = metrics.width;
    const textHeight = fontSize * 1.2; // 대략적인 텍스트 높이

    // 캔버스 크기 설정
    this.canvas.width = textWidth + 20; // 여백 추가
    this.canvas.height = textHeight + 10; // 여백 추가

    // 배경 설정
    this.ctx.fillStyle = backgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // 텍스트 설정 및 그리기
    this.ctx.font = `${fontSize}px ${fontFamily}`; // 폰트 재설정 (캔버스 리사이징 후 필요)
    this.ctx.fillStyle = color;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(text, this.canvas.width / 2, this.canvas.height / 2);

    return this.canvas;
  }

  // 한글 텍스트를 캔버스에 그리기 (반전 처리 개선)
  public drawTextToCanvas(
    targetCanvas: HTMLCanvasElement,
    text: string,
    x: number,
    y: number,
    fontSize: number = 24,
    color: string = 'white',
    backgroundColor: string = 'transparent'
  ): void {
    const textCanvas = this.createTextImage(
      text,
      fontSize,
      'Noto Sans KR, sans-serif',
      color,
      backgroundColor
    );
    const ctx = targetCanvas.getContext('2d');

    if (ctx) {
      // 캔버스 상태 저장
      ctx.save();

      // 좌우 반전 취소
      ctx.scale(-1, 1);
      ctx.translate(-targetCanvas.width, 0);

      // 좌우 반전 상태에서의 x 좌표 계산
      const flippedX = targetCanvas.width - x;

      // 텍스트 이미지 그리기
      ctx.drawImage(
        textCanvas,
        flippedX - textCanvas.width / 2,
        y - textCanvas.height / 2
      );

      // 캔버스 상태 복원
      ctx.restore();
    }
  }
}

// 벡터 내적 계산
const dotProduct = (a: {x: number, y: number, z: number}, b: {x: number, y: number, z: number}): number => {
  return a.x * b.x + a.y * b.y + a.z * b.z;
};

// 벡터 크기 계산
const vectorMagnitude = (v: {x: number, y: number, z: number}): number => {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
};

// 두 벡터 사이의 각도 계산 (라디안)
const angleBetweenVectors = (a: {x: number, y: number, z: number}, b: {x: number, y: number, z: number}): number => {
  const dot = dotProduct(a, b);
  const magA = vectorMagnitude(a);
  const magB = vectorMagnitude(b);
  
  // 내적을 벡터 크기의 곱으로 나누면 코사인 값
  // 부동소수점 오류 방지를 위해 -1 ~ 1 사이로 제한
  const cos = Math.max(-1, Math.min(1, dot / (magA * magB)));
  return Math.acos(cos);
};

interface FaceAngles {
  pitch: number;
  yaw: number;
  roll: number;
}

const FaceRecognition: React.FC = () => {
  const [detectionState, setDetectionState] = useState<FaceDetectionState>(
    FaceDetectionState.INIT
  );
  const [processing, setProcessing] = useState<boolean>(false);
  const [faceDetected, setFaceDetected] = useState<boolean>(false);
  const [stateTimer, setStateTimer] = useState<number>(0);
  const [timerProgress, setTimerProgress] = useState<number>(0); // 타이머 진행도 (0~1)
  const [borderColor, setBorderColor] = useState<string>('#333');
  const [modelsLoaded, setModelsLoaded] = useState<boolean>(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [stateStable, setStateStable] = useState<boolean>(false); // 상태 안정성 추적
  const [faceAngles, setFaceAngles] = useState<FaceAngles>({
    pitch: 0,
    yaw: 0,
    roll: 0,
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const koreanTextUtilRef = useRef<KoreanTextUtil | null>(null);
  const lastStateTime = useRef<number>(0); // 마지막 상태 변경 시간
  const lastTextUpdateRef = useRef<number>(0); // 텍스트 업데이트 타이밍 제어
  const TEXT_UPDATE_INTERVAL = 500; // 500ms마다 텍스트 업데이트
  const baselineAnglesRef = useRef<FaceAngles | null>(null); // 기준 각도 저장
  const rollMeasurements = useRef<number[]>([]); // Roll 측정값 버퍼

  // MediaPipe 관련 참조
  const faceMeshRef = useRef<facemesh.FaceMesh | null>(null);
  const cameraRef = useRef<camera_utils.Camera | null>(null);

  // 방향 신뢰도 점수
  const pitchUpConfidence = useRef<number>(0);
  const pitchDownConfidence = useRef<number>(0);
  const yawLeftConfidence = useRef<number>(0);
  const yawRightConfidence = useRef<number>(0);

  // 상태 메시지 캐싱
  const [displayStatusText, setDisplayStatusText] = useState<string>('');

  // 메시지와 서브메시지 설정
  const getMessage = (): string => {
    if (loadingError) {
      return '카메라 또는 모델 로딩 오류가 발생했습니다';
    }

    switch (detectionState) {
      case FaceDetectionState.INIT:
        return modelsLoaded
          ? '이수환님의 얼굴을 확인할게요'
          : '모델 로딩 중...';
      case FaceDetectionState.FRONT_FACE:
        return '정면을 바라봐주세요';
      case FaceDetectionState.LEFT_FACE:
        return '고개를 왼쪽으로 돌려주세요';
      case FaceDetectionState.RIGHT_FACE:
        return '고개를 오른쪽으로 돌려주세요';
      case FaceDetectionState.UP_FACE:
        return '고개를 들어 위를 바라봐주세요';
      case FaceDetectionState.DOWN_FACE:
        return '고개를 숙여 아래를 바라봐주세요';
      case FaceDetectionState.COMPLETED:
        return '좋아요!';
      case FaceDetectionState.VERIFYING:
        return '인증 처리 중...';
      default:
        return '';
    }
  };

  const getSubMessage = (): string => {
    if (loadingError) {
      return '페이지를 새로고침하거나 다시 시도해주세요';
    }

    switch (detectionState) {
      case FaceDetectionState.FRONT_FACE:
        return '얼굴이 화면을 벗어나면 안돼요';
      case FaceDetectionState.LEFT_FACE:
        return '왼쪽으로 약 30도 Yaw 회전해주세요';
      case FaceDetectionState.RIGHT_FACE:
        return '오른쪽으로 약 30도 Yaw 회전해주세요';
      case FaceDetectionState.UP_FACE:
        return '위쪽으로 약 30도 Pitch 회전해주세요';
      case FaceDetectionState.DOWN_FACE:
        return '아래쪽으로 약 30도 Pitch 회전해주세요';
      default:
        return '';
    }
  };

  // Roll 측정값을 평균화하는 함수
  const smoothRollMeasurement = (newValue: number): number => {
    // 새 측정값 추가
    rollMeasurements.current.push(newValue);
    
    // 배열 크기 제한
    if (rollMeasurements.current.length > 5) {
      rollMeasurements.current.shift();
    }
    
    // 평균 계산
    const sum = rollMeasurements.current.reduce((a, b) => a + b, 0);
    return sum / rollMeasurements.current.length;
  };

  // 한글 텍스트 유틸리티 초기화
  useEffect(() => {
    koreanTextUtilRef.current = new KoreanTextUtil();
  }, []);

  // 모델 로딩 후 상태 안정화 시간 설정
  useEffect(() => {
    if (
      detectionState !== FaceDetectionState.INIT &&
      detectionState !== FaceDetectionState.COMPLETED
    ) {
      // 새로운 상태로 변경될 때 안정화 시간 필요
      setStateStable(false);
      console.log('상태 변경: 안정화 대기 시작', FaceDetectionState[detectionState]);
  
      // 상태 변경 후 1초 후에 안정화 허용
      const timer = setTimeout(() => {
        setStateStable(true);
        lastStateTime.current = Date.now();
        console.log('상태 안정화 완료', FaceDetectionState[detectionState]);
      }, 1000);
  
      return () => clearTimeout(timer);
    }
  }, [detectionState]);

  // 상태 텍스트 업데이트 지연 처리
  useEffect(() => {
    // 상태가 변경될 때마다 캐시된 상태 메시지 업데이트
    const newStatusText = getStatusTextForState(detectionState);
    let timer: NodeJS.Timeout | null = null;

    // 1초 동안 같은 상태가 유지되면 표시 상태 업데이트
    timer = setTimeout(() => {
      setDisplayStatusText(newStatusText);
    }, 1000);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [detectionState]);

  // 현재 상태에 따른 텍스트 반환 함수
  const getStatusTextForState = (state: FaceDetectionState): string => {
    switch (state) {
      case FaceDetectionState.FRONT_FACE:
        return '정면을 응시해주세요';
      case FaceDetectionState.LEFT_FACE:
        return '왼쪽으로 고개를 돌려주세요';
      case FaceDetectionState.RIGHT_FACE:
        return '오른쪽으로 고개를 돌려주세요';
      case FaceDetectionState.UP_FACE:
        return '위쪽을 바라봐주세요';
      case FaceDetectionState.DOWN_FACE:
        return '아래쪽을 바라봐주세요';
      default:
        return '';
    }
  };

  // MediaPipe 얼굴 메시 모델 로드
  useEffect(() => {
    const loadFaceMeshModel = async () => {
      try {
        // FaceMesh 인스턴스 생성
        faceMeshRef.current = new facemesh.FaceMesh({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
          },
        });

        // 옵션 설정
        faceMeshRef.current.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        // 콜백 설정
        faceMeshRef.current.onResults(onFaceMeshResults);

        console.log('MediaPipe FaceMesh 모델 로딩 완료');
        setModelsLoaded(true);
      } catch (error) {
        console.error('모델 로딩 오류:', error);
        setLoadingError(
          `모델 로딩 오류: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    };

    loadFaceMeshModel();

    return () => {
      // 카메라 정리
      if (cameraRef.current) {
        cameraRef.current.stop();
      }

      // MediaPipe 정리
      if (faceMeshRef.current) {
        faceMeshRef.current.close();
      }

      // 비디오 스트림 정리
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // 비디오 시작
  const startVideo = async () => {
    if (!modelsLoaded || !faceMeshRef.current || !videoRef.current) {
      console.warn('모델이 아직 로드되지 않았습니다');
      return;
    }

    try {
      // 카메라 설정
      cameraRef.current = new camera_utils.Camera(videoRef.current, {
        onFrame: async () => {
          if (videoRef.current && faceMeshRef.current) {
            await faceMeshRef.current.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480,
      });

      // 카메라 시작
      await cameraRef.current.start();

      setDetectionState(FaceDetectionState.FRONT_FACE);
    } catch (error) {
      console.error('카메라 접근 오류:', error);
      setLoadingError(
        `카메라 접근 오류: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  };

  // 벡터 계산을 위한 도우미 함수
  const getVector = (
    p1: facemesh.NormalizedLandmark,
    p2: facemesh.NormalizedLandmark
  ) => ({
    x: p2.x - p1.x,
    y: p2.y - p1.y,
    z: p2.z - p1.z,
  });

  // MediaPipe 얼굴 랜드마크로 얼굴 방향 계산 (수정된 버전)
  const calculateFaceAngles = (
    landmarks: facemesh.NormalizedLandmarkList
  ): FaceAngles => {
    // 랜드마크 선택
    const nose = landmarks[1]; // 코 끝
    const forehead = landmarks[10]; // 이마 중앙
    const chin = landmarks[152]; // 턱 중앙
    const leftEye = landmarks[33]; // 왼쪽 눈 바깥
    const rightEye = landmarks[263]; // 오른쪽 눈 바깥
  
    // 새로운 Pitch 계산 방식
    // z축 방향을 기준으로 계산
    const faceNormal = {
      x: 0,
      y: 0,
      z: -1  // 카메라를 향한 방향이 -z
    };
    
    // 얼굴 평면 계산 (왼쪽 눈 - 오른쪽 눈 - 턱)
    const v1 = {
      x: rightEye.x - leftEye.x,
      y: rightEye.y - leftEye.y,
      z: rightEye.z - leftEye.z
    };
    
    const v2 = {
      x: chin.x - leftEye.x,
      y: chin.y - leftEye.y,
      z: chin.z - leftEye.z
    };
    
    // 평면의 법선 벡터 계산 (외적)
    const normal = {
      x: v1.y * v2.z - v1.z * v2.y,
      y: v1.z * v2.x - v1.x * v2.z,
      z: v1.x * v2.y - v1.y * v2.x
    };
    
    // 법선 벡터 정규화
    const normalLength = Math.sqrt(
      normal.x * normal.x + 
      normal.y * normal.y + 
      normal.z * normal.z
    );
    
    normal.x /= normalLength;
    normal.y /= normalLength;
    normal.z /= normalLength;
    
    // Pitch 각도: 정면 법선 벡터와 얼굴 법선 벡터의 y-z 평면에서의 각도
    const pitchCos = normal.z / Math.sqrt(normal.y * normal.y + normal.z * normal.z);
    let pitch = Math.acos(pitchCos) * (180 / Math.PI);
    
    // 방향 보정
    if (normal.y < 0) {
      pitch = -pitch;
    }
    
    // Yaw 계산: 좌우 시선 방향
    const eyeVector = {
      x: rightEye.x - leftEye.x,
      y: rightEye.y - leftEye.y,
      z: rightEye.z - leftEye.z,
    };
  
    // z축 회전에 의한 yaw 각도 계산
    const yawRad = Math.atan2(eyeVector.z, eyeVector.x);
    const yaw = (yawRad * 180) / Math.PI;
  
    // Roll 계산 (기울기) - 동일
    const rollRad = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x);
    const roll = (rollRad * 180) / Math.PI;
  
    return {
      pitch: pitch,
      yaw: yaw,
      roll: roll,
    };
  };

  // 기준점을 고려한 상대적 각도 계산 (개선)
  const calculateRelativeAngles = (angles: FaceAngles): FaceAngles => {
    if (!baselineAnglesRef.current) {
      return angles;
    }
  
    console.log('원본 각도:', angles);
    console.log('기준 각도:', baselineAnglesRef.current);
  
    // 상대적 각도 계산
    const relativePitch = angles.pitch - baselineAnglesRef.current.pitch;
    const relativeYaw = angles.yaw - baselineAnglesRef.current.yaw;
    let relativeRoll = angles.roll - baselineAnglesRef.current.roll;
  
    // Roll 각도 정규화 (-180 ~ 180 범위)
    if (relativeRoll > 180) relativeRoll -= 360;
    if (relativeRoll < -180) relativeRoll += 360;
  
    console.log('상대 각도:', { pitch: relativePitch, yaw: relativeYaw, roll: relativeRoll });
  
    return {
      pitch: relativePitch,
      yaw: relativeYaw,
      roll: relativeRoll,
    };
  };

  // 얼굴 방향 시각화 함수
  const drawFaceOrientationVectors = (
    ctx: CanvasRenderingContext2D,
    landmarks: facemesh.NormalizedLandmarkList,
    canvas: HTMLCanvasElement
  ) => {
    // 코 끝점 (기준점)
    const nose = landmarks[1];
    const noseX = nose.x * canvas.width;
    const noseY = nose.y * canvas.height;
    
    // 방향 벡터 길이 (픽셀)
    const vectorLength = 50;
    
    // 현재 얼굴 각도
    const angles = calculateFaceAngles(landmarks);
    
    // Pitch 벡터 (상하 방향) - 파란색
    const pitchRadians = (angles.pitch * Math.PI) / 180;
    const pitchX = noseX;
    const pitchY = noseY - vectorLength * Math.sin(pitchRadians);
    // 저장
    ctx.save();
    
    // Pitch 벡터 (상하 방향) - 파란색
    ctx.beginPath();
    ctx.moveTo(noseX, noseY);
    ctx.lineTo(pitchX, pitchY);
    ctx.strokeStyle = '#4285F4'; // 파란색
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Yaw 벡터 (좌우 방향) - 초록색
    const yawRadians = (angles.yaw * Math.PI) / 180;
    const yawX = noseX + vectorLength * Math.cos(yawRadians);
    const yawY = noseY;
    
    ctx.beginPath();
    ctx.moveTo(noseX, noseY);
    ctx.lineTo(yawX, yawY);
    ctx.strokeStyle = '#00c853'; // 초록색
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Roll 벡터 (회전 방향) - 빨간색
    const rollRadians = (angles.roll * Math.PI) / 180;
    const rollX = noseX + vectorLength * Math.cos(rollRadians);
    const rollY = noseY + vectorLength * Math.sin(rollRadians);
    
    ctx.beginPath();
    ctx.moveTo(noseX, noseY);
    ctx.lineTo(rollX, rollY);
    ctx.strokeStyle = '#ff3d00'; // 빨간색
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 복원
    ctx.restore();
  };

  // MediaPipe 얼굴 메시 결과 처리
  const onFaceMeshResults = (results: facemesh.Results) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // 캔버스 지우기
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 얼굴이 감지되었는지 확인
    const isFaceDetected = results.multiFaceLandmarks.length > 0;

    // 이전 상태와 달라졌을 때만 setState 호출 (렌더링 최적화)
    if (isFaceDetected !== faceDetected) {
      setFaceDetected(isFaceDetected);
    }

    // 얼굴이 감지됐으면 방향 계산
    if (isFaceDetected) {
      // 상태에 따라 경계선 색상 변경
      let newBorderColor = '#00c853'; // 기본 초록색 (감지됨)

      if (stateTimer > 0) {
        newBorderColor = '#4285F4'; // 파란색 (진행 중)
      }

      if (borderColor !== newBorderColor) {
        setBorderColor(newBorderColor);
      }

      // 얼굴 랜드마크에서 방향 각도 계산
      const angles = calculateFaceAngles(results.multiFaceLandmarks[0]);

      // 정면 상태에서 기준 각도 저장 (상대적 측정을 위해)
      if (
        detectionState === FaceDetectionState.FRONT_FACE &&
        baselineAnglesRef.current === null
      ) {
        baselineAnglesRef.current = angles;
        console.log('기준 각도 설정:', angles);
      }

      // 상대적 각도 계산
      const relativeAngles = calculateRelativeAngles(angles);
      setFaceAngles(relativeAngles);

      // 얼굴 방향 확인 로직 (상태가 안정화된 경우에만)
      if (stateStable) {
        checkFaceOrientation(relativeAngles);
      }

      // 얼굴 방향 시각화 추가
      drawFaceOrientationVectors(ctx, results.multiFaceLandmarks[0], canvas);

      // 캔버스에 텍스트 그리기 (주기적으로만)
      const now = Date.now();
      if (now - lastTextUpdateRef.current > TEXT_UPDATE_INTERVAL) {
        lastTextUpdateRef.current = now;

        // 타이머 표시
        if (stateTimer > 0) {
          drawKoreanText(
            canvas,
            `${stateTimer}초`,
            canvas.width / 2,
            30,
            24,
            'white',
            'rgba(0, 0, 0, 0.5)'
          );
        }

        // 상태 텍스트 (캐시된 것 사용)
        if (displayStatusText) {
          drawKoreanText(
            canvas,
            displayStatusText,
            canvas.width / 2,
            canvas.height - 30,
            20,
            'white',
            'rgba(0, 0, 0, 0.5)'
          );
        }
      }
    } else {
      // 얼굴이 감지되지 않음
      if (borderColor !== '#ff3d00') {
        setBorderColor('#ff3d00'); // 빨간색 (감지 안됨)
      }

      // 얼굴이 감지되지 않음 메시지
      if (Date.now() - lastTextUpdateRef.current > TEXT_UPDATE_INTERVAL) {
        lastTextUpdateRef.current = Date.now();

        drawKoreanText(
          canvas,
          '얼굴이 감지되지 않았습니다',
          canvas.width / 2,
          canvas.height / 2,
          22,
          'red',
          'rgba(0, 0, 0, 0.5)'
        );
      }
    }
  };

  // 한글 텍스트를 캔버스에 그리는 함수
  const drawKoreanText = (
    canvas: HTMLCanvasElement,
    text: string,
    x: number,
    y: number,
    fontSize: number = 24,
    color: string = 'white',
    backgroundColor: string = 'transparent'
  ): void => {
    if (koreanTextUtilRef.current) {
      koreanTextUtilRef.current.drawTextToCanvas(
        canvas,
        text,
        x,
        y,
        fontSize,
        color,
        backgroundColor
      );
    }
  };

  // 방향 신뢰도 기반 감지 함수들 (개선)
  const updatePitchConfidence = (
    isPitchUp: boolean,
    isPitchDown: boolean
  ): void => {
    // 신뢰도 변화 속도 조정 (더 천천히 변하도록)
    const upWeight = isPitchUp ? 0.7 : 0.05; // 기존보다 더 확실한 차이를 둠
    const downWeight = isPitchDown ? 0.7 : 0.05;

    // 메모리 비율 증가 (이전 값의 영향력 증가)
    pitchUpConfidence.current =
      pitchUpConfidence.current * 0.8 + upWeight * 0.2;
    pitchDownConfidence.current =
      pitchDownConfidence.current * 0.8 + downWeight * 0.2;

    // 임계값 이상이면 해당 상태로 인식
    if (
      pitchUpConfidence.current > 0.6 &&
      detectionState === FaceDetectionState.UP_FACE
    ) {
      handleStateTimer();
    } else if (
      pitchDownConfidence.current > 0.6 &&
      detectionState === FaceDetectionState.DOWN_FACE
    ) {
      handleStateTimer();
    }
  };

  const updateYawConfidence = (
    isYawLeft: boolean,
    isYawRight: boolean
  ): void => {
    // 신뢰도 변화 속도 조정 (더 천천히 변하도록)
    const leftWeight = isYawLeft ? 0.7 : 0.05; // 더 명확한 임계값 적용
    const rightWeight = isYawRight ? 0.7 : 0.05;

    // 메모리 비율 증가 (이전 값의 영향력 증가)
    yawLeftConfidence.current =
      yawLeftConfidence.current * 0.8 + leftWeight * 0.2;
    yawRightConfidence.current =
      yawRightConfidence.current * 0.8 + rightWeight * 0.2;

    // 임계값 이상이면 해당 상태로 인식
    if (
      yawLeftConfidence.current > 0.6 &&
      detectionState === FaceDetectionState.LEFT_FACE
    ) {
      handleStateTimer();
    } else if (
      yawRightConfidence.current > 0.6 &&
      detectionState === FaceDetectionState.RIGHT_FACE
    ) {
      handleStateTimer();
    }
  };

  // 얼굴 방향 확인 - 개선된 버전
  const checkFaceOrientation = (angles: FaceAngles): void => {
    // 디버깅을 위한 로그 추가
    console.log('checkFaceOrientation 호출됨:', {
      processing,
      stateStable,
      state: FaceDetectionState[detectionState],
      angles
    });
  
    if (processing || !stateStable) {
      console.log('처리 중이거나 상태가 안정화되지 않음');
      return;
    }
  
    const { pitch, yaw, roll } = angles;
  
    // 임계값 설정 (상대적 각도에 맞게 조정 - 더 관대하게)
    const PITCH_THRESHOLD = 20; // 임계값 증가
    const YAW_THRESHOLD = 20;
    const ROLL_THRESHOLD = 20;
  
    // 상태 확인
    switch (detectionState) {
      case FaceDetectionState.FRONT_FACE:
        console.log('정면 확인 검사:', {
          pitch: Math.abs(pitch) < PITCH_THRESHOLD,
          yaw: Math.abs(yaw) < YAW_THRESHOLD,
          roll: Math.abs(roll) < ROLL_THRESHOLD
        });
        
        // 정면 얼굴 확인 (모든 각도가 임계값 내에 있어야 함)
        if (
          Math.abs(pitch) < PITCH_THRESHOLD &&
          Math.abs(yaw) < YAW_THRESHOLD &&
          Math.abs(roll) < ROLL_THRESHOLD
        ) {
          console.log('정면 조건 충족! 타이머 시작');
          handleStateTimer();
        }
        break;

      case FaceDetectionState.LEFT_FACE:
        // 왼쪽 얼굴 확인 (정규화된 각도 사용)
        // 주의: 카메라가 좌우 반전되었다면 yaw 부호 확인 필요
        const isYawLeft = yaw > YAW_THRESHOLD;
        updateYawConfidence(isYawLeft, false);
        break;

      case FaceDetectionState.RIGHT_FACE:
        // 오른쪽 얼굴 확인
        const isYawRight = yaw < -YAW_THRESHOLD;
        updateYawConfidence(false, isYawRight);
        break;

      case FaceDetectionState.UP_FACE:
        // 위로 향한 얼굴 확인
        const isPitchUp = pitch < -PITCH_THRESHOLD;
        updatePitchConfidence(isPitchUp, false);
        break;

      case FaceDetectionState.DOWN_FACE:
        // 아래로 향한 얼굴 확인
        const isPitchDown = pitch > PITCH_THRESHOLD;
        updatePitchConfidence(false, isPitchDown);
        break;

      default:
        break;
    }
  };

  // 상태 타이머 처리 및 원형 게이지 업데이트
  const handleStateTimer = (): void => {
    console.log('타이머 함수 호출됨');
    
    if (processing) {
      console.log('이미 처리 중이어서 타이머 시작 안함');
      return;
    }
  
    // 마지막 상태 변경 시간 제약 완화 (0ms으로 설정)
    const now = Date.now();
    if (now - lastStateTime.current < 0) {
      console.log('마지막 상태 변경 후 시간 제약:', now - lastStateTime.current);
      return;
    }
  
    console.log('타이머 시작!');
    setProcessing(true);
    
    // 타이머 시작을 명확히 표시하기 위해 색상 변경
    setBorderColor('#4285F4'); // 파란색 (진행 중)
  
    // 3초 카운트다운
    let count = 3;
    let progress = 0;
    setStateTimer(count);
    setTimerProgress(progress);
  
    // 50ms 단위로 진행도 업데이트 (부드러운 애니메이션)
    const updateInterval = 50; // 50ms (더 부드럽게)
    const totalDuration = 3000; // 3초
    const totalSteps = totalDuration / updateInterval;
    let currentStep = 0;
  
    const interval = setInterval(() => {
      currentStep++;
      progress = currentStep / totalSteps;
      setTimerProgress(progress);
  
      if (currentStep % (totalSteps / 3) === 0) {
        // 1초마다 카운트 감소
        count--;
        setStateTimer(count);
        console.log('타이머 카운트:', count);
      }
  
      if (currentStep >= totalSteps) {
        clearInterval(interval);
        console.log('타이머 완료, 다음 상태로 전환');
        moveToNextState();
        setProcessing(false);
        setTimerProgress(0);
      }
    }, updateInterval);
  };

  // 다음 상태로 이동 (순서 수정)
  const moveToNextState = (): void => {
    switch (detectionState) {
      case FaceDetectionState.FRONT_FACE:
        setDetectionState(FaceDetectionState.LEFT_FACE); // 순서 변경
        // 상태 이동 시 신뢰도 초기화
        resetConfidences();
        break;
      case FaceDetectionState.LEFT_FACE:
        setDetectionState(FaceDetectionState.RIGHT_FACE); // 순서 변경
        resetConfidences();
        break;
      case FaceDetectionState.RIGHT_FACE:
        setDetectionState(FaceDetectionState.UP_FACE);
        resetConfidences();
        break;
      case FaceDetectionState.UP_FACE:
        setDetectionState(FaceDetectionState.DOWN_FACE);
        resetConfidences();
        break;
      case FaceDetectionState.DOWN_FACE:
        // 모든 얼굴 각도 캡처 완료
        setDetectionState(FaceDetectionState.COMPLETED);

        // 백엔드로 얼굴 데이터 전송
        sendFaceDataToServer();
        break;
      default:
        break;
    }

    setStateTimer(0);
  };

  // 신뢰도 점수 초기화 함수 (코드 중복 제거)
  const resetConfidences = (): void => {
    pitchUpConfidence.current = 0;
    pitchDownConfidence.current = 0;
    yawLeftConfidence.current = 0;
    yawRightConfidence.current = 0;
  };

  // 얼굴 데이터를 서버로 전송
  const sendFaceDataToServer = async (): Promise<void> => {
    try {
      // 캔버스에서 얼굴 이미지 데이터 추출
      if (!canvasRef.current) return;

      const canvas = canvasRef.current;
      const imageData = canvas.toDataURL('image/jpeg');

      // 데이터 전송 전 상태 변경
      setDetectionState(FaceDetectionState.VERIFYING);

      // 실제 백엔드 API 호출 (예시)
      // const response = await fetch('https://your-api.com/face-recognition', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ faceImage: imageData }),
      // });
      //
      // const result = await response.json();

      // 데모용 타이머 (실제로는 서버 응답 대기)
      setTimeout(() => {
        setDetectionState(FaceDetectionState.COMPLETED);
      }, 2000);
    } catch (error) {
      console.error('서버 전송 오류:', error);
      // 오류 처리 로직
    }
  };

  // 카메라 사용 시작
  const handleStartCamera = (): void => {
    // 카메라 시작 전 기준점 초기화
    baselineAnglesRef.current = null;
    startVideo();
  };

  // 단계 표시기 렌더링
  const renderProgressSteps = () => {
    const steps = [
      FaceDetectionState.FRONT_FACE,
      FaceDetectionState.LEFT_FACE,
      FaceDetectionState.RIGHT_FACE,
      FaceDetectionState.UP_FACE,
      FaceDetectionState.DOWN_FACE,
    ];

    return (
      <ProgressStepsContainer>
        {steps.map((step, index) => (
          <ProgressStep
            key={index}
            active={detectionState === step}
            completed={detectionState > step}
          />
        ))}
      </ProgressStepsContainer>
    );
  };

  // 색상 안내 렌더링
  const renderColorGuide = () => {
    return (
      <ColorGuideContainer>
        <ColorGuideItem>
          <ColorIndicator color='#00c853' />
          <span>얼굴 감지됨</span>
        </ColorGuideItem>
        <ColorGuideItem>
          <ColorIndicator color='#ff3d00' />
          <span>얼굴 감지 안됨</span>
        </ColorGuideItem>
        <ColorGuideItem>
          <ColorIndicator color='#4285F4' />
          <span>인식 진행 중</span>
        </ColorGuideItem>
      </ColorGuideContainer>
    );
  };

  // 안내 가이드라인 컴포넌트
  const renderGuidelines = (): JSX.Element | null => {
    switch (detectionState) {
      case FaceDetectionState.FRONT_FACE:
        return (
          <FaceGuideline>
            {/* 정면 안내 - 얼굴 윤곽 원과 십자선 */}
            <div
              style={{
                position: 'absolute',
                top: '15%',
                left: '50%',
                width: '70%',
                height: '70%',
                border: '2px dashed rgba(255, 255, 255, 0.6)',
                borderRadius: '50%',
                transform: 'translateX(-50%)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '10%',
                left: '50%',
                height: '80%',
                width: '2px',
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                transform: 'translateX(-50%)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '10%',
                width: '80%',
                height: '2px',
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                transform: 'translateY(-50%)',
              }}
            />
          </FaceGuideline>
        );

      case FaceDetectionState.LEFT_FACE:
        return (
          <FaceGuideline>
            {/* 왼쪽 Yaw 회전 안내 - 타원과 회전 마커 */}
            <div
              style={{
                position: 'absolute',
                top: '15%',
                left: '50%',
                width: '70%',
                height: '70%',
                border: '2px dashed rgba(255, 255, 255, 0.6)',
                borderRadius: '50%',
                transform: 'translateX(-50%) rotateY(30deg)',
                perspective: '500px',
              }}
            />

            {/* 회전 방향 화살표 */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '25%',
                width: '25%',
                height: '2px',
                backgroundColor: 'white',
                transform: 'translateY(-50%)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '25%',
                width: '10px',
                height: '10px',
                borderTop: '2px solid white',
                borderLeft: '2px solid white',
                transform: 'translateY(-50%) rotate(-45deg)',
              }}
            />

            {/* 회전 각도 표시 마커들 */}
            <RotationMarker
              style={{
                top: '35%',
                left: '25%',
              }}
            />
            <RotationMarker
              style={{
                top: '65%',
                left: '25%',
              }}
            />

            {/* 얼굴 위치 안내 점선 */}
            <div
              style={{
                position: 'absolute',
                top: '30%',
                left: '25%',
                width: '50%',
                height: '40%',
                border: '2px dotted rgba(255, 255, 255, 0.5)',
                borderLeftWidth: '0',
                borderRadius: '0 70px 70px 0',
              }}
            />
          </FaceGuideline>
        );

      case FaceDetectionState.RIGHT_FACE:
        return (
          <FaceGuideline>
            {/* 오른쪽 Yaw 회전 안내 - 타원과 회전 마커 */}
            <div
              style={{
                position: 'absolute',
                top: '15%',
                left: '50%',
                width: '70%',
                height: '70%',
                border: '2px dashed rgba(255, 255, 255, 0.6)',
                borderRadius: '50%',
                transform: 'translateX(-50%) rotateY(-30deg)',
                perspective: '500px',
              }}
            />

            {/* 회전 방향 화살표 */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                right: '25%',
                width: '25%',
                height: '2px',
                backgroundColor: 'white',
                transform: 'translateY(-50%)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '50%',
                right: '25%',
                width: '10px',
                height: '10px',
                borderTop: '2px solid white',
                borderRight: '2px solid white',
                transform: 'translateY(-50%) rotate(45deg)',
              }}
            />

            {/* 회전 각도 표시 마커들 */}
            <RotationMarker
              style={{
                top: '35%',
                right: '25%',
              }}
            />
            <RotationMarker
              style={{
                top: '65%',
                right: '25%',
              }}
            />

            {/* 얼굴 위치 안내 점선 */}
            <div
              style={{
                position: 'absolute',
                top: '30%',
                right: '25%',
                width: '50%',
                height: '40%',
                border: '2px dotted rgba(255, 255, 255, 0.5)',
                borderRightWidth: '0',
                borderRadius: '70px 0 0 70px',
              }}
            />
          </FaceGuideline>
        );

      case FaceDetectionState.UP_FACE:
        return (
          <FaceGuideline>
            {/* 위쪽 Pitch 회전 안내 - 타원과 회전 마커 */}
            <div
              style={{
                position: 'absolute',
                top: '15%',
                left: '50%',
                width: '70%',
                height: '70%',
                border: '2px dashed rgba(255, 255, 255, 0.6)',
                borderRadius: '50%',
                transform: 'translateX(-50%) rotateX(30deg)',
                perspective: '500px',
              }}
            />

            {/* 회전 방향 화살표 */}
            <div
              style={{
                position: 'absolute',
                top: '25%',
                left: '50%',
                height: '25%',
                width: '2px',
                backgroundColor: 'white',
                transform: 'translateX(-50%)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '25%',
                left: '50%',
                width: '10px',
                height: '10px',
                borderTop: '2px solid white',
                borderLeft: '2px solid white',
                transform: 'translateX(-50%) rotate(45deg)',
              }}
            />

            {/* 회전 각도 표시 마커들 */}
            <RotationMarker
              style={{
                top: '25%',
                left: '35%',
              }}
            />
            <RotationMarker
              style={{
                top: '25%',
                left: '65%',
              }}
            />

            {/* 얼굴 위치 안내 점선 */}
            <div
              style={{
                position: 'absolute',
                top: '25%',
                left: '30%',
                width: '40%',
                height: '50%',
                border: '2px dotted rgba(255, 255, 255, 0.5)',
                borderTopWidth: '0',
                borderRadius: '0 0 70px 70px',
              }}
            />
          </FaceGuideline>
        );

      case FaceDetectionState.DOWN_FACE:
        return (
          <FaceGuideline>
            {/* 아래쪽 Pitch 회전 안내 - 타원과 회전 마커 */}
            <div
              style={{
                position: 'absolute',
                top: '15%',
                left: '50%',
                width: '70%',
                height: '70%',
                border: '2px dashed rgba(255, 255, 255, 0.6)',
                borderRadius: '50%',
                transform: 'translateX(-50%) rotateX(-30deg)',
                perspective: '500px',
              }}
            />

            {/* 회전 방향 화살표 */}
            <div
              style={{
                position: 'absolute',
                bottom: '25%',
                left: '50%',
                height: '25%',
                width: '2px',
                backgroundColor: 'white',
                transform: 'translateX(-50%)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '25%',
                left: '50%',
                width: '10px',
                height: '10px',
                borderBottom: '2px solid white',
                borderLeft: '2px solid white',
                transform: 'translateX(-50%) rotate(-45deg)',
              }}
            />

            {/* 회전 각도 표시 마커들 */}
            <RotationMarker
              style={{
                bottom: '25%',
                left: '35%',
              }}
            />
            <RotationMarker
              style={{
                bottom: '25%',
                left: '65%',
              }}
            />

            {/* 얼굴 위치 안내 점선 */}
            <div
              style={{
                position: 'absolute',
                bottom: '25%',
                left: '30%',
                width: '40%',
                height: '50%',
                border: '2px dotted rgba(255, 255, 255, 0.5)',
                borderBottomWidth: '0',
                borderRadius: '70px 70px 0 0',
              }}
            />
          </FaceGuideline>
        );

      default:
        return null;
    }
  };

  // 디버깅 정보 렌더링
  const renderDebugInfo = () => {
    return (
      <DebugPanel>
        <div>Pitch Up 신뢰도: {pitchUpConfidence.current.toFixed(2)}</div>
        <div>Pitch Down 신뢰도: {pitchDownConfidence.current.toFixed(2)}</div>
        <div>Yaw Left 신뢰도: {yawLeftConfidence.current.toFixed(2)}</div>
        <div>Yaw Right 신뢰도: {yawRightConfidence.current.toFixed(2)}</div>
        <div>Pitch 측정값: {faceAngles.pitch.toFixed(2)}</div>
        <div>Yaw 측정값: {faceAngles.yaw.toFixed(2)}</div>
        <div>Roll 측정값: {faceAngles.roll.toFixed(2)}</div>
        <div>상태: {FaceDetectionState[detectionState]}</div>
        {baselineAnglesRef.current && (
          <div>
            <div>기준 Pitch: {baselineAnglesRef.current.pitch.toFixed(2)}</div>
            <div>기준 Yaw: {baselineAnglesRef.current.yaw.toFixed(2)}</div>
            <div>기준 Roll: {baselineAnglesRef.current.roll.toFixed(2)}</div>
          </div>
        )}
      </DebugPanel>
    );
  };

  return (
    <Container>
      <BackButton>&lt;</BackButton>

      {renderDebugInfo()}

      <FaceCircle borderColor={borderColor}>
        <VideoContainer>
          <Video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            width={640}
            height={480}
          />
          <Canvas ref={canvasRef} width={640} height={480} />

          {/* 가이드라인 렌더링 */}
          {renderGuidelines()}

          <GuideLine>
            {stateTimer > 0 && <TimerDisplay>{stateTimer}</TimerDisplay>}
          </GuideLine>

          {/* 타이머 원형 게이지 */}
          {stateTimer > 0 && (
            <TimerCircleContainer>
              <TimerCircleSVG viewBox='0 0 500 500'>
                <TimerCirclePath
                  cx='250'
                  cy='250'
                  r='248'
                  progress={timerProgress}
color='#4285F4'
/>
</TimerCircleSVG>
</TimerCircleContainer>
)}
</VideoContainer>
</FaceCircle>
  <Message>{getMessage()}</Message>
  <SubMessage>{getSubMessage()}</SubMessage>

  {/* 단계 표시기 */}
  {detectionState !== FaceDetectionState.INIT &&
    detectionState !== FaceDetectionState.COMPLETED &&
    detectionState !== FaceDetectionState.VERIFYING &&
    renderProgressSteps()}

  {detectionState === FaceDetectionState.INIT && !loadingError && (
    <>
      <Button onClick={handleStartCamera} disabled={!modelsLoaded}>
        {modelsLoaded ? '카메라 켜기' : '모델 로딩 중...'}
      </Button>
      {/* 색상 안내 */}
      {renderColorGuide()}
    </>
  )}

  {loadingError && (
    <Button onClick={() => window.location.reload()}>다시 시도하기</Button>
  )}
</Container>
);
};
export default FaceRecognition;