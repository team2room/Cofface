import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import * as tf from '@tensorflow/tfjs';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import './FaceRegistration.css';

// 방향 타입 정의
type Direction = 'front' | 'left' | 'right' | 'up' | 'down';

// 각도 타입 정의
interface Angle {
  yaw: number;
  pitch: number;
}

// 랜드마크 타입 정의
interface ReferencePoints {
  leftEye: number[];
  rightEye: number[];
  nose: number[];
  leftMouth: number[];
  rightMouth: number[];
  // 추가 기준점
  leftCheek: number[];
  rightCheek: number[];
  forehead: number[];
  chin: number[];
}

// 얼굴 정보 타입 정의
interface FaceInfo {
  boundingBox: {
    xMin: number;
    yMin: number;
    width: number;
    height: number;
  };
  faceWidth: number;
  faceHeight: number;
  faceCenter: {
    x: number;
    y: number;
  };
  distanceFromCenter: number;
  maxDistance: number;
  minFaceWidth: number;
  maxFaceWidth: number;
  isPositionValid: boolean;
  isSizeValid: boolean;
  landmarks: number[][];
  leftEye: number[];
  rightEye: number[];
  nose: number[];
  leftMouth: number[];
  rightMouth: number[];
  leftCheek: number[];
  rightCheek: number[];
  forehead: number[];
  chin: number[];
  angle: Angle;
}

// 방향 정의
const DIRECTIONS: Direction[] = ['front', 'left', 'right', 'up', 'down'];

// 각 방향별 목표 각도
const TARGET_ANGLES: Record<Direction, Angle> = {
  front: { yaw: 0, pitch: 0 },
  left: { yaw: -30, pitch: 0 },
  right: { yaw: 30, pitch: 0 },
  up: { yaw: 0, pitch: -20 },
  down: { yaw: 0, pitch: 20 }
};

// 각도 허용 오차
const ANGLE_THRESHOLD = 5;

// 안정화 시간 (초)
const STABLE_TIME_REQUIRED = 3;

// 이미지 품질 기준
const IMAGE_QUALITY = {
  minBrightness: 40,
  maxBrightness: 240,
  minSharpness: 50,
  minFaceRatio: 0.2,  // 화면 대비 얼굴 크기 최소 비율 (더 크게 설정)
  maxFaceRatio: 0.7   // 화면 대비 얼굴 크기 최대 비율
};

// 주요 랜드마크 인덱스 (MediaPipe FaceMesh 기준)
const LANDMARK_INDICES = {
  leftEye: 33,     // 왼쪽 눈
  rightEye: 263,   // 오른쪽 눈
  nose: 1,         // 코 끝
  leftMouth: 61,   // 왼쪽 입 끝
  rightMouth: 291, // 오른쪽 입 끝
  leftCheek: 50,   // 왼쪽 볼
  rightCheek: 280, // 오른쪽 볼
  forehead: 10,    // 이마 중앙
  chin: 152        // 턱 중앙
};

