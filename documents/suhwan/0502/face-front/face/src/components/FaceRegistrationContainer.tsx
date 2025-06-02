import React, { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import { 
  FaceRegistrationModule, 
  FaceInfo, 
  ReferencePoints 
} from './FaceRegistrationModule';
import { 
  FaceRegistrationAPI, 
  Direction 
} from './FaceRegistrationAPI';
import './FaceRegistration.css';

// 안정화 시간 (초)
const STABLE_TIME_REQUIRED = 3;

// 방향 목록
const DIRECTIONS: Direction[] = ['front', 'left', 'right', 'up', 'down'];

const FaceRegistrationContainer: React.FC = () => {
  // 상태 관리
  const [isModelLoading, setIsModelLoading] = useState<boolean>(true);
  const [currentDirection, setCurrentDirection] = useState<Direction>('front');
  const [registrationStatus, setRegistrationStatus] = useState<Record<Direction, boolean>>({
    front: false,
    left: false,
    right: false,
    up: false,
    down: false
  });
  const [feedback, setFeedback] = useState<string>('모델을 불러오는 중입니다...');
  const [progress, setProgress] = useState<number>(0);
  const [stableStartTime, setStableStartTime] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isRegistrationComplete, setIsRegistrationComplete] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [capturedImages, setCapturedImages] = useState<Record<Direction, string>>({} as Record<Direction, string>);
  
  // 웹캠 및 캔버스 참조
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // 모듈 참조
  const moduleRef = useRef<FaceRegistrationModule | null>(null);
  const apiRef = useRef<FaceRegistrationAPI | null>(null);
  
  // 초기화
  useEffect(() => {
    // 모듈 및 API 인스턴스 생성
    moduleRef.current = new FaceRegistrationModule();
    apiRef.current = new FaceRegistrationAPI();
    
    // 모듈 초기화 및 세션 생성
    const initialize = async () => {
      try {
        // 모듈 초기화
        const isInitialized = await moduleRef.current!.initialize();
        
        if (!isInitialized) {
          throw new Error('모듈 초기화에 실패했습니다.');
        }
        
        setIsModelLoading(false);
        setFeedback('얼굴을 화면 중앙에 위치시켜주세요');
        
        // 세션 생성
        await createSession();
      } catch (error) {
        console.error('초기화 오류:', error);
        setError('얼굴 인식 시스템을 초기화하는 데 실패했습니다.');
      }
    };
    
    initialize();
    
    // 컴포넌트 언마운트 시 정리
    return () => {
      if (moduleRef.current) {
        moduleRef.current.dispose();
      }
    };
  }, []);
  
  // 세션 생성
  const createSession = async () => {
    try {
      if (!apiRef.current) {
        throw new Error('API가 초기화되지 않았습니다.');
      }
      
      const response = await apiRef.current.createSession();
      
      if (response.success) {
        setSessionId(response.data.sessionId);
      } else {
        setError(response.message);
      }
    } catch (error) {
      console.error('세션 생성 오류:', error);
      setError('세션을 생성하는 데 실패했습니다. 나중에 다시 시도해주세요.');
    }
  };
  
  // 얼굴 감지 및 처리
  useEffect(() => {
    if (isModelLoading || !moduleRef.current || isRegistrationComplete) return;
    
    let animationFrameId: number;
    
    const detectFace = async () => {
      if (
        webcamRef.current && 
        webcamRef.current.video && 
        webcamRef.current.video.readyState === 4 &&
        canvasRef.current
      ) {
        const video = webcamRef.current.video;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) return;
        
        // 캔버스 크기 설정
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        try {
          // 얼굴 감지
          const faceInfo = await moduleRef.current!.detectFace(video);
          
          // 화면 초기화
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          if (faceInfo) {
            // 가이드 그리기
            moduleRef.current!.drawFaceGuide(
              ctx, 
              faceInfo, 
              canvas.width, 
              canvas.height, 
              progress
            );
            
            // 현재 방향에 따른 검증
            const isValid = moduleRef.current!.validateFace(faceInfo, currentDirection);
            
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
              const feedbackMessage = moduleRef.current!.generateFeedback(faceInfo, currentDirection);
              setFeedback(feedbackMessage);
            }
          } else {
            // 얼굴이 감지되지 않음
            if (stableStartTime) {
              setStableStartTime(null);
              setProgress(0);
            }
            setFeedback('얼굴이 감지되지 않습니다');
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
  }, [isModelLoading, currentDirection, stableStartTime, isRegistrationComplete, progress]);
  
  // 얼굴 캡처
  const captureFace = async (direction: Direction, faceInfo: FaceInfo) => {
    if (!webcamRef.current || !sessionId || !moduleRef.current) return;
    
    try {
      // 현재 프레임 캡처
      const imageSrc = webcamRef.current.getScreenshot();
      
      if (!imageSrc) {
        throw new Error('이미지 캡처에 실패했습니다.');
      }
      
      // 첫 번째 촬영(정면)일 경우 기준점 저장
      if (direction === 'front') {
        const referencePoints: ReferencePoints = {
          leftEye: faceInfo.leftEye,
          rightEye: faceInfo.rightEye,
          nose: faceInfo.nose
        };
        
        moduleRef.current.setReferencePoints(referencePoints);
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
          setFeedback(moduleRef.current!.getDirectionMessage(nextDirection));
        }, 1500); // 잠시 대기 후 다음 방향으로
      } else {
        // 모든 방향 완료 - 서버에 업로드
        await uploadImages();
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
  
  // 이미지 업로드
  const uploadImages = async () => {
    try {
      if (!apiRef.current || !sessionId) {
        throw new Error('API가 초기화되지 않았습니다.');
      }
      
      setFeedback('얼굴 등록 데이터 업로드 중...');
      
      // 서버로 전송
      const response = await apiRef.current.uploadImages(sessionId, capturedImages);
      
      if (response.success) {
        // 등록 완료 요청
        await completeRegistration();
      } else {
        setError(response.message);
      }
    } catch (error) {
      console.error('이미지 업로드 오류:', error);
      setError('얼굴 이미지 업로드 중 오류가 발생했습니다.');
    }
  };
  
  // 등록 완료
  const completeRegistration = async () => {
    try {
      if (!apiRef.current || !sessionId) {
        throw new Error('API가 초기화되지 않았습니다.');
      }
      
      const response = await apiRef.current.completeRegistration(sessionId);
      
      if (response.success) {
        setFeedback('얼굴 등록이 완료되었습니다!');
        setIsRegistrationComplete(true);
      } else {
        setError(response.message);
      }
    } catch (error) {
      console.error('등록 완료 오류:', error);
      setError('얼굴 등록 완료 중 오류가 발생했습니다.');
    }
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
        <p>이제 얼굴 인식으로 편리하게 서비스를 이용하실 수 있습니다.</p>
        <button onClick={() => window.location.href = '/dashboard'}>메인으로 이동</button>
      </div>
    );
  }
  
  // 등록 화면
  return (
    <div className="face-registration-container">
      <h2>얼굴 등록</h2>
      <p className="direction-guide">
        {moduleRef.current?.getDirectionMessage(currentDirection) || '얼굴을 정면으로 바라봐주세요'}
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
    </div>
  );
};

export default FaceRegistrationContainer;