// FaceLogin.tsx
import React, { useState, useEffect, useRef } from 'react';
import * as mp from '@mediapipe/face_mesh';
import * as cam from '@mediapipe/camera_utils';

// API 기능 가져오기
import { FaceVerificationWebSocket, RealSenseWebSocket, checkServerHealth } from './api';

// 스타일 컴포넌트 및 유틸리티 가져오기
import {
  Container,
  ContentWrapper,
  CameraColumn,
  InfoColumn,
  BackButton,
  Message,
  SubMessage,
  Button,
  FaceCircle,
  VideoContainer,
  Video,
  Canvas,
  GuideLine,
} from './styles';

// 타입 가져오기
import { RotationState } from './types';
import { calculateFaceRotation, checkFaceInCircle } from './utils';

const FaceLogin: React.FC = () => {
  // 기본 상태
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [modelsLoaded, setModelsLoaded] = useState<boolean>(false);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [faceDetected, setFaceDetected] = useState<boolean>(false);
  const [faceWithinBounds, setFaceWithinBounds] = useState<boolean>(false);
  const [borderColor, setBorderColor] = useState<string>('#333');
  const [rotation, setRotation] = useState<RotationState>({
    roll: 0,
    pitch: 0,
    yaw: 0,
  });
  const [serverStatus, setServerStatus] = useState<any>(null);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  
  // 웹소켓 관련 상태
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [realTimeVerification, setRealTimeVerification] = useState<boolean>(false);
  
  // RealSense 관련 상태 추가
  const [realsenseConnected, setRealsenseConnected] = useState<boolean>(false);
  const [realsenseRgbFrame, setRealsenseRgbFrame] = useState<string | null>(null);
  const [depthFrame, setDepthFrame] = useState<string | null>(null);
  const [depthStats, setDepthStats] = useState<any>(null);
  const [livenessResult, setLivenessResult] = useState<any>(null);
  const [useRealsenseCamera, setUseRealsenseCamera] = useState<boolean>(false);
  
  // 참조 객체들
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const debugCanvasRef = useRef<HTMLCanvasElement>(null);
  const faceMeshRef = useRef<mp.FaceMesh | null>(null);
  const cameraRef = useRef<cam.Camera | null>(null);
  const lastFrameRef = useRef<ImageData | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const realsenseVideoRef = useRef<HTMLImageElement>(null);
  
  // 웹소켓 참조 추가
  const wsRef = useRef<FaceVerificationWebSocket | null>(null);
  const realsenseWsRef = useRef<RealSenseWebSocket | null>(null);
  const verificationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastRecognitionTimeRef = useRef<number>(0);

  // MediaPipe FaceMesh 모델 로드
  useEffect(() => {
    const loadMediaPipeModels = async (): Promise<void> => {
      try {
        console.log('MediaPipe 모델 로딩 시작...');
        
        // 약간의 지연 후 초기화 (WASM 로딩 시간 확보)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // MediaPipe FaceMesh 초기화
        const faceMesh = new mp.FaceMesh({
          locateFile: (file) => {
            console.log(`MediaPipe 파일 요청: ${file}`);
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/${file}`;
          },
        });

        // 설정
        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
          enableFaceGeometry: false  // 더 적은 얼굴 점 사용
        });

        console.log('MediaPipe FaceMesh 옵션 설정 완료');

        // onResults 설정 전에 잠시 대기 (WASM 준비 시간)
        await new Promise(resolve => setTimeout(resolve, 500));

        // 결과 처리 콜백 설정
        faceMesh.onResults(onResults);

        // 참조 저장
        faceMeshRef.current = faceMesh;

        console.log('MediaPipe 모델 로딩 완료');
        setModelsLoaded(true);
      } catch (error) {
        console.error('MediaPipe 모델 로딩 오류:', error);
        setLoadingError(
          `모델 로딩 오류: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    };

    // 서버 상태 확인
    const checkServerStatus = async () => {
      try {
        const status = await checkServerHealth();
        setServerStatus(status);
        console.log('서버 상태:', status);
        
        // RealSense 사용 가능 여부 확인
        if (status.realsense_available) {
          connectToRealSense();
        }
      } catch (error) {
        console.error('서버 상태 확인 오류:', error);
        setError(
          '백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인하세요.'
        );
      }
    };

    loadMediaPipeModels();
    checkServerStatus();

    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      if (faceMeshRef.current) {
        faceMeshRef.current.close();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (realsenseWsRef.current) {
        realsenseWsRef.current.disconnect();
      }
      if (verificationIntervalRef.current) {
        clearInterval(verificationIntervalRef.current);
      }
    };
  }, []);

  // 웹소켓 초기화
  const initializeWebSocket = () => {
    const onMessage = (data: any) => {
      console.log('WebSocket 메시지 수신:', data);
      
      switch (data.type) {
        case 'success':
          setVerificationResult({
            matched: true,
            user_id: data.user_id,
            confidence: data.confidence,
            processing_time: data.processing_time,
            liveness_result: data.liveness_result
          });
          setIsProcessing(false);
          
          // 성공시 실시간 인증 중지
          if (realTimeVerification) {
            stopRealTimeVerification();
          }
          break;
          
        case 'failure':
          setVerificationResult({
            matched: false,
            user_id: null,
            confidence: 0.0,
            processing_time: data.processing_time,
            liveness_result: data.liveness_result
          });
          setIsProcessing(false);
          break;
          
        case 'error':
          setError(data.message);
          setIsProcessing(false);
          break;
          
        case 'pong':
          // 연결 유지 확인
          break;
      }
    };
    
    const onError = (event: Event) => {
      console.error('WebSocket 오류:', event);
      setError('WebSocket 연결 오류가 발생했습니다.');
      setWsConnected(false);
    };
    
    const onClose = () => {
      console.log('WebSocket 연결 종료');
      setWsConnected(false);
      setRealTimeVerification(false);
    };
    
    const onOpen = () => {
      console.log('WebSocket 연결 성공');
      setWsConnected(true);
      setError(null);
    };
    
    wsRef.current = new FaceVerificationWebSocket(onMessage, onError, onClose, onOpen);
    wsRef.current.connect();
  };

  // RealSense 연결 함수
  const connectToRealSense = () => {
    console.log('=== RealSense 연결 시작 ===');

    // 이전 웹소켓 연결이 있으면 닫기
    if (realsenseWsRef.current) {
      realsenseWsRef.current.disconnect();
    }

    const onFrame = (data: any) => {
      if (data.type === 'frame') {
        // RGB 이미지 설정
        if (data.rgb_image) {
          setRealsenseRgbFrame(data.rgb_image);
        }
        
        // Depth 이미지 설정
        if (data.depth_image) {
          setDepthFrame(data.depth_image);
        }
        
        // Depth 통계 설정
        if (data.depth_stats) {
          setDepthStats(data.depth_stats);
        }
        
        // 라이브니스 결과가 있으면 저장
        if (data.liveness_result) {
          setLivenessResult(data.liveness_result);
        }
      }
    };

    const onError = (error: Event) => {
      console.error('RealSense WebSocket 오류:', error);
      setRealsenseConnected(false);
      setError('RealSense 연결 오류: 서버와의 연결을 확인하세요.');
    };

    const onClose = () => {
      console.log('RealSense WebSocket 연결 종료');
      setRealsenseConnected(false);
    };

    const onOpen = () => {
      console.log('RealSense WebSocket 연결 성공');
      setRealsenseConnected(true);
      setError(null);
    };

    const ws = new RealSenseWebSocket(onFrame, onError, onClose, onOpen);
    ws.connect();
    realsenseWsRef.current = ws;
  };

  // 컴포넌트 마운트시 웹소켓 초기화
  useEffect(() => {
    initializeWebSocket();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect();
      }
      if (verificationIntervalRef.current) {
        clearInterval(verificationIntervalRef.current);
      }
    };
  }, []);

  // 실시간 인식 모드 변경 시 처리
  useEffect(() => {
    if (realTimeVerification) {
      startRealTimeVerification();
    } else {
      stopRealTimeVerification();
    }
    
    return () => {
      if (verificationIntervalRef.current) {
        clearInterval(verificationIntervalRef.current);
        verificationIntervalRef.current = null;
      }
    };
  }, [realTimeVerification]);

  // MediaPipe 결과 처리 함수
  const onResults = (results: mp.Results): void => {
    if (!canvasRef.current || !videoRef.current) return;

    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext('2d');

    if (!canvasCtx) return;

    // 최근 프레임 저장 (인증용)
    if (results.image) {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = results.image.width;
      tempCanvas.height = results.image.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx) {
        tempCtx.drawImage(
          results.image,
          0,
          0,
          tempCanvas.width,
          tempCanvas.height
        );
        const imageData = tempCtx.getImageData(
          0,
          0,
          tempCanvas.width,
          tempCanvas.height
        );
        lastFrameRef.current = imageData;
      }
    }

    // 캔버스 지우기
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    // 비디오를 캔버스에 그리기
    canvasCtx.drawImage(
      results.image,
      0,
      0,
      canvasElement.width,
      canvasElement.height
    );

    // 얼굴이 감지되었는지 확인
    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      const landmarks = results.multiFaceLandmarks[0];

      // 이전 상태가 false였으면 로그 출력
      if (!faceDetected) {
        console.log('얼굴 감지 시작됨');
      }

      setFaceDetected(true);

      // 얼굴이 원 안에 있는지 확인
      const isFaceInCircle = checkFaceInCircle(landmarks);
      setFaceWithinBounds(isFaceInCircle);

      // 얼굴 랜드마크 그리기
      canvasCtx.strokeStyle = '#E0E0E0';
      canvasCtx.lineWidth = 2;

      // 눈 그리기
      // 왼쪽 눈
      canvasCtx.beginPath();
      [33, 133, 160, 159, 158, 144, 145, 153, 33].forEach((index, i) => {
        const point = landmarks[index];
        if (i === 0) {
          canvasCtx.moveTo(
            point.x * canvasElement.width,
            point.y * canvasElement.height
          );
        } else {
          canvasCtx.lineTo(
            point.x * canvasElement.width,
            point.y * canvasElement.height
          );
        }
      });
      canvasCtx.stroke();

      // 오른쪽 눈
      canvasCtx.beginPath();
      [263, 362, 387, 386, 385, 373, 374, 380, 263].forEach((index, i) => {
        const point = landmarks[index];
        if (i === 0) {
          canvasCtx.moveTo(
            point.x * canvasElement.width,
            point.y * canvasElement.height
          );
        } else {
          canvasCtx.lineTo(
            point.x * canvasElement.width,
            point.y * canvasElement.height
          );
        }
      });
      canvasCtx.stroke();

      // 입 그리기
      canvasCtx.beginPath();
      [
        61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17,
        84, 181, 91, 146, 61,
      ].forEach((index, i) => {
        const point = landmarks[index];
        if (i === 0) {
          canvasCtx.moveTo(
            point.x * canvasElement.width,
            point.y * canvasElement.height
          );
        } else {
          canvasCtx.lineTo(
            point.x * canvasElement.width,
            point.y * canvasElement.height
          );
        }
      });
      canvasCtx.stroke();

      // 3D 방향 계산 (roll, pitch, yaw)
      const rotationValues = calculateFaceRotation(landmarks);
      setRotation(rotationValues);

      // 디버그 캔버스 업데이트
      updateDebugCanvas(rotationValues);

      // 경계선 색상 설정 - 라이브니스 결과가 있으면 반영
      if (livenessResult) {
        if (livenessResult.is_live) {
          setBorderColor(isFaceInCircle ? '#00c853' : '#FFC107'); // 실제 얼굴이면 위치에 따라 초록/노랑
        } else {
          setBorderColor('#f44336'); // 가짜 얼굴이면 빨간색
        }
      } else {
        // 라이브니스 결과가 없는 경우 기존 로직
        if (isFaceInCircle) {
          setBorderColor('#00c853'); // 올바른 위치 (초록색)
        } else {
          setBorderColor('#FFC107'); // 얼굴이 원 밖에 있음 (노란색)
        }
      }

      // 실시간 모드에서 얼굴 인식 자동 시도
      if (realTimeVerification && isFaceInCircle && faceDetected && !useRealsenseCamera) {
        const currentTime = Date.now();
        // 마지막 인식 시도 후 2초 이상 지났을 때만 시도
        if (currentTime - lastRecognitionTimeRef.current > 2000) {
          performRealTimeRecognition();
        }
      }
    } else {
      // 이전 상태가 true였으면 로그 출력
      if (faceDetected) {
        console.log('얼굴 감지 중단됨');
      }

      setFaceDetected(false);
      setFaceWithinBounds(false);
      setBorderColor('#ff3d00'); // 얼굴 미감지 (빨간색)

      // 얼굴이 감지되지 않음 메시지
      canvasCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      canvasCtx.fillRect(
        canvasElement.width / 2 - 150,
        canvasElement.height / 2 - 20,
        300,
        40
      );
      canvasCtx.fillStyle = 'red';
      canvasCtx.font = '18px "Noto Sans KR", sans-serif';
      canvasCtx.textAlign = 'center';
      canvasCtx.fillText(
        '얼굴이 감지되지 않았습니다',
        canvasElement.width / 2,
        canvasElement.height / 2 + 7
      );
    }

    // 가이드라인 그리기 (얼굴 원 위치 표시)
    canvasCtx.strokeStyle = faceWithinBounds
      ? 'rgba(0, 200, 83, 0.5)'
      : 'rgba(255, 171, 0, 0.5)';
    canvasCtx.lineWidth = 2;
    canvasCtx.setLineDash([5, 5]);
    canvasCtx.beginPath();
    canvasCtx.arc(
      canvasElement.width / 2,
      canvasElement.height / 2,
      canvasElement.width * 0.25, // 얼굴 크기 기준
      0,
      2 * Math.PI
    );
    canvasCtx.stroke();

    canvasCtx.restore();
  };

  // 디버그 캔버스 업데이트 (3D 회전 시각화)
  const updateDebugCanvas = (rotationValues: RotationState): void => {
    if (!debugCanvasRef.current) return;

    const canvas = debugCanvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // 캔버스 초기화
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 배경
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 제목
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Face Rotation Debug', canvas.width / 2, 15);

    // 각도 값 표시 (roll, pitch, yaw) - 정수로 표시
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';

    // Roll (Z축 회전)
    ctx.fillStyle = '#FF8080';
    ctx.fillText(`Roll: ${rotationValues.roll}°`, 10, 35);
    const rollStatus = Math.abs(rotationValues.roll) < 15 ? 'OK' : 'NG';
    ctx.fillText(rollStatus, canvas.width - 30, 35);

    // Pitch (X축 회전)
    ctx.fillStyle = '#80FF80';
    ctx.fillText(`Pitch: ${rotationValues.pitch}°`, 10, 55);
    const pitchStatus = Math.abs(rotationValues.pitch) < 15 ? 'OK' : 'NG';
    ctx.fillText(pitchStatus, canvas.width - 30, 55);

    // Yaw (Y축 회전)
    ctx.fillStyle = '#8080FF';
    ctx.fillText(`Yaw: ${rotationValues.yaw}°`, 10, 75);
    const yawStatus = Math.abs(rotationValues.yaw) < 15 ? 'OK' : 'NG';
    ctx.fillText(yawStatus, canvas.width - 30, 75);

    // 3D 얼굴 시각화
    const centerX = canvas.width / 2;
    const centerY = 135;
    const radius = 35;

    // 얼굴 타원 그리기
    ctx.save();
    ctx.translate(centerX, centerY);

    // Roll 회전 (z축 회전)
    ctx.rotate((rotationValues.roll * Math.PI) / 180);

    // Yaw에 따른 타원 스케일링
    const yawFactor = Math.cos((rotationValues.yaw * Math.PI) / 180);
    // Pitch에 따른 타원 스케일링
    const pitchFactor = Math.cos((rotationValues.pitch * Math.PI) / 180);

    // 얼굴 윤곽 그리기
    ctx.beginPath();
    ctx.ellipse(
      0,
      0,
      radius * yawFactor,
      radius * pitchFactor,
      0,
      0,
      2 * Math.PI
    );
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 코 그리기 (방향 표시)
    const noseLength = 15;
    ctx.beginPath();
    ctx.moveTo(0, -5);
    const noseEndX =
      noseLength * Math.sin((rotationValues.yaw * Math.PI) / 180);
    const noseEndY =
      noseLength * Math.sin((rotationValues.pitch * Math.PI) / 180);
    ctx.lineTo(noseEndX, noseEndY);
    ctx.strokeStyle = '#FFFF00';
    ctx.lineWidth = 3;
    ctx.stroke();

    // 눈 그리기
    const eyeOffsetX = 15 * yawFactor;
    const eyeOffsetY = -10 * pitchFactor;
    const eyeWidth = 8 * yawFactor;
    const eyeHeight = 5 * pitchFactor;

    // 왼쪽 눈
    ctx.beginPath();
    ctx.ellipse(
      -eyeOffsetX,
      eyeOffsetY,
      eyeWidth,
      eyeHeight,
      0,
      0,
      2 * Math.PI
    );
    ctx.fillStyle = '#80FFFF';
    ctx.fill();

    // 오른쪽 눈
    ctx.beginPath();
    ctx.ellipse(eyeOffsetX, eyeOffsetY, eyeWidth, eyeHeight, 0, 0, 2 * Math.PI);
    ctx.fillStyle = '#80FFFF';
    ctx.fill();

    // 입 그리기
    const mouthWidth = 20 * yawFactor;
    const mouthHeight = 5 * pitchFactor;
    ctx.beginPath();
    ctx.ellipse(0, 15 * pitchFactor, mouthWidth, mouthHeight, 0, 0, Math.PI);
    ctx.strokeStyle = '#FF8080';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  };

  // 카메라 시작
  const startCamera = async (): Promise<void> => {
    if (!modelsLoaded || !faceMeshRef.current || !videoRef.current) {
      console.warn('모델이나 비디오 엘리먼트가 준비되지 않았습니다');
      return;
    }

    try {
      // 이전 상태 초기화
      setError(null);
      setVerificationResult(null);
      setLivenessResult(null);

      // 캔버스 크기 설정
      if (canvasRef.current) {
        canvasRef.current.width = 640;
        canvasRef.current.height = 480;
      }

      // 디버그 캔버스 크기 설정
      if (debugCanvasRef.current) {
        debugCanvasRef.current.width = 300;
        debugCanvasRef.current.height = 180;
      }

      // MediaPipe 카메라 설정
      cameraRef.current = new cam.Camera(videoRef.current, {
        onFrame: async () => {
          if (faceMeshRef.current && videoRef.current) {
            try {
              await faceMeshRef.current.send({ image: videoRef.current });
            } catch (error) {
              console.error('MediaPipe 전송 실패:', error);
              
              // WASM 관련 오류인 경우 새로고침 유도
              if (String(error).includes('abort') || String(error).includes('wasm')) {
                setError('MediaPipe 오류가 발생했습니다. 페이지를 새로고침하세요.');
                stopCamera();
              }
            }
          }
        },
        width: 640,
        height: 480,
        facingMode: 'user',
      });

      // 카메라 시작
      await cameraRef.current.start();
      setIsCameraActive(true);
      console.log('카메라 초기화 완료');
      
      // RealSense가 연결되어 있지 않으면 연결 시도
      if (!realsenseConnected && !realsenseWsRef.current) {
        connectToRealSense();
      }
    } catch (error) {
      console.error('카메라 접근 오류:', error);
      setError(
        `카메라 접근 오류: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  };

  // 카메라 중지
  const stopCamera = (): void => {
    if (cameraRef.current) {
      cameraRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    setIsCameraActive(false);
    setRealTimeVerification(false);
    setBorderColor('#333');
    setVerificationResult(null);
  };

  // RealSense 카메라와 노트북 카메라 전환 함수
  const toggleCameraSource = () => {
    setUseRealsenseCamera(!useRealsenseCamera);
    setVerificationResult(null);
    setError(null);
    
    // 실시간 검증 중지
    if (realTimeVerification) {
      stopRealTimeVerification();
    }
    
    // RealSense 카메라로 전환할 때
    if (!useRealsenseCamera) {
      if (!realsenseConnected) {
        connectToRealSense();
      }
    }
  };

  // 얼굴 인증 실행
  const verifySingleFace = async (): Promise<void> => {
    // RealSense 카메라 사용 시
    if (useRealsenseCamera) {
      if (!realsenseRgbFrame) {
        setError('RealSense 카메라로부터 이미지를 가져올 수 없습니다.');
        return;
      }
      
      try {
        setIsProcessing(true);
        setError(null);
        
        // RealSense RGB 이미지 사용
        const imageData = realsenseRgbFrame;
        
        if (wsRef.current && wsConnected) {
          wsRef.current.sendVerifyRequest(imageData);
        } else {
          throw new Error('WebSocket이 연결되지 않았습니다.');
        }
        
      } catch (error) {
        console.error('얼굴 인증 오류:', error);
        setError(`얼굴 인증 오류: ${error instanceof Error ? error.message : String(error)}`);
        setIsProcessing(false);
      }
    } else {
      // 노트북 웹캠 사용 시
      if (!lastFrameRef.current) {
        setError('얼굴 이미지가 캡처되지 않았습니다.');
        return;
      }
  
      if (!faceDetected) {
        setError('얼굴이 감지되지 않았습니다. 카메라에 얼굴을 위치시키세요.');
        return;
      }
      
      // 라이브니스 검사 결과가 있고, 가짜 얼굴로 판정된 경우
      if (livenessResult && !livenessResult.is_live) {
        setError('라이브니스 검사 실패: 실제 사람 얼굴이 아닙니다.');
        return;
      }
  
      try {
        setIsProcessing(true);
        setError(null);
  
        // 매우 작은 크기로 비디오 프레임 캡처
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
  
        if (!ctx || !videoRef.current) {
          throw new Error(
            '캔버스 컨텍스트 또는 비디오 요소를 가져올 수 없습니다.'
          );
        }
  
        // 매우 작은 크기로 설정 (많이 축소)
        canvas.width = 160; // 최소 크기로 설정
        canvas.height = 120;
  
        // 비디오에서 직접 이미지 그리기
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
  
        // 매우 낮은 품질로 이미지 압축
        const imageData = canvas.toDataURL('image/jpeg', 0.5); // 품질 50%로 낮춤
  
        console.log('이미지 데이터 크기:', Math.round(imageData.length / 1024), 'KB');
  
        if (wsRef.current && wsConnected) {
          wsRef.current.sendVerifyRequest(imageData);
        } else {
          throw new Error('WebSocket이 연결되지 않았습니다.');
        }
      } catch (error) {
        console.error('얼굴 인증 오류:', error);
        setError(
          `얼굴 인증 오류: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
        setIsProcessing(false);
      }
    }
  };
  
  // 실시간 인식 실행
  const performRealTimeRecognition = async (): Promise<void> => {
    if (!faceDetected || !faceWithinBounds || isProcessing) {
      return;
    }
    
    // 라이브니스 검사 결과가 있고, 가짜 얼굴로 판정된 경우
    if (livenessResult && !livenessResult.is_live) {
      if (!error) {
        setError('라이브니스 검사 실패: 실제 사람 얼굴이 아닙니다.');
      }
      return;
    }
    
    try {
      setIsProcessing(true);
      setError(null);
      
      // 시간 기록
      lastRecognitionTimeRef.current = Date.now();
      
      if (useRealsenseCamera) {
        // RealSense 카메라 사용 시
        if (!realsenseRgbFrame) {
          throw new Error('RealSense 프레임을 가져올 수 없습니다.');
        }
        
        if (wsRef.current && wsConnected) {
          wsRef.current.sendVerifyRequest(realsenseRgbFrame);
        } else {
          throw new Error('WebSocket이 연결되지 않았습니다.');
        }
      } else {
        // 노트북 웹캠 사용 시
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
  
        if (!ctx || !videoRef.current) {
          throw new Error('캔버스 컨텍스트 또는 비디오 요소를 가져올 수 없습니다.');
        }
  
        // 매우 작은 크기로 설정 (많이 축소)
        canvas.width = 160; // 최소 크기로 설정
        canvas.height = 120;
  
        // 비디오에서 직접 이미지 그리기
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
  
        // 매우 낮은 품질로 이미지 압축
        const imageData = canvas.toDataURL('image/jpeg', 0.5); // 품질 50%로 낮춤
  
        if (wsRef.current && wsConnected) {
          wsRef.current.sendVerifyRequest(imageData);
        } else {
          throw new Error('WebSocket이 연결되지 않았습니다.');
        }
      }
    } catch (error) {
      console.error('실시간 얼굴 인증 오류:', error);
      setError(
        `얼굴 인증 오류: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      setIsProcessing(false);
    }
  };
  
  // 실시간 인식 시작
  const startRealTimeVerification = (): void => {
    if (verificationIntervalRef.current) {
      clearInterval(verificationIntervalRef.current);
    }
    
    // 초기 인식 즉시 시도
    if ((faceDetected && faceWithinBounds && !isProcessing) || 
        (useRealsenseCamera && realsenseRgbFrame)) {
      performRealTimeRecognition();
    }
    
    // 인식 시도 인터벌 시작
    verificationIntervalRef.current = setInterval(() => {
      if (useRealsenseCamera) {
        // RealSense 카메라 사용 시 이미지가 있으면 인식 시도
        if (realsenseRgbFrame && !isProcessing) {
          const currentTime = Date.now();
          // 마지막 인식 시도 후 3초 이상 지났을 때만 시도
          if (currentTime - lastRecognitionTimeRef.current > 3000) {
            performRealTimeRecognition();
          }
        }
      } else {
        // 노트북 웹캠 사용 시
        // 얼굴이 감지되고 위치가 정확할 때 자동으로 인식 시도
        if (faceDetected && faceWithinBounds && !isProcessing) {
          const currentTime = Date.now();
          // 마지막 인식 시도 후 3초 이상 지났을 때만 시도
          if (currentTime - lastRecognitionTimeRef.current > 3000) {
            performRealTimeRecognition();
          }
        }
      }
    }, 1000); // 1초마다 체크
  };
  
  // 실시간 인식 중지
  const stopRealTimeVerification = (): void => {
    if (verificationIntervalRef.current) {
      clearInterval(verificationIntervalRef.current);
      verificationIntervalRef.current = null;
    }
  };
  
  // 모드 전환 핸들러
  const toggleRealTimeMode = (): void => {
    if (!realTimeVerification) {
      setRealTimeVerification(true);
      setError(null);
    } else {
      setRealTimeVerification(false);
    }
  };

  // 라이브니스 결과 표시 컴포넌트
  const LivenessResultDisplay = ({ liveness }: { liveness: any }) => {
    if (!liveness) return null;
    
    const isLive = liveness.is_live;
    const statusColor = isLive ? '#00c853' : '#f44336';
    
    return (
      <div style={{
        margin: '10px 0',
        padding: '10px 20px',
        backgroundColor: isLive ? 'rgba(0, 200, 83, 0.1)' : 'rgba(244, 67, 54, 0.1)',
        color: statusColor,
        borderRadius: '5px',
        width: '100%',
        textAlign: 'center',
      }}>
        <h4 style={{ margin: '0 0 10px 0' }}>라이브니스 검사</h4>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span>결과:</span>
          <span style={{ fontWeight: 'bold' }}>{isLive ? '통과' : '실패'}</span>
        </div>
        {liveness.depth_variation !== undefined && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span>깊이 변화:</span>
            <span>{liveness.depth_variation}mm</span>
          </div>
        )}
        {liveness.reason && (
          <div style={{ fontSize: '14px', marginTop: '5px' }}>
            {liveness.reason}
          </div>
        )}
      </div>
    );
  };

  return (
    <Container>
      <BackButton onClick={() => window.history.back()}>&lt;</BackButton>

      <Message>얼굴 인식으로 로그인</Message>
      <SubMessage>
        {loadingError
          ? '오류가 발생했습니다'
          : !modelsLoaded
          ? '모델 로딩 중...'
          : !wsConnected
          ? 'WebSocket 연결 중...'
          : useRealsenseCamera
          ? '얼굴을 RealSense 카메라에 위치시키고 인증 버튼을 눌러주세요.'
          : '얼굴을 카메라에 위치시키고 인증 버튼을 눌러주세요.'}
      </SubMessage>

      <ContentWrapper>
        <CameraColumn>
          <FaceCircle borderColor={borderColor}>
            <VideoContainer>
              {/* 조건부 렌더링: RealSense 또는 웹캠 */}
              {useRealsenseCamera ? (
                // RealSense 카메라 영상 표시
                realsenseRgbFrame ? (
                  <img 
                    src={realsenseRgbFrame} 
                    alt="RealSense Camera"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    ref={realsenseVideoRef}
                  />
                ) : (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    textAlign: 'center',
                    color: '#ccc'
                  }}>
                    RealSense 카메라 연결 중...
                  </div>
                )
              ) : (
                // 웹캠 영상 표시
                <>
                  <Video ref={videoRef} autoPlay playsInline muted />
                  <Canvas ref={canvasRef} width={640} height={480} />
                </>
              )}
              <GuideLine />
            </VideoContainer>
          </FaceCircle>

          {/* 카메라 소스 전환 버튼 추가 */}
          <div style={{ marginTop: '10px', marginBottom: '10px' }}>
            <Button
              onClick={toggleCameraSource}
              disabled={!realsenseConnected && !useRealsenseCamera}
              style={{ 
                backgroundColor: '#9c27b0', 
                width: '100%',
                maxWidth: '400px',
                opacity: (!realsenseConnected && !useRealsenseCamera) ? 0.5 : 1
              }}
            >
              {useRealsenseCamera ? '노트북 카메라로 전환' : 'RealSense 카메라로 전환'}
            </Button>
          </div>

          {/* 카메라 제어 버튼 */}
          <div
            style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'center',
              width: '100%',
              maxWidth: '400px',
              flexDirection: 'column',
            }}
          >
            {!isCameraActive && !useRealsenseCamera ? (
              <Button
                onClick={startCamera}
                disabled={!modelsLoaded || !!loadingError}
                style={{ width: '100%' }}
              >
                {loadingError
                  ? '다시 시도하기'
                  : modelsLoaded
                  ? '카메라 켜기'
                  : '모델 로딩 중...'}
              </Button>
            ) : (
              <>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <Button
                    onClick={verifySingleFace}
                    disabled={isProcessing || 
                      (!faceDetected && !useRealsenseCamera) || 
                      !wsConnected ||
                      (useRealsenseCamera && !realsenseRgbFrame)}
                    style={{ flex: 1 }}
                  >
                    {isProcessing ? '인증 중...' : '얼굴로 로그인'}
                  </Button>
                  <Button
                    onClick={toggleRealTimeMode}
                    disabled={
                      (!faceDetected && !useRealsenseCamera) || 
                      !wsConnected ||
                      (useRealsenseCamera && !realsenseRgbFrame)}
                    style={{ 
                      flex: 1, 
                      backgroundColor: realTimeVerification ? '#ff5722' : '#2196f3'
                    }}
                  >
                    {realTimeVerification ? '실시간 인식 중지' : '실시간 인식 시작'}
                  </Button>
                </div>
                
                {!useRealsenseCamera && (
                  <Button
                    onClick={stopCamera}
                    style={{ backgroundColor: '#555', width: '100%' }}
                  >
                    카메라 끄기
                  </Button>
                )}
              </>
            )}
          </div>

          {/* WebSocket 및 RealSense 연결 상태 표시 */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px', width: '100%', maxWidth: '400px' }}>
            <div
              style={{
                flex: 1,
                padding: '5px 10px',
                borderRadius: '5px',
                fontSize: '14px',
                textAlign: 'center',
                backgroundColor: wsConnected ? 'rgba(0, 200, 83, 0.1)' : 'rgba(255, 152, 0, 0.1)',
                color: wsConnected ? '#00c853' : '#ff9800',
              }}
            >
              WebSocket: {wsConnected ? '연결됨' : '연결 중...'}
            </div>
            
            <div
              style={{
                flex: 1,
                padding: '5px 10px',
                borderRadius: '5px',
                fontSize: '14px',
                textAlign: 'center',
                backgroundColor: realsenseConnected ? 'rgba(33, 150, 243, 0.1)' : 'rgba(255, 152, 0, 0.1)',
                color: realsenseConnected ? '#2196f3' : '#ff9800',
              }}
            >
              RealSense: {realsenseConnected ? '연결됨' : '연결 안됨'}
            </div>
          </div>

          {error && (
            <div
              style={{
                margin: '10px 0',
                padding: '10px 20px',
                backgroundColor: 'rgba(255, 0, 0, 0.1)',
                color: '#f44336',
                borderRadius: '5px',
                width: '100%',
                maxWidth: '400px',
                textAlign: 'center',
              }}
            >
              {error}
            </div>
          )}

          {livenessResult && (
            <LivenessResultDisplay liveness={livenessResult} />
          )}

          {/* 깊이 데이터 시각화 */}
          {depthFrame && realsenseConnected && (
            <div
              style={{
                margin: '10px 0',
                position: 'relative',
                width: '100%',
                maxWidth: '400px',
                borderRadius: '5px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '10px',
                  left: '10px',
                  background: 'rgba(0, 0, 0, 0.7)',
                  color: 'white',
                  padding: '5px 10px',
                  borderRadius: '3px',
                  fontSize: '14px',
                }}
              >
                깊이 맵
              </div>
              <img
                src={depthFrame}
                alt="Depth Map"
                style={{
                  width: '100%',
                  borderRadius: '5px',
                }}
              />
            </div>
          )}

          {verificationResult && (
            <div
              style={{
                margin: '20px 0',
                padding: '20px',
                backgroundColor: verificationResult.matched
                  ? 'rgba(0, 200, 83, 0.1)'
                  : 'rgba(255, 152, 0, 0.1)',
                color: verificationResult.matched ? '#00c853' : '#ff9800',
                borderRadius: '5px',
                width: '100%',
                maxWidth: '400px',
                textAlign: 'center',
              }}
            >
              <h3 style={{ margin: '0 0 10px 0' }}>
                {verificationResult.matched ? '인증 성공!' : '인증 실패'}
              </h3>
              {verificationResult.matched ? (
                <>
                  <p>
                    <strong>사용자 ID:</strong> {verificationResult.user_id}
                  </p>
                  <p>
                    <strong>신뢰도:</strong>{' '}
                    {(verificationResult.confidence * 100).toFixed(2)}%
                  </p>
                  <p>
                    <strong>처리 시간:</strong>{' '}
                    {verificationResult.processing_time?.toFixed(3)}초
                  </p>
                  
                  {/* 라이브니스 결과 표시 */}
                  {verificationResult.liveness_result && (
                    <LivenessResultDisplay liveness={verificationResult.liveness_result} />
                  )}
                </>
              ) : (
                <>
                  <p>등록된 얼굴을 찾을 수 없습니다.</p>
                  
                  {/* 라이브니스 결과 표시 */}
                  {verificationResult.liveness_result && (
                    <LivenessResultDisplay liveness={verificationResult.liveness_result} />
                  )}
                </>
              )}
            </div>
          )}
          
          {/* 실시간 모드 안내 */}
          {realTimeVerification && (
            <div
              style={{
                margin: '10px 0',
                padding: '10px 20px',
                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                color: '#2196f3',
                borderRadius: '5px',
                width: '100%',
                maxWidth: '400px',
                textAlign: 'center',
                fontSize: '14px',
              }}
            >
              실시간 인식 모드 활성화됨: 얼굴이 감지되면 자동으로 인증이 시도됩니다.
            </div>
          )}
        </CameraColumn>

        <InfoColumn>
          {/* 디버그 패널 */}
          <div
            style={{
              width: '100%',
              background: 'rgba(0, 0, 0, 0.7)',
              border: '1px solid #555',
              borderRadius: '8px',
              padding: '15px',
              color: 'white',
            }}
          >
            <h3 style={{ margin: '0 0 15px 0' }}>얼굴 회전 디버깅</h3>
            <div style={{ marginBottom: '15px' }}>
              <canvas
                ref={debugCanvasRef}
                width={300}
                height={180}
                style={{
                  width: '100%',
                  height: '180px',
                  background: 'rgba(0, 0, 0, 0.7)',
                  border: '1px solid #555',
                  borderRadius: '8px',
                }}
              />
            </div>

            <div
              style={{
                borderBottom: '1px solid #555',
                paddingBottom: '5px',
                marginBottom: '10px',
              }}
            >
              <strong>현재 정보</strong>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '8px',
              }}
            >
              <span>얼굴 감지:</span>
              <span>{faceDetected ? '✓' : '✗'}</span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '8px',
              }}
            >
              <span>위치 정확:</span>
              <span>{faceWithinBounds ? '✓' : '✗'}</span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '8px',
              }}
            >
              <span>RealSense 연결:</span>
              <span>{realsenseConnected ? '✓' : '✗'}</span>
            </div>

            <div
              style={{
                borderBottom: '1px solid #555',
                paddingBottom: '5px',
                margin: '10px 0',
              }}
            >
              <strong>회전 값</strong>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '8px',
              }}
            >
              <span>Roll (Z축):</span>
              <span>{rotation.roll}°</span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '8px',
              }}
            >
              <span>Pitch (X축):</span>
              <span>{rotation.pitch}°</span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '8px',
              }}
            >
              <span>Yaw (Y축):</span>
              <span>{rotation.yaw}°</span>
            </div>
          </div>

          {/* 깊이 정보 디버그 패널 (새로 추가) */}
          {realsenseConnected && depthStats && (
            <div
              style={{
                width: '100%',
                background: 'rgba(0, 0, 0, 0.7)',
                border: '1px solid #555',
                borderRadius: '8px',
                padding: '15px',
                marginTop: '20px',
                color: 'white',
              }}
            >
              <h3 style={{ margin: '0 0 15px 0' }}>RealSense 깊이 정보</h3>
              
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                }}
              >
                <span>최소 깊이:</span>
                <span>{depthStats.min?.toFixed(1) || 'N/A'}mm</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                }}
              >
                <span>최대 깊이:</span>
                <span>{depthStats.max?.toFixed(1) || 'N/A'}mm</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                }}
              >
                <span>평균 깊이:</span>
                <span>{depthStats.mean?.toFixed(1) || 'N/A'}mm</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                }}
              >
                <span>중앙값:</span>
                <span>{depthStats.median?.toFixed(1) || 'N/A'}mm</span>
              </div>
              <div
                style={{
                  borderTop: '1px solid #555',
                  paddingTop: '8px',
                  marginTop: '8px',
                  fontSize: '13px',
                  color: '#aaa',
                }}
              >
                <div>* 라이브니스 검사 기준: 얼굴 영역의 깊이 변화가 15mm 이상</div>
              </div>
            </div>
          )}

          {/* 색상 가이드 */}
          <div
            style={{
              width: '100%',
              background: 'rgba(0, 0, 0, 0.7)',
              border: '1px solid #555',
              borderRadius: '8px',
              padding: '15px',
              marginTop: '20px',
            }}
          >
            <h3 style={{ margin: '0 0 15px 0' }}>경계선 색상 의미</h3>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '10px',
              }}
            >
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: '#ff3d00',
                  marginRight: '10px',
                }}
              />
              <div>
                <strong>빨간색</strong>: 얼굴 미감지 또는 가짜 얼굴
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '10px',
              }}
            >
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: '#FFC107',
                  marginRight: '10px',
                }}
              />
              <div>
                <strong>노란색</strong>: 얼굴이 원 밖에 위치함
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '10px',
              }}
            >
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: '#00c853',
                  marginRight: '10px',
                }}
              />
              <div>
                <strong>초록색</strong>: 인식 준비 완료
              </div>
            </div>
          </div>

          {/* 서버 상태 정보 */}
          <div
            style={{
              width: '100%',
              background: 'rgba(0, 0, 0, 0.7)',
              border: '1px solid #555',
              borderRadius: '8px',
              padding: '15px',
              marginTop: '20px',
            }}
          >
            <h3 style={{ margin: '0 0 15px 0' }}>서버 상태</h3>

            {serverStatus ? (
              <>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                  }}
                >
                  <span>상태:</span>
                  <span style={{ color: '#00c853' }}>
                    {serverStatus.status === 'healthy' ? '정상' : '오류'}
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                  }}
                >
                  <span>초기화 완료:</span>
                  <span>{serverStatus.initialized ? '✓' : '✗'}</span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                  }}
                >
                  <span>GPU 사용 가능:</span>
                  <span>{serverStatus.gpu_available ? '✓' : '✗'}</span>
                </div>

                {serverStatus.gpu_available && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '8px',
                    }}
                  >
                    <span>GPU 모델:</span>
                    <span>{serverStatus.gpu_name}</span>
                  </div>
                )}

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                  }}
                >
                  <span>RealSense 상태:</span>
                  <span>{serverStatus.realsense_available ? '✓' : '✗'}</span>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', color: '#f44336' }}>
                서버 상태 정보를 불러올 수 없습니다.
              </div>
            )}
          </div>

          {/* 로그인 안내 */}
          <div
            style={{
              width: '100%',
              background: 'rgba(0, 0, 0, 0.7)',
              border: '1px solid #555',
              borderRadius: '8px',
              padding: '15px',
              marginTop: '20px',
            }}
          >
            <h3 style={{ margin: '0 0 15px 0' }}>얼굴 인식 로그인 안내</h3>

            <p
              style={{
                fontSize: '14px',
                lineHeight: '1.5',
                margin: '0 0 10px 0',
              }}
            >
              1. <strong>단일 인증</strong>: 버튼을 클릭하여 한 번만 인증합니다.
            </p>
            <p
              style={{
                fontSize: '14px',
                lineHeight: '1.5',
                margin: '0 0 10px 0',
              }}
            >
              2. <strong>실시간 인증</strong>: 실시간으로 얼굴을 인식하고 자동 인증합니다.
            </p>
            <p
              style={{
                fontSize: '14px',
                lineHeight: '1.5',
                margin: '0 0 10px 0',
              }}
            >
              3. <strong>카메라 변경</strong>: RealSense와 노트북 카메라를 전환할 수 있습니다.
            </p>
            <p
              style={{
                fontSize: '14px',
                lineHeight: '1.5',
                margin: '0 0 10px 0',
              }}
            >
              4. 인증 성공시 사용자 ID와 신뢰도가 표시됩니다.
            </p>
            <p
              style={{
                fontSize: '14px',
                lineHeight: '1.5',
                margin: '0 0 10px 0',
              }}
            >
              5. 얼굴 등록이 되어 있지 않다면 먼저 얼굴 등록을 진행해주세요.
            </p>

            <div style={{ marginTop: '15px', textAlign: 'center' }}>
              <a
                href='/register'
                style={{
                  padding: '8px 15px',
                  backgroundColor: '#4285F4',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '5px',
                  fontSize: '14px',
                }}
              >
                얼굴 등록하러 가기
              </a>
            </div>
          </div>
        </InfoColumn>
      </ContentWrapper>
    </Container>
  );
};

export default FaceLogin;