const FaceRegistration: React.FC = () => {
  // 상태 관리
  const [detector, setDetector] = useState<faceLandmarksDetection.FaceLandmarksDetector | null>(null);
  const [isModelLoading, setIsModelLoading] = useState<boolean>(true);
  const [currentDirection, setCurrentDirection] = useState<Direction>('front');
  const [registrationStatus, setRegistrationStatus] = useState<Record<Direction, boolean>>({
    front: false,
    left: false,
    right: false,
    up: false,
    down: false
  });
  const [referencePoints, setReferencePoints] = useState<ReferencePoints | null>(null);
  const [feedback, setFeedback] = useState<string>('모델을 불러오는 중입니다...');
  const [progress, setProgress] = useState<number>(0);
  const [stableStartTime, setStableStartTime] = useState<number | null>(null);
  const [isRegistrationComplete, setIsRegistrationComplete] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [capturedImages, setCapturedImages] = useState<Record<Direction, string>>({} as Record<Direction, string>);
  const [currentAngle, setCurrentAngle] = useState<Angle>({ yaw: 0, pitch: 0 });
  
  // 웹캠 및 캔버스 참조
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // 모델 로드
  useEffect(() => {
    const loadModel = async (): Promise<void> => {
      try {
        // TensorFlow.js 설정
        await tf.setBackend('webgl');
        console.log('TensorFlow.js 백엔드:', tf.getBackend());
        
        // 모델 로드 (새로운 API 사용)
        const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
        const detectorConfig = {
          runtime: 'tfjs' as const,
          refineLandmarks: true,
          maxFaces: 1
        };
        
        console.log('얼굴 감지 모델 로드 중...');
        const faceDetector = await faceLandmarksDetection.createDetector(
          model, 
          detectorConfig
        );
        console.log('얼굴 감지 모델 로드 완료!');
        
        setDetector(faceDetector);
        setIsModelLoading(false);
        setFeedback('얼굴을 화면 중앙에 위치시켜주세요');
      } catch (error) {
        console.error('모델 로드 오류:', error);
        setError('얼굴 인식 모델을 불러오는 데 실패했습니다.');
      }
    };
    
    loadModel();
    
    // 컴포넌트 언마운트 시 정리
    return () => {
      // 필요한 정리 작업
      if (detector && typeof detector.dispose === 'function') {
        detector.dispose();
      }
    };
  }, []);
  
  // 얼굴 감지 및 처리
  useEffect(() => {
    if (isModelLoading || !detector || isRegistrationComplete) return;
    
    let animationFrameId: number;
    
    const detectFace = async (): Promise<void> => {
      if (
        webcamRef.current && 
        webcamRef.current.video && 
        webcamRef.current.video.readyState === 4
      ) {
        const video = webcamRef.current.video;
        const canvas = canvasRef.current;
        
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        if (!ctx) return;
        
        // 캔버스 크기 설정
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        try {
          // 얼굴 감지 (새로운 API 사용)
          const faces = await detector.estimateFaces(video);
          
          // 화면 초기화
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          if (faces.length > 0) {
            const face = faces[0]; // 첫 번째 얼굴
            
            // 얼굴 정보 추출
            const faceInfo = extractFaceInfo(face, canvas.width, canvas.height);
            
            // 현재 각도 업데이트
            setCurrentAngle(faceInfo.angle);
            
            // 가이드 그리기
            drawFaceGuide(ctx, faceInfo, canvas.width, canvas.height, currentDirection);
            
            // 현재 방향에 따른 검증
            const isValid = validateFace(faceInfo, currentDirection);
            
            if (isValid) {
              // 안정화 시간 계산
              if (!stableStartTime) {
                setStableStartTime(Date.now());
              } else {
                const stableDuration = (Date.now() - stableStartTime) / 1000;
                const progressValue = Math.min(1.0, stableDuration / STABLE_TIME_REQUIRED);
                setProgress(progressValue);
                
                setFeedback(`유지해주세요... (${Math.round(progressValue * 100)}%)`);
                
                // 안정화 시간이 충족되면 촬영
                if (stableDuration >= STABLE_TIME_REQUIRED) {
                  await captureFace(currentDirection, faceInfo);
                }
              }
            } else {
              // 조건이 맞지 않으면 타이머 리셋
              if (stableStartTime) {
                setStableStartTime(null);
                setProgress(0);
              }
              
              // 피드백 메시지 생성
              const feedbackMessage = generateFeedback(faceInfo, currentDirection);
              setFeedback(feedbackMessage);
            }
          } else {
            // 얼굴이 감지되지 않음
            if (stableStartTime) {
              setStableStartTime(null);
              setProgress(0);
            }
            setFeedback('얼굴이 감지되지 않습니다');
            
            // 기본 가이드 그리기
            drawDefaultGuide(ctx, canvas.width, canvas.height, currentDirection);
          }
        } catch (error) {
          console.error('얼굴 감지 오류:', error);
        }
      }
      
      // 다음 프레임 요청
      animationFrameId = requestAnimationFrame(detectFace);
    };
    
    detectFace();
    
    // 정리 함수
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isModelLoading, detector, currentDirection, stableStartTime, isRegistrationComplete]);
  
  // 얼굴 정보 추출 (향상된 버전)
  const extractFaceInfo = (
    face: any, // any 타입으로 임시 처리 (타입 호환성 문제)
    canvasWidth: number, 
    canvasHeight: number
  ): FaceInfo => {
    // API 형식 변화로 인한 호환성 처리
    let xMin = 0, yMin = 0, width = 0, height = 0;
    
    // box 또는 boundingBox 속성 확인
    if (face.box) {
      // 새로운 API 형식
      xMin = face.box.xMin || 0;
      yMin = face.box.yMin || 0;
      width = face.box.width || 0;
      height = face.box.height || 0;
    } else if (face.boundingBox) {
      // 이전 API 형식
      xMin = face.boundingBox.topLeft?.[0] || 0;
      yMin = face.boundingBox.topLeft?.[1] || 0;
      
      const bottomRight = face.boundingBox.bottomRight || [0, 0];
      width = (bottomRight[0] || 0) - xMin;
      height = (bottomRight[1] || 0) - yMin;
    } else {
      // 최후 방법: 키포인트로 경계 상자 예측
      if (face.keypoints && face.keypoints.length > 0) {
        const xs = face.keypoints.map((p: any) => p.x);
        const ys = face.keypoints.map((p: any) => p.y);
        
        xMin = Math.min(...xs);
        yMin = Math.min(...ys);
        const xMax = Math.max(...xs);
        const yMax = Math.max(...ys);
        
        width = xMax - xMin;
        height = yMax - yMin;
      }
    }
    
    // 얼굴 경계 상자
    const boundingBox = {
      xMin,
      yMin,
      width,
      height
    };
    
    // 얼굴 크기
    const faceWidth = boundingBox.width;
    const faceHeight = boundingBox.height;
    
    // 얼굴 중심
    const faceCenter = {
      x: boundingBox.xMin + faceWidth / 2,
      y: boundingBox.yMin + faceHeight / 2
    };
    
    // 화면 중심
    const screenCenter = {
      x: canvasWidth / 2,
      y: canvasHeight / 2
    };
    
    // 중심으로부터의 거리
    const distanceFromCenter = Math.sqrt(
      Math.pow(faceCenter.x - screenCenter.x, 2) +
      Math.pow(faceCenter.y - screenCenter.y, 2)
    );
    
    // 허용 거리 (화면 크기의 20%)
    const maxDistance = Math.min(canvasWidth, canvasHeight) * 0.2;
    
    // 얼굴 크기 검증 (화면 너비의 설정된 비율)
    const minFaceWidth = canvasWidth * IMAGE_QUALITY.minFaceRatio;
    const maxFaceWidth = canvasWidth * IMAGE_QUALITY.maxFaceRatio;
    
    // 랜드마크 추출 (API 변경에 따른 수정)
    const keypoints = face.keypoints || face.mesh || face.scaledMesh || [];
    const landmarksArray = keypoints.map((kp: any) => {
      if (Array.isArray(kp)) {
        // 이전 API 형식: 배열 [x, y, z]
        return kp;
      } else {
        // 새로운 API 형식: 객체 {x, y, z?}
        return [kp.x, kp.y, kp.z || 0];
      }
    });
    
    // 주요 랜드마크 추출
    const landmarks = {
      leftEye: landmarksArray[LANDMARK_INDICES.leftEye] || [0, 0, 0],
      rightEye: landmarksArray[LANDMARK_INDICES.rightEye] || [0, 0, 0],
      nose: landmarksArray[LANDMARK_INDICES.nose] || [0, 0, 0],
      leftMouth: landmarksArray[LANDMARK_INDICES.leftMouth] || [0, 0, 0],
      rightMouth: landmarksArray[LANDMARK_INDICES.rightMouth] || [0, 0, 0],
      leftCheek: landmarksArray[LANDMARK_INDICES.leftCheek] || [0, 0, 0],
      rightCheek: landmarksArray[LANDMARK_INDICES.rightCheek] || [0, 0, 0],
      forehead: landmarksArray[LANDMARK_INDICES.forehead] || [0, 0, 0],
      chin: landmarksArray[LANDMARK_INDICES.chin] || [0, 0, 0]
    };
    
    // 각도 계산 (향상된 방식)
    let angle: Angle = { yaw: 0, pitch: 0 };
    
    if (referencePoints) {
      // 향상된 Yaw(좌우) 계산
      const eyeLineRef = Math.sqrt(
        Math.pow(referencePoints.rightEye[0] - referencePoints.leftEye[0], 2) + 
        Math.pow(referencePoints.rightEye[1] - referencePoints.leftEye[1], 2)
      );
      
      const eyeLineCurrent = Math.sqrt(
        Math.pow(landmarks.rightEye[0] - landmarks.leftEye[0], 2) + 
        Math.pow(landmarks.rightEye[1] - landmarks.leftEye[1], 2)
      );
      
      // 눈 사이 거리 비율로 깊이 추정
      const depthRatio = eyeLineCurrent / eyeLineRef;
      
      // 코와 눈 중앙 사이의 거리
      const eyeCenterRef = [
        (referencePoints.leftEye[0] + referencePoints.rightEye[0]) / 2,
        (referencePoints.leftEye[1] + referencePoints.rightEye[1]) / 2
      ];
      
      const eyeCenterCurrent = [
        (landmarks.leftEye[0] + landmarks.rightEye[0]) / 2,
        (landmarks.leftEye[1] + landmarks.rightEye[1]) / 2
      ];
      
      // 얼굴 중심점 이동 기반 Yaw 계산 (좌우 회전)
      const noseDiffX = (landmarks.nose[0] - eyeCenterCurrent[0]) - 
                        (referencePoints.nose[0] - eyeCenterRef[0]);
      
      // 정규화 및 스케일링 (30도를 기준으로 조정)
      const normalizedYaw = (noseDiffX / (faceWidth * 0.1)) * 30;
      angle.yaw = Math.max(-60, Math.min(60, normalizedYaw));
      
      // Pitch 계산 (상하 회전)
      const mouthCenterRef = [
        (referencePoints.leftMouth[0] + referencePoints.rightMouth[0]) / 2,
        (referencePoints.leftMouth[1] + referencePoints.rightMouth[1]) / 2
      ];
      
      const mouthCenterCurrent = [
        (landmarks.leftMouth[0] + landmarks.rightMouth[0]) / 2,
        (landmarks.leftMouth[1] + landmarks.rightMouth[1]) / 2
      ];
      
      // 코-입 사이 거리 변화 기반 Pitch 계산
      const noseToMouthRef = Math.sqrt(
        Math.pow(referencePoints.nose[0] - mouthCenterRef[0], 2) + 
        Math.pow(referencePoints.nose[1] - mouthCenterRef[1], 2)
      );
      
      const noseToMouthCurrent = Math.sqrt(
        Math.pow(landmarks.nose[0] - mouthCenterCurrent[0], 2) + 
        Math.pow(landmarks.nose[1] - mouthCenterCurrent[1], 2)
      );
      
      const pitchRatio = noseToMouthCurrent / noseToMouthRef;
      
      // 이마-턱 라인 기울기 변화
      const foreheadToChinAngleRef = Math.atan2(
        referencePoints.chin[1] - referencePoints.forehead[1],
        referencePoints.chin[0] - referencePoints.forehead[0]
      );
      
      const foreheadToChinAngleCurrent = Math.atan2(
        landmarks.chin[1] - landmarks.forehead[1],
        landmarks.chin[0] - landmarks.forehead[0]
      );
      
      const angleDiff = (foreheadToChinAngleCurrent - foreheadToChinAngleRef) * (180 / Math.PI);
      
      // 최종 Pitch 계산 (여러 요소 조합)
      const pitchFromRatio = (1 - pitchRatio) * 45;
      const normalizedPitch = (pitchFromRatio + angleDiff) / 2;
      angle.pitch = Math.max(-45, Math.min(45, normalizedPitch));
    }
    
    return {
      boundingBox,
      faceWidth,
      faceHeight,
      faceCenter,
      distanceFromCenter,
      maxDistance,
      minFaceWidth,
      maxFaceWidth,
      isPositionValid: distanceFromCenter <= maxDistance,
      isSizeValid: minFaceWidth <= faceWidth && faceWidth <= maxFaceWidth,
      landmarks: landmarksArray,
      leftEye: landmarks.leftEye,
      rightEye: landmarks.rightEye,
      nose: landmarks.nose,
      leftMouth: landmarks.leftMouth,
      rightMouth: landmarks.rightMouth,
      leftCheek: landmarks.leftCheek,
      rightCheek: landmarks.rightCheek,
      forehead: landmarks.forehead,
      chin: landmarks.chin,
      angle
    };
  };
  
  // 기본 가이드 그리기 (얼굴이 감지되지 않을 때)
  const drawDefaultGuide = (
    ctx: CanvasRenderingContext2D, 
    canvasWidth: number, 
    canvasHeight: number,
    direction: Direction
  ): void => {
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    const guideSize = Math.min(canvasWidth, canvasHeight) * 0.4;
    
    // 중앙 원 그리기
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, guideSize / 2, 0, 2 * Math.PI);
    ctx.stroke();
    
    // 방향 안내선 그리기
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    
    // 가로선
    ctx.beginPath();
    ctx.moveTo(centerX - guideSize / 2, centerY);
    ctx.lineTo(centerX + guideSize / 2, centerY);
    ctx.stroke();
    
    // 세로선
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - guideSize / 2);
    ctx.lineTo(centerX, centerY + guideSize / 2);
    ctx.stroke();
    
    // 방향별 목표 위치 표시
    const arrowSize = guideSize * 0.2;
    ctx.fillStyle = 'rgba(74, 108, 247, 0.7)';
    
    switch(direction) {
      case 'front':
        // 중앙에 원 표시
        ctx.beginPath();
        ctx.arc(centerX, centerY, arrowSize / 2, 0, 2 * Math.PI);
        ctx.fill();
        break;
      case 'left':
        // 왼쪽 화살표
        ctx.beginPath();
        ctx.moveTo(centerX - guideSize / 3, centerY);
        ctx.lineTo(centerX - guideSize / 3 + arrowSize, centerY - arrowSize / 2);
        ctx.lineTo(centerX - guideSize / 3 + arrowSize, centerY + arrowSize / 2);
        ctx.closePath();
        ctx.fill();
        break;
      case 'right':
        // 오른쪽 화살표
        ctx.beginPath();
        ctx.moveTo(centerX + guideSize / 3, centerY);
        ctx.lineTo(centerX + guideSize / 3 - arrowSize, centerY - arrowSize / 2);
        ctx.lineTo(centerX + guideSize / 3 - arrowSize, centerY + arrowSize / 2);
        ctx.closePath();
        ctx.fill();
        break;
      case 'up':
        // 위쪽 화살표
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - guideSize / 3);
        ctx.lineTo(centerX - arrowSize / 2, centerY - guideSize / 3 + arrowSize);
        ctx.lineTo(centerX + arrowSize / 2, centerY - guideSize / 3 + arrowSize);
        ctx.closePath();
        ctx.fill();
        break;
      case 'down':
        // 아래쪽 화살표
        ctx.beginPath();
        ctx.moveTo(centerX, centerY + guideSize / 3);
        ctx.lineTo(centerX - arrowSize / 2, centerY + guideSize / 3 - arrowSize);
        ctx.lineTo(centerX + arrowSize / 2, centerY + guideSize / 3 - arrowSize);
        ctx.closePath();
        ctx.fill();
        break;
    }
  };
  
  // 향상된 가이드 그리기
  const drawFaceGuide = (
    ctx: CanvasRenderingContext2D, 
    faceInfo: FaceInfo, 
    canvasWidth: number, 
    canvasHeight: number,
    direction: Direction
  ): void => {
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    
    // 중앙 원 그리기 (위치 검증용)
    ctx.strokeStyle = faceInfo.isPositionValid ? 'rgba(32, 201, 151, 0.7)' : 'rgba(220, 53, 69, 0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, faceInfo.maxDistance, 0, 2 * Math.PI);
    ctx.stroke();
    
    // 얼굴 바운딩 박스 그리기 (크기 검증용)
    ctx.strokeStyle = faceInfo.isSizeValid ? 'rgba(32, 201, 151, 0.7)' : 'rgba(220, 53, 69, 0.7)';
    ctx.lineWidth = 2;
    ctx.strokeRect(
      faceInfo.boundingBox.xMin,
      faceInfo.boundingBox.yMin,
      faceInfo.faceWidth,
      faceInfo.faceHeight
    );
    
    // 얼굴 특징점 그리기
    drawFacialLandmarks(ctx, faceInfo);
    
    // 각도 가이드 그리기
    drawAngleGuide(ctx, faceInfo, direction, canvasWidth, canvasHeight);
    
    // 진행 상태 바 그리기
    if (progress > 0) {
      const barWidth = 200;
      const barHeight = 20;
      const barX = (canvasWidth - barWidth) / 2;
      const barY = canvasHeight - 50;
      
      // 배경
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(barX, barY, barWidth, barHeight);
      
      // 진행률
      ctx.fillStyle = 'rgba(32, 201, 151, 0.7)';
      ctx.fillRect(barX, barY, barWidth * progress, barHeight);
      
      // 텍스트
      ctx.fillStyle = 'white';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${Math.round(progress * 100)}%`, barX + barWidth / 2, barY + barHeight / 2);
    }
    
    // 현재 각도 표시
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`Yaw: ${Math.round(faceInfo.angle.yaw)}°`, 10, 10);
    ctx.fillText(`Pitch: ${Math.round(faceInfo.angle.pitch)}°`, 10, 30);
  };
  
  // 얼굴 특징점 그리기
  const drawFacialLandmarks = (ctx: CanvasRenderingContext2D, faceInfo: FaceInfo): void => {
    // 눈 그리기
    ctx.fillStyle = 'rgba(0, 123, 255, 0.7)';
    ctx.beginPath();
    ctx.arc(faceInfo.leftEye[0], faceInfo.leftEye[1], 3, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(faceInfo.rightEye[0], faceInfo.rightEye[1], 3, 0, 2 * Math.PI);
    ctx.fill();
    
    // 코 그리기
    ctx.fillStyle = 'rgba(220, 53, 69, 0.7)';
    ctx.beginPath();
    ctx.arc(faceInfo.nose[0], faceInfo.nose[1], 3, 0, 2 * Math.PI);
    ctx.fill();
    
    // 입 그리기
    ctx.fillStyle = 'rgba(255, 193, 7, 0.7)';
    ctx.beginPath();
    ctx.arc(faceInfo.leftMouth[0], faceInfo.leftMouth[1], 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(faceInfo.rightMouth[0], faceInfo.rightMouth[1], 2, 0, 2 * Math.PI);
    ctx.fill();
    
    // 기준선 연결 (눈-코-입)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1;
    
    // 눈 연결선
    ctx.beginPath();
    ctx.moveTo(faceInfo.leftEye[0], faceInfo.leftEye[1]);
    ctx.lineTo(faceInfo.rightEye[0], faceInfo.rightEye[1]);
    ctx.stroke();
    
    // 코-입 중앙 연결
    const mouthCenter = [
      (faceInfo.leftMouth[0] + faceInfo.rightMouth[0]) / 2,
      (faceInfo.leftMouth[1] + faceInfo.rightMouth[1]) / 2
    ];
    
    ctx.beginPath();
    ctx.moveTo(faceInfo.nose[0], faceInfo.nose[1]);
    ctx.lineTo(mouthCenter[0], mouthCenter[1]);
    ctx.stroke();
    
    // 코-눈 중앙 연결
    const eyeCenter = [
      (faceInfo.leftEye[0] + faceInfo.rightEye[0]) / 2,
      (faceInfo.leftEye[1] + faceInfo.rightEye[1]) / 2
    ];
    
    ctx.beginPath();
    ctx.moveTo(faceInfo.nose[0], faceInfo.nose[1]);
    ctx.lineTo(eyeCenter[0], eyeCenter[1]);
    ctx.stroke();
  };
  
  // 각도 가이드 그리기
  const drawAngleGuide = (
    ctx: CanvasRenderingContext2D, 
    faceInfo: FaceInfo, 
    direction: Direction,
    canvasWidth: number,
    canvasHeight: number
  ): void => {
    const targetAngle = TARGET_ANGLES[direction];
    const currentAngle = faceInfo.angle;
    
    // 얼굴 중심점 계산
    const faceCenter = {
      x: (faceInfo.leftEye[0] + faceInfo.rightEye[0]) / 2,
      y: (faceInfo.leftEye[1] + faceInfo.rightEye[1] + faceInfo.nose[1]) / 3
    };
    
    const guideRadius = Math.min(canvasWidth, canvasHeight) * 0.2;
    
    // 기준선 그리기 (항상 중앙 수직선)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 3]);
    
    // 중앙 수직선
    ctx.beginPath();
    ctx.moveTo(canvasWidth / 2, faceCenter.y - guideRadius);
    ctx.lineTo(canvasWidth / 2, faceCenter.y + guideRadius);
    ctx.stroke();
    
    // 중앙 수평선
    ctx.beginPath();
    ctx.moveTo(canvasWidth / 2 - guideRadius, faceCenter.y);
    ctx.lineTo(canvasWidth / 2 + guideRadius, faceCenter.y);
    ctx.stroke();
    
    // 목표 각도 라인 그리기
    if (direction !== 'front') {
      ctx.strokeStyle = 'rgba(74, 108, 247, 0.7)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 3]);
      
      const guideLength = guideRadius * 0.8;
      
      if (direction === 'left' || direction === 'right') {
        // Yaw 각도 가이드 (좌우)
        const angleInRadians = (targetAngle.yaw * Math.PI) / 180;
        const guideX = canvasWidth / 2 + Math.sin(angleInRadians) * guideLength;
        const guideY = faceCenter.y;
        
        ctx.beginPath();
        ctx.moveTo(canvasWidth / 2, faceCenter.y);
        ctx.lineTo(guideX, guideY);
        ctx.stroke();
        
        // 허용 각도 범위 표시
        ctx.strokeStyle = 'rgba(74, 108, 247, 0.3)';
        ctx.lineWidth = 1;
        
        // 최소 각도
        const minAngleInRadians = ((targetAngle.yaw - ANGLE_THRESHOLD) * Math.PI) / 180;
        const minGuideX = canvasWidth / 2 + Math.sin(minAngleInRadians) * guideLength;
        
        ctx.beginPath();
        ctx.moveTo(canvasWidth / 2, faceCenter.y);
        ctx.lineTo(minGuideX, faceCenter.y);
        ctx.stroke();
        
        // 최대 각도
        const maxAngleInRadians = ((targetAngle.yaw + ANGLE_THRESHOLD) * Math.PI) / 180;
        const maxGuideX = canvasWidth / 2 + Math.sin(maxAngleInRadians) * guideLength;
        
        ctx.beginPath();
        ctx.moveTo(canvasWidth / 2, faceCenter.y);
        ctx.lineTo(maxGuideX, faceCenter.y);
        ctx.stroke();
        
        // 현재 각도 표시
        const currentYawInRadians = (currentAngle.yaw * Math.PI) / 180;
        const currentX = canvasWidth / 2 + Math.sin(currentYawInRadians) * guideLength;
        
        // 현재 각도가 허용 범위 내인지 확인
        const isInRange = Math.abs(currentAngle.yaw - targetAngle.yaw) <= ANGLE_THRESHOLD;
        
        // 현재 각도선
        ctx.strokeStyle = isInRange ? 'rgba(32, 201, 151, 0.7)' : 'rgba(220, 53, 69, 0.7)';
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        
        ctx.beginPath();
        ctx.moveTo(canvasWidth / 2, faceCenter.y);
        ctx.lineTo(currentX, faceCenter.y);
        ctx.stroke();
        
        // 현재 각도 표시 점
        ctx.fillStyle = isInRange ? 'rgba(32, 201, 151, 0.7)' : 'rgba(220, 53, 69, 0.7)';
        ctx.beginPath();
        ctx.arc(currentX, faceCenter.y, 5, 0, 2 * Math.PI);
        ctx.fill();
      } else if (direction === 'up' || direction === 'down') {
        // Pitch 각도 가이드 (상하)
        const angleInRadians = (targetAngle.pitch * Math.PI) / 180;
        const guideX = canvasWidth / 2;
        const guideY = faceCenter.y + Math.sin(angleInRadians) * guideLength;
        
        ctx.beginPath();
        ctx.moveTo(canvasWidth / 2, faceCenter.y);
        ctx.lineTo(guideX, guideY);
        ctx.stroke();
        
        // 허용 각도 범위 표시
        ctx.strokeStyle = 'rgba(74, 108, 247, 0.3)';
        ctx.lineWidth = 1;
        
        // 최소 각도
        const minAngleInRadians = ((targetAngle.pitch - ANGLE_THRESHOLD) * Math.PI) / 180;
        const minGuideY = faceCenter.y + Math.sin(minAngleInRadians) * guideLength;
        
        ctx.beginPath();
        ctx.moveTo(canvasWidth / 2, faceCenter.y);
        ctx.lineTo(guideX, minGuideY);
        ctx.stroke();
        
        // 최대 각도
        const maxAngleInRadians = ((targetAngle.pitch + ANGLE_THRESHOLD) * Math.PI) / 180;
        const maxGuideY = faceCenter.y + Math.sin(maxAngleInRadians) * guideLength;
        
        ctx.beginPath();
        ctx.moveTo(canvasWidth / 2, faceCenter.y);
        ctx.lineTo(guideX, maxGuideY);
        ctx.stroke();
        
        // 현재 각도 표시
        const currentPitchInRadians = (currentAngle.pitch * Math.PI) / 180;
        const currentY = faceCenter.y + Math.sin(currentPitchInRadians) * guideLength;
        
        // 현재 각도가 허용 범위 내인지 확인
        const isInRange = Math.abs(currentAngle.pitch - targetAngle.pitch) <= ANGLE_THRESHOLD;
        
        // 현재 각도선
        ctx.strokeStyle = isInRange ? 'rgba(32, 201, 151, 0.7)' : 'rgba(220, 53, 69, 0.7)';
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        
        ctx.beginPath();
        ctx.moveTo(canvasWidth / 2, faceCenter.y);
        ctx.lineTo(guideX, currentY);
        ctx.stroke();
        
        // 현재 각도 표시 점
        ctx.fillStyle = isInRange ? 'rgba(32, 201, 151, 0.7)' : 'rgba(220, 53, 69, 0.7)';
        ctx.beginPath();
        ctx.arc(guideX, currentY, 5, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
    
    // 대시 설정 초기화
    ctx.setLineDash([]);
  };
  
  // 얼굴 검증
  const validateFace = (faceInfo: FaceInfo, direction: Direction): boolean => {
    // 위치와 크기 검증
    if (!faceInfo.isPositionValid || !faceInfo.isSizeValid) {
      return false;
    }
    
    // 정면 촬영일 때는 위치와 크기만 검증
    if (direction === 'front' && !referencePoints) {
      return true;
    }
    
    // 다른 방향일 때는 각도 검증
    const targetAngle = TARGET_ANGLES[direction];
    const yawDiff = Math.abs(faceInfo.angle.yaw - targetAngle.yaw);
    const pitchDiff = Math.abs(faceInfo.angle.pitch - targetAngle.pitch);
    
    // 방향에 따라 주요 각도만 검증
    if (direction === 'left' || direction === 'right') {
      // 좌우 방향은 Yaw 각도만 중요하게 검증
      return yawDiff <= ANGLE_THRESHOLD;
    } else if (direction === 'up' || direction === 'down') {
      // 상하 방향은 Pitch 각도만 중요하게 검증
      return pitchDiff <= ANGLE_THRESHOLD;
    }
    
    // 그 외에는 둘 다 검증
    return yawDiff <= ANGLE_THRESHOLD && pitchDiff <= ANGLE_THRESHOLD;
  };
  
  // 피드백 메시지 생성
  const generateFeedback = (faceInfo: FaceInfo, direction: Direction): string => {
    if (!faceInfo.isPositionValid) {
      return '얼굴을 화면 중앙에 위치시켜주세요';
    }
    
    if (!faceInfo.isSizeValid) {
      if (faceInfo.faceWidth < faceInfo.minFaceWidth) {
        return '얼굴을 더 가까이 해주세요';
      } else {
        return '얼굴을 더 멀리 해주세요';
      }
    }
    
    if (direction !== 'front' || referencePoints) {
      const targetAngle = TARGET_ANGLES[direction];
      
      if (direction === 'left' || direction === 'right') {
        // 좌우 방향 피드백
        const yawDiff = faceInfo.angle.yaw - targetAngle.yaw;
        
        if (Math.abs(yawDiff) > ANGLE_THRESHOLD) {
          if (direction === 'left') {
            return yawDiff < 0
              ? '고개를 왼쪽으로 더 돌려주세요'
              : '고개를 오른쪽으로 더 돌려주세요';
          } else { // right
            return yawDiff > 0
              ? '고개를 오른쪽으로 더 돌려주세요'
              : '고개를 왼쪽으로 더 돌려주세요';
          }
        }
      } else if (direction === 'up' || direction === 'down') {
        // 상하 방향 피드백
        const pitchDiff = faceInfo.angle.pitch - targetAngle.pitch;
        
        if (Math.abs(pitchDiff) > ANGLE_THRESHOLD) {
          if (direction === 'up') {
            return pitchDiff > 0
              ? '고개를 위로 더 들어주세요'
              : '고개를 아래로 더 숙여주세요';
          } else { // down
            return pitchDiff < 0
              ? '고개를 아래로 더 숙여주세요'
              : '고개를 위로 더 들어주세요';
          }
        }
      }
    }
    
    return '좋습니다! 유지해주세요...';
  };
  
  // 얼굴 캡처
  const captureFace = async (direction: Direction, faceInfo: FaceInfo): Promise<void> => {
    if (!webcamRef.current) return;
    
    try {
      // 현재 프레임 캡처
      const imageSrc = webcamRef.current.getScreenshot();
      
      if (!imageSrc) {
        throw new Error('이미지 캡처에 실패했습니다.');
      }
      
      // 첫 번째 촬영(정면)일 경우 기준점 저장
      if (direction === 'front') {
        // 기준점 저장 (캡처한 얼굴 정보 사용)
        setReferencePoints({
          leftEye: faceInfo.leftEye,
          rightEye: faceInfo.rightEye,
          nose: faceInfo.nose,
          leftMouth: faceInfo.leftMouth,
          rightMouth: faceInfo.rightMouth,
          leftCheek: faceInfo.leftCheek,
          rightCheek: faceInfo.rightCheek,
          forehead: faceInfo.forehead,
          chin: faceInfo.chin
        });
      }
      
      // 이미지 저장
      setCapturedImages(prev => ({
        ...prev,
        [direction]: imageSrc
      }));
      
      // 상태 업데이트
      setRegistrationStatus(prev => ({
        ...prev,
        [direction]: true
      }));
      
      // 타이머 리셋
      setStableStartTime(null);
      setProgress(0);
      
      // 피드백 메시지
      setFeedback(`${direction} 방향 촬영 완료!`);
      
      // 다음 방향으로 이동 또는 완료
      const nextDirection = getNextDirection();
      if (nextDirection) {
        setTimeout(() => {
          setCurrentDirection(nextDirection);
          setFeedback(getDirectionMessage(nextDirection));
        }, 1500); // 잠시 대기 후 다음 방향으로
      } else {
        // 모든 방향 완료 - 테스트 모드에서는 여기서 완료 처리
        setFeedback('얼굴 등록이 완료되었습니다!');
        setIsRegistrationComplete(true);
      }
    } catch (error) {
      console.error('얼굴 캡처 오류:', error);
      setError('얼굴 캡처 중 오류가 발생했습니다.');
      setStableStartTime(null);
      setProgress(0);
    }
  };
  
  // 다음 방향 가져오기
  const getNextDirection = (): Direction | null => {
    for (const direction of DIRECTIONS) {
      if (!registrationStatus[direction]) {
        return direction;
      }
    }
    return null; // 모든 방향 완료
  };
  
  // 방향별 안내 메시지
  const getDirectionMessage = (direction: Direction): string => {
    const messages: Record<Direction, string> = {
      front: '얼굴을 정면으로 바라봐주세요',
      left: '고개를 왼쪽으로 약 30도 정도 돌려주세요',
      right: '고개를 오른쪽으로 약 30도 정도 돌려주세요',
      up: '고개를 위로 약 20도 정도 들어주세요',
      down: '고개를 아래로 약 20도 정도 숙여주세요'
    };
    return messages[direction];
  };
  
  // 에러 처리
  if (error) {
    return (
      <div className="face-registration-container error">
        <h2>오류 발생</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>다시 시도</button>
      </div>
    );
  }
  
  // 로딩 화면
  if (isModelLoading) {
    return (
      <div className="face-registration-container loading">
        <h2>얼굴 인식 모델 로딩 중...</h2>
        <div className="spinner"></div>
        <p>잠시만 기다려주세요.</p>
      </div>
    );
  }
  
  // 완료 화면
  if (isRegistrationComplete) {
    return (
      <div className="face-registration-container complete">
        <h2>얼굴 등록 완료</h2>
        <p>얼굴 등록이 성공적으로 완료되었습니다.</p>
        <p>등록된 이미지 수: {Object.keys(capturedImages).length}/5</p>
        <div className="captured-images">
          {DIRECTIONS.map(dir => 
            capturedImages[dir] ? (
              <div key={dir} className="captured-image">
                <p>{dir}</p>
                <img src={capturedImages[dir]} alt={`${dir} face`} width="120" />
              </div>
            ) : null
          )}
        </div>
        <button onClick={() => window.location.reload()}>다시 시작</button>
      </div>
    );
  }
  
  // 등록 화면
  return (
    <div className="face-registration-container">
      <h2>얼굴 등록</h2>
      <p className="direction-guide">
        {getDirectionMessage(currentDirection)}
      </p>
      
      <div className="webcam-container">
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          width={640}
          height={480}
          videoConstraints={{
            width: 640,
            height: 480,
            facingMode: "user"
          }}
          mirrored={true}
        />
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          className="face-canvas"
        />
        
        <div className="feedback-message">
          {feedback}
        </div>
      </div>
      
      <div className="registration-progress">
        <div className="progress-labels">
          {DIRECTIONS.map(direction => (
            <div 
              key={direction}
              className={`direction-label ${currentDirection === direction ? 'active' : ''} ${registrationStatus[direction] ? 'completed' : ''}`}
            >
              {direction}
              {registrationStatus[direction] && <span className="check-mark">✓</span>}
            </div>
          ))}
        </div>
      </div>
      
      <div className="angle-info">
        <p>현재 각도: Yaw {Math.round(currentAngle.yaw)}° / Pitch {Math.round(currentAngle.pitch)}°</p>
        <p>목표 각도: {
          currentDirection !== 'front' 
            ? `${currentDirection === 'left' || currentDirection === 'right' 
                ? `Yaw ${TARGET_ANGLES[currentDirection].yaw}° ± ${ANGLE_THRESHOLD}°` 
                : `Pitch ${TARGET_ANGLES[currentDirection].pitch}° ± ${ANGLE_THRESHOLD}°`}`
            : '정면'
        }</p>
      </div>
    </div>
  );
};

export default FaceRegistration;