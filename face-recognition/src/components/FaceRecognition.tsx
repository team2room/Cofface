import React, { useState, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import * as faceapi from 'face-api.js';

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
  border: 4px solid ${props => props.borderColor || '#333'};
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
  stroke: ${props => props.color};
  stroke-width: 8px; // 선 굵기 증가
  stroke-linecap: round;
  stroke-dasharray: 1570; /* 대략 원의 둘레 (2 * PI * R) */
  stroke-dashoffset: ${props => 1570 * (1 - props.progress)}; /* 진행도에 따라 변경 */
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

const ProgressStep = styled.div<{ active: boolean; completed: boolean }>`
  width: 40px;
  height: 8px;
  margin: 0 5px;
  border-radius: 4px;
  background-color: ${props => 
    props.completed ? '#4CAF50' : 
    props.active ? '#2196F3' : 
    'rgba(255, 255, 255, 0.3)'};
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
  background-color: ${props => props.color};
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
  
  // 한글 텍스트를 캔버스에 그리기
  public drawTextToCanvas(
    targetCanvas: HTMLCanvasElement,
    text: string,
    x: number,
    y: number,
    fontSize: number = 24,
    color: string = 'white',
    backgroundColor: string = 'transparent'
  ): void {
    const textCanvas = this.createTextImage(text, fontSize, 'Noto Sans KR, sans-serif', color, backgroundColor);
    const ctx = targetCanvas.getContext('2d');
    
    if (ctx) {
      ctx.drawImage(
        textCanvas, 
        x - textCanvas.width / 2, 
        y - textCanvas.height / 2
      );
    }
  }
}

const FaceRecognition: React.FC = () => {
  const [detectionState, setDetectionState] = useState<FaceDetectionState>(FaceDetectionState.INIT);
  const [processing, setProcessing] = useState<boolean>(false);
  const [faceDetected, setFaceDetected] = useState<boolean>(false);
  const [stateTimer, setStateTimer] = useState<number>(0);
  const [timerProgress, setTimerProgress] = useState<number>(0); // 타이머 진행도 (0~1)
  const [borderColor, setBorderColor] = useState<string>('#333');
  const [modelsLoaded, setModelsLoaded] = useState<boolean>(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [stateStable, setStateStable] = useState<boolean>(false); // 상태 안정성 추적
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const koreanTextUtilRef = useRef<KoreanTextUtil | null>(null);
  const lastStateTime = useRef<number>(0); // 마지막 상태 변경 시간
  
  // 메시지와 서브메시지 설정
  const getMessage = (): string => {
    if (loadingError) {
      return "카메라 또는 모델 로딩 오류가 발생했습니다";
    }
  
    switch (detectionState) {
      case FaceDetectionState.INIT:
        return modelsLoaded ? "이수환님의 얼굴을 확인할게요" : "모델 로딩 중...";
      case FaceDetectionState.FRONT_FACE:
        return "정면을 바라봐주세요";
      case FaceDetectionState.LEFT_FACE:
        return "고개를 왼쪽으로 돌려주세요";
      case FaceDetectionState.RIGHT_FACE:
        return "고개를 오른쪽으로 돌려주세요";
      case FaceDetectionState.UP_FACE:
        return "고개를 들어 위를 바라봐주세요";
      case FaceDetectionState.DOWN_FACE:
        return "고개를 숙여 아래를 바라봐주세요";
      case FaceDetectionState.COMPLETED:
        return "좋아요!";
      case FaceDetectionState.VERIFYING:
        return "인증 처리 중...";
      default:
        return "";
    }
  };
  
  const getSubMessage = (): string => {
    if (loadingError) {
      return "페이지를 새로고침하거나 다시 시도해주세요";
    }
    
    switch (detectionState) {
      case FaceDetectionState.FRONT_FACE:
        return "얼굴이 화면을 벗어나면 안돼요";
      case FaceDetectionState.LEFT_FACE:
        return "왼쪽으로 약 30도 Yaw 회전해주세요";
      case FaceDetectionState.RIGHT_FACE:
        return "오른쪽으로 약 30도 Yaw 회전해주세요";
      case FaceDetectionState.UP_FACE:
        return "위쪽으로 약 30도 Pitch 회전해주세요";
      case FaceDetectionState.DOWN_FACE:
        return "아래쪽으로 약 30도 Pitch 회전해주세요";
      default:
        return "";
    }
  };

  // 한글 텍스트 유틸리티 초기화
  useEffect(() => {
    koreanTextUtilRef.current = new KoreanTextUtil();
  }, []);

  // 모델 로딩 후 상태 안정화 시간 설정
  useEffect(() => {
    if (detectionState !== FaceDetectionState.INIT && detectionState !== FaceDetectionState.COMPLETED) {
      // 새로운 상태로 변경될 때 안정화 시간 필요
      setStateStable(false);
      
      // 상태 변경 후 1초 후에 안정화 허용
      const timer = setTimeout(() => {
        setStateStable(true);
        lastStateTime.current = Date.now();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [detectionState]);

  // 얼굴 인식 모델 로드
  useEffect(() => {
    const loadModels = async (): Promise<void> => {
      try {
        // 모델 경로를 현재 호스팅 환경에 맞게 설정
        const MODEL_URL = './models'; // 이 경로는 public 폴더 내의 models 디렉토리를 가리킴
        
        // Promise.all을 사용하여 모든 모델을 병렬로 로드
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL), // 작은 모델 사용
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);
        
        console.log('모델 로딩 완료');
        setModelsLoaded(true);
        startVideo();
      } catch (error) {
        console.error('모델 로딩 오류:', error);
        setLoadingError(`모델 로딩 오류: ${error instanceof Error ? error.message : String(error)}`);
      }
    };
    
    loadModels();
    
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // 비디오 시작
  const startVideo = async (): Promise<void> => {
    if (!modelsLoaded) {
      console.warn('모델이 아직 로드되지 않았습니다');
      return;
    }
    
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = streamRef.current;
      }
      
      setDetectionState(FaceDetectionState.FRONT_FACE);
    } catch (error) {
      console.error('카메라 접근 오류:', error);
      setLoadingError(`카메라 접근 오류: ${error instanceof Error ? error.message : String(error)}`);
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
      koreanTextUtilRef.current.drawTextToCanvas(canvas, text, x, y, fontSize, color, backgroundColor);
    }
  };

  // 얼굴 인식 처리
  useEffect(() => {
    if (!videoRef.current || !canvasRef.current || !modelsLoaded || 
        detectionState === FaceDetectionState.COMPLETED || 
        detectionState === FaceDetectionState.INIT) return;
    
    let animationId: number;
    
    const detectFace = async (): Promise<void> => {
      if (videoRef.current && videoRef.current.readyState === 4 && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        
        // 명시적 displaySize 객체 생성 (비디오 실제 크기에 맞춤)
        const displaySize: faceapi.IDimensions = { 
          width: video.videoWidth || 640, 
          height: video.videoHeight || 480 
        };
        
        // canvas와 displaySize 모두 null이 아님을 확인
        faceapi.matchDimensions(canvas, displaySize);
        
        try {
          // 작은 모델 사용으로 성능 개선
          const detectionOptions = new faceapi.TinyFaceDetectorOptions({ inputSize: 320 });
          const detections = await faceapi.detectSingleFace(video, detectionOptions)
            .withFaceLandmarks(true); // 작은 랜드마크 모델 사용
          
          // 캔버스 지우기
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // 타이머 표시
            if (stateTimer > 0) {
              // 한글 타이머 텍스트 그리기
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
          }
          
          if (detections) {
            setFaceDetected(true);
            
            // 얼굴 방향 확인 로직
            checkFaceOrientation(detections);
            
            // 상태에 따라 경계선 색상 변경
            if (stateTimer > 0) {
              setBorderColor('#4285F4'); // 파란색 (진행 중)
            } else if (faceDetected) {
              setBorderColor('#00c853'); // 초록색 (감지됨)
            }
            
            // 감지된 결과를 캔버스에 그리기 (상태와 연결)
            if (ctx) {
              // 얼굴 감지 상태에 따른 안내 메시지
              let statusText = "";
              switch (detectionState) {
                case FaceDetectionState.FRONT_FACE:
                  statusText = "정면을 응시해주세요";
                  break;
                case FaceDetectionState.LEFT_FACE:
                  statusText = "왼쪽으로 고개를 돌려주세요";
                  break;
                case FaceDetectionState.RIGHT_FACE:
                  statusText = "오른쪽으로 고개를 돌려주세요";
                  break;
                case FaceDetectionState.UP_FACE:
                  statusText = "위쪽을 바라봐주세요";
                  break;
                case FaceDetectionState.DOWN_FACE:
                  statusText = "아래쪽을 바라봐주세요";
                  break;
              }
              
              // 한글 상태 텍스트 그리기 (캔버스 하단)
              if (statusText) {
                drawKoreanText(
                  canvas, 
                  statusText, 
                  canvas.width / 2, 
                  canvas.height - 30, 
                  20, 
                  'white', 
                  'rgba(0, 0, 0, 0.5)'
                );
              }
            }
          } else {
            setFaceDetected(false);
            setBorderColor('#ff3d00'); // 빨간색 (감지 안됨)
            
            // 얼굴이 감지되지 않음 메시지
            if (ctx) {
              drawKoreanText(
                canvas, 
                "얼굴이 감지되지 않았습니다", 
                canvas.width / 2, 
                canvas.height / 2, 
                22, 
                'red', 
                'rgba(0, 0, 0, 0.5)'
              );
            }
          }
        } catch (error) {
          console.error("얼굴 인식 오류:", error);
        }
      }
      
      animationId = requestAnimationFrame(detectFace);
    };
    
    detectFace();
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [detectionState, faceDetected, stateTimer, modelsLoaded]);

  // 얼굴 방향 확인 (좌우 반전 고려)
  const checkFaceOrientation = (detections: faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }>): void => {
    if (!detections || processing || !stateStable) return;
    
    const landmarks = detections.landmarks;
    const nose = landmarks.getNose();
    const jawline = landmarks.getJawOutline();
    
    switch (detectionState) {
      case FaceDetectionState.FRONT_FACE:
        // 정면 얼굴 확인
        if (isFrontFacing(nose, jawline)) {
          handleStateTimer();
        }
        break;
        
      case FaceDetectionState.LEFT_FACE:
        // 왼쪽 얼굴 확인 (비디오가 좌우 반전되어 있으므로 실제론 오른쪽)
        if (detectYawRight(nose, jawline)) {  // 함수명 변경 - 좌우 반전으로 인해 함수 반대로 호출
          handleStateTimer();
        }
        break;
        
      case FaceDetectionState.RIGHT_FACE:
        // 오른쪽 얼굴 확인 (비디오가 좌우 반전되어 있으므로 실제론 왼쪽)
        if (detectYawLeft(nose, jawline)) {  // 함수명 변경 - 좌우 반전으로 인해 함수 반대로 호출
          handleStateTimer();
        }
        break;
        
      case FaceDetectionState.UP_FACE:
        // 위로 향한 얼굴 확인
        if (detectPitchUp(nose, jawline)) {  // 함수명 변경
          handleStateTimer();
        }
        break;
        
      case FaceDetectionState.DOWN_FACE:
        // 아래로 향한 얼굴 확인
        if (detectPitchDown(nose, jawline)) {  // 함수명 변경
          handleStateTimer();
        }
        break;
        
      default:
        break;
    }
  };

  // 얼굴 방향 관련 함수들
  const isFrontFacing = (nose: faceapi.Point[], jawline: faceapi.Point[]): boolean => {
    if (nose.length < 1 || jawline.length < 1) return false;
  
    const centerNose = nose[Math.floor(nose.length / 2)];
    const leftJaw = jawline[0];
    const rightJaw = jawline[jawline.length - 1];
  
    const faceWidth = Math.abs(rightJaw.x - leftJaw.x);
    const noseRatio = (centerNose.x - leftJaw.x) / faceWidth;
  
    // 정면: 42~58% 위치에 코가 위치할 때 허용
    return noseRatio >= 0.42 && noseRatio <= 0.58;
  };
  
  
  const detectYawLeft = (nose: faceapi.Point[], jawline: faceapi.Point[]): boolean => {
    if (nose.length < 1 || jawline.length < 1) return false;
  
    const centerNose = nose[Math.floor(nose.length / 2)];
    const leftJaw = jawline[0];
    const rightJaw = jawline[jawline.length - 1];
  
    const faceWidth = Math.abs(rightJaw.x - leftJaw.x);
    const noseRatio = (centerNose.x - leftJaw.x) / faceWidth;
  
    // 왼쪽 Yaw: 코가 전체 얼굴 폭의 25~42% 위치에 있을 때 허용
    return noseRatio >= 0.25 && noseRatio <= 0.42;
  };
  
  const detectYawRight = (nose: faceapi.Point[], jawline: faceapi.Point[]): boolean => {
    if (nose.length < 1 || jawline.length < 1) return false;
  
    const centerNose = nose[Math.floor(nose.length / 2)];
    const leftJaw = jawline[0];
    const rightJaw = jawline[jawline.length - 1];
  
    const faceWidth = Math.abs(rightJaw.x - leftJaw.x);
    const noseRatio = (centerNose.x - leftJaw.x) / faceWidth;
  
    // 오른쪽 Yaw: 코가 전체 얼굴 폭의 58~75% 위치에 있을 때 허용
    return noseRatio >= 0.58 && noseRatio <= 0.75;
  };
  
  
  const detectPitchUp = (nose: faceapi.Point[], jawline: faceapi.Point[]): boolean => {
    if (nose.length < 2) return false;
  
    const noseTop = nose[0];
    const noseTip = nose[nose.length - 1];
    const noseLength = Math.abs(noseTip.y - noseTop.y);
  
    // 위를 보는 Pitch: 코 길이가 짧음 (20도 기준으로 여유)
    return noseLength <= 28;
  };
  
  
  const detectPitchDown = (nose: faceapi.Point[], jawline: faceapi.Point[]): boolean => {
    if (nose.length < 2) return false;
  
    const noseTop = nose[0];
    const noseTip = nose[nose.length - 1];
    const noseLength = Math.abs(noseTip.y - noseTop.y);
  
    // 아래를 보는 Pitch: 코 길이가 김 (20도 기준으로 여유)
    return noseLength >= 22;
  };

  // 상태 타이머 처리 및 원형 게이지 업데이트
  const handleStateTimer = (): void => {
    if (processing) return;
    
    // 마지막 상태 변경 후 최소 1초가 지났는지 확인
    const now = Date.now();
    if (now - lastStateTime.current < 1000) return;
    
    setProcessing(true);
    
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
      
      if (currentStep % (totalSteps/3) === 0) { // 1초마다 카운트 감소
        count--;
        setStateTimer(count);
      }
      
      if (currentStep >= totalSteps) {
        clearInterval(interval);
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
        break;
      case FaceDetectionState.LEFT_FACE:
        setDetectionState(FaceDetectionState.RIGHT_FACE); // 순서 변경
        break;
      case FaceDetectionState.RIGHT_FACE:
        setDetectionState(FaceDetectionState.UP_FACE);
        break;
      case FaceDetectionState.UP_FACE:
        setDetectionState(FaceDetectionState.DOWN_FACE);
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
    startVideo();
  };

  // 단계 표시기 렌더링
  const renderProgressSteps = () => {
    const steps = [
      FaceDetectionState.FRONT_FACE,
      FaceDetectionState.LEFT_FACE,
      FaceDetectionState.RIGHT_FACE,
      FaceDetectionState.UP_FACE,
      FaceDetectionState.DOWN_FACE
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
          <ColorIndicator color="#00c853" />
          <span>얼굴 감지됨</span>
        </ColorGuideItem>
        <ColorGuideItem>
          <ColorIndicator color="#ff3d00" />
          <span>얼굴 감지 안됨</span>
        </ColorGuideItem>
        <ColorGuideItem>
          <ColorIndicator color="#4285F4" />
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
            <div style={{
              position: 'absolute',
              top: '15%',
              left: '50%',
              width: '70%',
              height: '70%',
              border: '2px dashed rgba(255, 255, 255, 0.6)',
              borderRadius: '50%',
              transform: 'translateX(-50%)'
            }} />
            <div style={{
              position: 'absolute',
              top: '10%',
              left: '50%',
              height: '80%',
              width: '2px',
              backgroundColor: 'rgba(255, 255, 255, 0.5)',
              transform: 'translateX(-50%)'
            }} />
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '10%',
              width: '80%',
              height: '2px',
              backgroundColor: 'rgba(255, 255, 255, 0.5)',
              transform: 'translateY(-50%)'
            }} />
          </FaceGuideline>
        );
        
      case FaceDetectionState.LEFT_FACE:
        return (
          <FaceGuideline>
            {/* 왼쪽 Yaw 회전 안내 - 타원과 회전 마커 */}
            <div style={{
              position: 'absolute',
              top: '15%',
              left: '50%',
              width: '70%',
              height: '70%',
              border: '2px dashed rgba(255, 255, 255, 0.6)',
              borderRadius: '50%',
              transform: 'translateX(-50%) rotateY(30deg)',
              perspective: '500px'
            }} />
            
            {/* 회전 방향 화살표 */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '25%',
              width: '25%',
              height: '2px',
              backgroundColor: 'white',
              transform: 'translateY(-50%)'
            }} />
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '25%',
              width: '10px',
              height: '10px',
              borderTop: '2px solid white',
              borderLeft: '2px solid white',
              transform: 'translateY(-50%) rotate(-45deg)'
            }} />
            
            {/* 회전 각도 표시 마커들 */}
            <RotationMarker style={{
              top: '35%',
              left: '25%'
            }} />
            <RotationMarker style={{
              top: '65%',
              left: '25%'
            }} />
            
            {/* 얼굴 위치 안내 점선 */}
            <div style={{
              position: 'absolute',
              top: '30%',
              left: '25%',
              width: '50%',
              height: '40%',
              border: '2px dotted rgba(255, 255, 255, 0.5)',
              borderLeftWidth: '0',
              borderRadius: '0 70px 70px 0'
            }} />
          </FaceGuideline>
        );
        
      case FaceDetectionState.RIGHT_FACE:
        return (
          <FaceGuideline>
            {/* 오른쪽 Yaw 회전 안내 - 타원과 회전 마커 */}
            <div style={{
              position: 'absolute',
              top: '15%',
              left: '50%',
              width: '70%',
              height: '70%',
              border: '2px dashed rgba(255, 255, 255, 0.6)',
              borderRadius: '50%',
              transform: 'translateX(-50%) rotateY(-30deg)',
              perspective: '500px'
            }} />
            
            {/* 회전 방향 화살표 */}
            <div style={{
              position: 'absolute',
              top: '50%',
              right: '25%',
              width: '25%',
              height: '2px',
              backgroundColor: 'white',
              transform: 'translateY(-50%)'
            }} />
            <div style={{
              position: 'absolute',
              top: '50%',
              right: '25%',
              width: '10px',
              height: '10px',
              borderTop: '2px solid white',
              borderRight: '2px solid white',
              transform: 'translateY(-50%) rotate(45deg)'
            }} />
            
            {/* 회전 각도 표시 마커들 */}
            <RotationMarker style={{
              top: '35%',
              right: '25%'
            }} />
            <RotationMarker style={{
              top: '65%',
              right: '25%'
            }} />
            
            {/* 얼굴 위치 안내 점선 */}
            <div style={{
              position: 'absolute',
              top: '30%',
              right: '25%',
              width: '50%',
              height: '40%',
              border: '2px dotted rgba(255, 255, 255, 0.5)',
              borderRightWidth: '0',
              borderRadius: '70px 0 0 70px'
            }} />
          </FaceGuideline>
        );
        
      case FaceDetectionState.UP_FACE:
        return (
          <FaceGuideline>
            {/* 위쪽 Pitch 회전 안내 - 타원과 회전 마커 */}
            <div style={{
              position: 'absolute',
              top: '15%',
              left: '50%',
              width: '70%',
              height: '70%',
              border: '2px dashed rgba(255, 255, 255, 0.6)',
              borderRadius: '50%',
              transform: 'translateX(-50%) rotateX(30deg)',
              perspective: '500px'
            }} />
            
            {/* 회전 방향 화살표 */}
            <div style={{
              position: 'absolute',
              top: '25%',
              left: '50%',
              height: '25%',
              width: '2px',
              backgroundColor: 'white',
              transform: 'translateX(-50%)'
            }} />
            <div style={{
              position: 'absolute',
              top: '25%',
              left: '50%',
              width: '10px',
              height: '10px',
              borderTop: '2px solid white',
              borderLeft: '2px solid white',
              transform: 'translateX(-50%) rotate(45deg)'
            }} />
            
            {/* 회전 각도 표시 마커들 */}
            <RotationMarker style={{
              top: '25%',
              left: '35%'
            }} />
            <RotationMarker style={{
              top: '25%',
              left: '65%'
            }} />
            
            {/* 얼굴 위치 안내 점선 */}
            <div style={{
              position: 'absolute',
              top: '25%',
              left: '30%',
              width: '40%',
              height: '50%',
              border: '2px dotted rgba(255, 255, 255, 0.5)',
              borderTopWidth: '0',
              borderRadius: '0 0 70px 70px'
            }} />
          </FaceGuideline>
        );
        
      case FaceDetectionState.DOWN_FACE:
        return (
          <FaceGuideline>
            {/* 아래쪽 Pitch 회전 안내 - 타원과 회전 마커 */}
            <div style={{
              position: 'absolute',
              top: '15%',
              left: '50%',
              width: '70%',
              height: '70%',
              border: '2px dashed rgba(255, 255, 255, 0.6)',
              borderRadius: '50%',
              transform: 'translateX(-50%) rotateX(-30deg)',
              perspective: '500px'
            }} />
            
            {/* 회전 방향 화살표 */}
            <div style={{
              position: 'absolute',
              bottom: '25%',
              left: '50%',
              height: '25%',
              width: '2px',
              backgroundColor: 'white',
              transform: 'translateX(-50%)'
            }} />
            <div style={{
              position: 'absolute',
              bottom: '25%',
              left: '50%',
              width: '10px',
              height: '10px',
              borderBottom: '2px solid white',
              borderLeft: '2px solid white',
              transform: 'translateX(-50%) rotate(-45deg)'
            }} />
            
            {/* 회전 각도 표시 마커들 */}
            <RotationMarker style={{
              bottom: '25%',
              left: '35%'
            }} />
            <RotationMarker style={{
              bottom: '25%',
              left: '65%'
            }} />
            
            {/* 얼굴 위치 안내 점선 */}
            <div style={{
              position: 'absolute',
              bottom: '25%',
              left: '30%',
              width: '40%',
              height: '50%',
              border: '2px dotted rgba(255, 255, 255, 0.5)',
              borderBottomWidth: '0',
              borderRadius: '70px 70px 0 0'
            }} />
          </FaceGuideline>
        );
        
      default:
        return null;
    }
  };

  return (
    <Container>
      <BackButton>&lt;</BackButton>
      
      <FaceCircle borderColor={borderColor}>
        <VideoContainer>
          <Video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            onLoadedMetadata={() => {
              if (videoRef.current) {
                const video = videoRef.current;
                // 비디오 크기 설정
                video.width = video.videoWidth || 640;
                video.height = video.videoHeight || 480;
                
                // 캔버스 크기도 설정
                if (canvasRef.current) {
                  canvasRef.current.width = video.width;
                  canvasRef.current.height = video.height;
                }
              }
            }}
          />
          <Canvas ref={canvasRef} width={640} height={480} />
          
          {/* 가이드라인 렌더링 */}
          {renderGuidelines()}
          
          <GuideLine>
            {stateTimer > 0 && (
              <TimerDisplay>{stateTimer}</TimerDisplay>
            )}
          </GuideLine>
          
          {/* 타이머 원형 게이지 */}
          {stateTimer > 0 && (
            <TimerCircleContainer>
              <TimerCircleSVG viewBox="0 0 500 500">
                <TimerCirclePath 
                  cx="250" 
                  cy="250" 
                  r="248" 
                  progress={timerProgress} 
                  color="#4285F4" 
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
       detectionState !== FaceDetectionState.VERIFYING && (
        renderProgressSteps()
      )}
      
      {detectionState === FaceDetectionState.INIT && !loadingError && (
        <>
          <Button onClick={handleStartCamera} disabled={!modelsLoaded}>
            {modelsLoaded ? "카메라 켜기" : "모델 로딩 중..."}
          </Button>
          {/* 색상 안내 */}
          {renderColorGuide()}
        </>
      )}
      
      {loadingError && (
        <Button onClick={() => window.location.reload()}>
          다시 시도하기
        </Button>
      )}
    </Container>
  );
};

export default FaceRecognition;