// FaceLogin.tsx
import React, { useState, useEffect, useRef } from 'react';
import * as mp from '@mediapipe/face_mesh';

// API 기능 가져오기
import { FaceVerificationWebSocket, checkServerHealth } from './api';

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
  Canvas,
  GuideLine,
} from './styles';

// 타입 가져오기
import { RotationState } from './types';
import { calculateFaceRotation, checkFaceInCircle } from './utils';

const FaceLogin: React.FC = () => {
  // 기존 상태들
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [modelsLoaded, setModelsLoaded] = useState<boolean>(false);
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
  const [realTimeVerification, setRealTimeVerification] =
    useState<boolean>(false);

  // RealSense 관련 상태
  const [realsenseConnected, setRealsenseConnected] = useState<boolean>(false);
  const [currentFrame, setCurrentFrame] = useState<string | null>(null);

  // 참조 객체들
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const debugCanvasRef = useRef<HTMLCanvasElement>(null);
  const faceMeshRef = useRef<mp.FaceMesh | null>(null);

  // 웹소켓 참조
  const wsRef = useRef<FaceVerificationWebSocket | null>(null);
  const realsenseWsRef = useRef<WebSocket | null>(null);
  const verificationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // MediaPipe FaceMesh 모델 로드
  useEffect(() => {
    const loadMediaPipeModels = async (): Promise<void> => {
      try {
        // MediaPipe FaceMesh 초기화
        const faceMesh = new mp.FaceMesh({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
          },
        });

        // 설정
        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

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
      } catch (error) {
        console.error('서버 상태 확인 오류:', error);
        setError(
          '백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인하세요.'
        );
      }
    };

    const connectToRealSense = () => {
      console.log('=== RealSense 연결 시작 ===');

      const WS_BASE_URL =
        window.location.hostname === 'localhost'
          ? 'ws://localhost:8000'
          : 'wss://face.poloceleste.site';

      console.log('RealSense 연결 URL:', `${WS_BASE_URL}/ws/realsense`);

      const ws = new WebSocket(`${WS_BASE_URL}/ws/realsense`);

      ws.onopen = () => {
        console.log('✅ RealSense 웹소켓 연결 성공!');
        setRealsenseConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          console.log('📨 RealSense 메시지 수신:', typeof event.data);
          const data = JSON.parse(event.data);
          console.log('메시지 타입:', data.type);

          if (data.type === 'frame') {
            console.log(
              '📸 프레임 수신! RGB 이미지 길이:',
              data.rgb_image?.length
            );
            setCurrentFrame(data.rgb_image);
            console.log('currentFrame 상태 업데이트 완료');
          }
        } catch (error) {
          console.error('❌ RealSense 메시지 파싱 오류:', error);
          console.log('원본 메시지:', event.data);
        }
      };

      ws.onclose = () => {
        console.log('❌ RealSense 웹소켓 연결 종료');
        setRealsenseConnected(false);
        setTimeout(() => {
          console.log('5초 후 재연결 시도...');
          connectToRealSense();
        }, 5000);
      };

      ws.onerror = (error) => {
        console.error('❌ RealSense 웹소켓 오류:', error);
        console.log('WebSocket 상태:', ws.readyState);
      };

      realsenseWsRef.current = ws;
    };

    loadMediaPipeModels();
    checkServerStatus();

    return () => {
      if (faceMeshRef.current) {
        faceMeshRef.current.close();
      }
    };
  }, []);

  // RealSense 웹소켓 연결
  const connectToRealSense = () => {
    const WS_BASE_URL =
      window.location.hostname === 'localhost'
        ? 'ws://localhost:8000'
        : 'wss://face.poloceleste.site';

    const ws = new WebSocket(`${WS_BASE_URL}/ws/realsense`);

    ws.onopen = () => {
      console.log('RealSense 웹소켓 연결 성공');
      setRealsenseConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'frame') {
          // 받은 프레임을 화면에 표시
          setCurrentFrame(data.rgb_image);

          // 실시간 인증이 활성화되어 있으면 인증 요청
          if (realTimeVerification && faceDetected && wsRef.current) {
            wsRef.current.sendVerifyRequest(data.rgb_image);
          }
        }
      } catch (error) {
        console.error('RealSense 메시지 파싱 오류:', error);
      }
    };

    ws.onclose = () => {
      console.log('RealSense 웹소켓 연결 종료');
      setRealsenseConnected(false);
      // 재연결 시도
      setTimeout(connectToRealSense, 1000);
    };

    ws.onerror = (error) => {
      console.error('RealSense 웹소켓 오류:', error);
    };

    realsenseWsRef.current = ws;
  };

  // 인증 웹소켓 초기화
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
            liveness_result: data.liveness_result,
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
            liveness_result: data.liveness_result,
          });
          break;

        case 'error':
          setError(data.message);
          setIsProcessing(false);
          if (data.liveness_result) {
            setVerificationResult({
              matched: false,
              liveness_result: data.liveness_result,
            });
          }
          break;

        case 'pong':
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
    };

    wsRef.current = new FaceVerificationWebSocket(
      onMessage,
      onError,
      onClose,
      onOpen
    );
    wsRef.current.connect();
  };

  // 컴포넌트 마운트 시 연결들 초기화
  useEffect(() => {
    connectToRealSense();
    initializeWebSocket();

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

    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect();
      }
      if (realsenseWsRef.current) {
        realsenseWsRef.current.close();
      }
      if (verificationIntervalRef.current) {
        clearInterval(verificationIntervalRef.current);
      }
    };
  }, []);

  // RealSense 프레임으로 얼굴 분석
  useEffect(() => {
    console.log('=== RealSense 프레임 처리 시도 ===');
    console.log('currentFrame 존재:', !!currentFrame);
    console.log('faceMesh 존재:', !!faceMeshRef.current);

    if (!currentFrame || !faceMeshRef.current) {
      console.log('프레임 또는 faceMesh 없음 - 처리 건너뜀');
      return;
    }

    const mesh = faceMeshRef.current;

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = async () => {
      console.log('✅ 이미지 로드 성공:', {
        width: img.width,
        height: img.height,
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.drawImage(img, 0, 0);
        console.log('MediaPipe로 이미지 전송 중...');
        try {
          await mesh.send({ image: canvas });
          console.log('✅ MediaPipe 전송 성공');
        } catch (error) {
          console.error('❌ MediaPipe 전송 실패:', error);
        }
      }
    };

    img.onerror = (error) => {
      console.error('❌ 이미지 로드 실패:', error);
    };

    console.log('이미지 로드 시작...');
    img.src = currentFrame;
  }, [currentFrame]);

  // MediaPipe 결과 처리 함수
  const onResults = (results: mp.Results): void => {
    console.log('=== MediaPipe 결과 수신 ===');
    console.log('얼굴 랜드마크 개수:', results.multiFaceLandmarks?.length || 0);

    if (!canvasRef.current) return;

    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext('2d');

    if (!canvasCtx) return;

    // 캔버스 지우기
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    // 얼굴이 감지되었는지 확인
    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      const landmarks = results.multiFaceLandmarks[0];

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

      // 3D 방향 계산
      const rotationValues = calculateFaceRotation(landmarks);
      setRotation(rotationValues);

      // 디버그 캔버스 업데이트
      updateDebugCanvas(rotationValues);

      // 경계선 색상 설정
      if (isFaceInCircle) {
        setBorderColor('#00c853'); // 올바른 위치 (초록색)
      } else {
        setBorderColor('#FFC107'); // 얼굴이 원 밖에 있음 (노란색)
      }
    } else {
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

    // 가이드라인 그리기
    canvasCtx.strokeStyle = faceWithinBounds
      ? 'rgba(0, 200, 83, 0.5)'
      : 'rgba(255, 171, 0, 0.5)';
    canvasCtx.lineWidth = 2;
    canvasCtx.setLineDash([5, 5]);
    canvasCtx.beginPath();
    canvasCtx.arc(
      canvasElement.width / 2,
      canvasElement.height / 2,
      canvasElement.width * 0.25,
      0,
      2 * Math.PI
    );
    canvasCtx.stroke();

    canvasCtx.restore();
  };

  // 디버그 캔버스 업데이트
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

    // 각도 값 표시
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';

    // Roll
    ctx.fillStyle = '#FF8080';
    ctx.fillText(`Roll: ${rotationValues.roll}°`, 10, 35);
    const rollStatus = Math.abs(rotationValues.roll) < 15 ? 'OK' : 'NG';
    ctx.fillText(rollStatus, canvas.width - 30, 35);

    // Pitch
    ctx.fillStyle = '#80FF80';
    ctx.fillText(`Pitch: ${rotationValues.pitch}°`, 10, 55);
    const pitchStatus = Math.abs(rotationValues.pitch) < 15 ? 'OK' : 'NG';
    ctx.fillText(pitchStatus, canvas.width - 30, 55);

    // Yaw
    ctx.fillStyle = '#8080FF';
    ctx.fillText(`Yaw: ${rotationValues.yaw}°`, 10, 75);
    const yawStatus = Math.abs(rotationValues.yaw) < 15 ? 'OK' : 'NG';
    ctx.fillText(yawStatus, canvas.width - 30, 75);

    // 3D 얼굴 시각화
    const centerX = canvas.width / 2;
    const centerY = 135;
    const radius = 35;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((rotationValues.roll * Math.PI) / 180);

    const yawFactor = Math.cos((rotationValues.yaw * Math.PI) / 180);
    const pitchFactor = Math.cos((rotationValues.pitch * Math.PI) / 180);

    // 얼굴 윤곽
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

    // 코
    ctx.beginPath();
    ctx.moveTo(0, -5);
    const noseEndX = 15 * Math.sin((rotationValues.yaw * Math.PI) / 180);
    const noseEndY = 15 * Math.sin((rotationValues.pitch * Math.PI) / 180);
    ctx.lineTo(noseEndX, noseEndY);
    ctx.strokeStyle = '#FFFF00';
    ctx.lineWidth = 3;
    ctx.stroke();

    // 눈
    const eyeOffsetX = 15 * yawFactor;
    const eyeOffsetY = -10 * pitchFactor;
    const eyeWidth = 8 * yawFactor;
    const eyeHeight = 5 * pitchFactor;

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

    ctx.beginPath();
    ctx.ellipse(eyeOffsetX, eyeOffsetY, eyeWidth, eyeHeight, 0, 0, 2 * Math.PI);
    ctx.fillStyle = '#80FFFF';
    ctx.fill();

    // 입
    ctx.beginPath();
    ctx.ellipse(
      0,
      15 * pitchFactor,
      20 * yawFactor,
      5 * pitchFactor,
      0,
      0,
      Math.PI
    );
    ctx.strokeStyle = '#FF8080';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  };

  // 실시간 인증 시작
  const startRealTimeVerification = () => {
    if (!wsConnected || !realsenseConnected) {
      setError('인증 시스템이 준비되지 않았습니다.');
      return;
    }

    setRealTimeVerification(true);
    setVerificationResult(null);
    setError(null);
    setIsProcessing(true);

    // 실시간 프레임은 RealSense 웹소켓에서 받음
  };

  // 실시간 인증 중지
  const stopRealTimeVerification = () => {
    setRealTimeVerification(false);
    setIsProcessing(false);
  };

  // 단일 인증 실행
  const verifySingleFace = async (): Promise<void> => {
    if (!faceDetected) {
      setError('얼굴이 감지되지 않았습니다. 카메라에 얼굴을 위치시키세요.');
      return;
    }

    if (!currentFrame) {
      setError('현재 프레임이 없습니다.');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      // 현재 RealSense 프레임으로 인증
      if (wsRef.current && wsConnected) {
        wsRef.current.sendVerifyRequest(currentFrame);
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
          : !realsenseConnected
          ? 'RealSense 카메라 연결 중...'
          : '얼굴을 카메라에 위치시켜주세요.'}
      </SubMessage>

      <ContentWrapper>
        <CameraColumn>
          <FaceCircle borderColor={borderColor}>
            <VideoContainer>
              {/* RealSense 프레임 표시 */}
              {currentFrame && (
                <img
                  src={currentFrame}
                  alt='RealSense Feed'
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: 'scaleX(-1)',
                  }}
                />
              )}
              <Canvas ref={canvasRef} width={640} height={480} />
              <GuideLine />
            </VideoContainer>
          </FaceCircle>

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
            {realsenseConnected ? (
              <div style={{ display: 'flex', gap: '10px' }}>
                <Button
                  onClick={verifySingleFace}
                  disabled={isProcessing || !faceDetected || !wsConnected}
                  style={{ flex: 1 }}
                >
                  {isProcessing ? '인증 중...' : '단일 인증'}
                </Button>
                <Button
                  onClick={
                    realTimeVerification
                      ? stopRealTimeVerification
                      : startRealTimeVerification
                  }
                  disabled={!faceDetected || !wsConnected}
                  style={{
                    flex: 1,
                    backgroundColor: realTimeVerification
                      ? '#ff5722'
                      : '#2196f3',
                  }}
                >
                  {realTimeVerification ? '실시간 중지' : '실시간 인증'}
                </Button>
              </div>
            ) : (
              <Button disabled>RealSense 연결 중...</Button>
            )}
          </div>

          {/* 연결 상태 표시 */}
          <div
            style={{
              margin: '10px 0',
              padding: '5px 10px',
              borderRadius: '5px',
              fontSize: '14px',
              textAlign: 'center',
              backgroundColor: realsenseConnected
                ? 'rgba(0, 200, 83, 0.1)'
                : 'rgba(255, 152, 0, 0.1)',
              color: realsenseConnected ? '#00c853' : '#ff9800',
            }}
          >
            RealSense: {realsenseConnected ? '연결됨' : '연결 중...'}
          </div>

          <div
            style={{
              margin: '10px 0',
              padding: '5px 10px',
              borderRadius: '5px',
              fontSize: '14px',
              textAlign: 'center',
              backgroundColor: wsConnected
                ? 'rgba(0, 200, 83, 0.1)'
                : 'rgba(255, 152, 0, 0.1)',
              color: wsConnected ? '#00c853' : '#ff9800',
            }}
          >
            WebSocket: {wsConnected ? '연결됨' : '연결 중...'}
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
                  {verificationResult.liveness_result && (
                    <p>
                      <strong>라이브니스 검사:</strong>{' '}
                      {verificationResult.liveness_result.is_live
                        ? '통과'
                        : '실패'}
                      (깊이 변화:{' '}
                      {verificationResult.liveness_result.depth_variation}mm)
                    </p>
                  )}
                </>
              ) : (
                <>
                  <p>등록된 얼굴을 찾을 수 없습니다.</p>
                  {verificationResult.liveness_result && (
                    <p style={{ fontSize: '14px', marginTop: '10px' }}>
                      <strong>라이브니스 검사 결과:</strong>
                      <br />
                      {verificationResult.liveness_result.reason}
                      <br />
                      (깊이 변화:{' '}
                      {verificationResult.liveness_result.depth_variation}mm)
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          {realTimeVerification && (
            <div
              style={{
                margin: '10px 0',
                padding: '10px',
                borderRadius: '5px',
                fontSize: '14px',
                textAlign: 'center',
                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                color: '#2196f3',
              }}
            >
              실시간 인증 중... 얼굴을 카메라에 고정하세요.
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
                <strong>빨간색</strong>: 얼굴 미감지
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
                  <span>DB 연결:</span>
                  <span>{serverStatus.db_connected ? '✓' : '✗'}</span>
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
                  <>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '8px',
                      }}
                    >
                      <span>GPU 타입:</span>
                      <span>{serverStatus.gpu_type}</span>
                    </div>
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
                  </>
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
              2. <strong>실시간 인증</strong>: 실시간으로 얼굴을 인식하고 자동
              인증합니다.
            </p>
            <p
              style={{
                fontSize: '14px',
                lineHeight: '1.5',
                margin: '0 0 10px 0',
              }}
            >
              3. 인증 성공시 사용자 ID와 신뢰도가 표시됩니다.
            </p>
            <p
              style={{
                fontSize: '14px',
                lineHeight: '1.5',
                margin: '0 0 10px 0',
              }}
            >
              4. 백엔드에서 RealSense를 통한 라이브니스 검사가 자동으로
              수행됩니다.
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
