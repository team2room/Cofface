import * as tf from '@tensorflow/tfjs';
import * as faceLandmarksDetection from '@mediapipe/face_mesh';
import * as camera from '@mediapipe/camera_utils';
import * as drawingUtils from '@mediapipe/drawing_utils';
import { Direction } from './FaceRegistrationAPI';

/**
 * 얼굴 각도 인터페이스
 */
export interface Angle {
  yaw: number;
  pitch: number;
  roll: number;
}

/**
 * 얼굴 기준점 인터페이스
 */
export interface ReferencePoints {
  leftEye: number[];
  rightEye: number[];
  nose: number[];
}

/**
 * 얼굴 정보 인터페이스
 */
export interface FaceInfo {
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
  angle: Angle;
}

/**
 * 이미지 품질 기준 인터페이스
 */
export interface ImageQualitySettings {
  minBrightness: number;
  maxBrightness: number;
  minSharpness: number;
  minFaceRatio: number;
  maxFaceRatio: number;
}

/**
 * 얼굴 등록 모듈 클래스
 * - MediaPipe Face Mesh를 활용한 얼굴 인식 및 머리 포즈 추정
 */
export class FaceRegistrationModule {
  // 각 방향별 목표 각도
  private readonly targetAngles: Record<Direction, Angle> = {
    front: { yaw: 0, pitch: 0, roll: 0 },
    left: { yaw: -30, pitch: 0, roll: 0 },
    right: { yaw: 30, pitch: 0, roll: 0 },
    up: { yaw: 0, pitch: -20, roll: 0 },
    down: { yaw: 0, pitch: 20, roll: 0 }
  };
  
  // 각도 허용 오차
  private readonly angleThreshold: number = 10;
  
  // 이미지 품질 기준
  private readonly imageQuality: ImageQualitySettings = {
    minBrightness: 40,
    maxBrightness: 240,
    minSharpness: 50,
    minFaceRatio: 0.2,
    maxFaceRatio: 0.7
  };
  
  // 얼굴 감지 모델
  private faceMesh: faceLandmarksDetection.FaceMesh | null = null;
  
  // 기준점
  private referencePoints: ReferencePoints | null = null;
  
  // 3D 얼굴 모델 포인트 (표준 얼굴 모델)
  private readonly face3D = [
    [0.0, 0.0, 0.0],            // 코 끝(1)
    [0.0, -330.0, -65.0],       // 턱(199)
    [-225.0, 170.0, -135.0],    // 왼쪽 눈 왼쪽 구석(33)
    [225.0, 170.0, -135.0],     // 오른쪽 눈 오른쪽 구석(263)
    [-150.0, -150.0, -125.0],   // 왼쪽 입 구석(61)
    [150.0, -150.0, -125.0]     // 오른쪽 입 구석(291)
  ];
  
  // 카메라 매트릭스
  private readonly camera_matrix: number[][] = [
    [1000, 0, 320],  // fx, 0, cx
    [0, 1000, 240],  // 0, fy, cy 
    [0, 0, 1]        // 0, 0, 1
  ];
  
  // 카메라 왜곡 계수
  private readonly dist_coeffs: number[] = [0, 0, 0, 0, 0];
  
  // 주요 랜드마크 인덱스
  private readonly FACE_OVAL_INDICES = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288,
    397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109];
  
  private readonly EYE_INDICES = {
    LEFT_EYE: [33, 133, 160, 159, 158, 144, 145, 153],
    RIGHT_EYE: [263, 362, 387, 386, 385, 373, 374, 380]
  };
  
  private readonly NOSE_INDICES = [1, 2, 3, 4, 5, 6, 197, 195, 5, 4, 196, 197, 6, 168, 8, 193, 122, 196, 3, 51, 134, 236, 198, 8, 9];
  
  // 주요 포즈 추정 랜드마크 인덱스
  private readonly POSE_LANDMARKS = [1, 33, 263, 61, 291, 199];  // 코, 왼눈, 오른눈, 왼입, 오른입, 턱
  
  /**
   * 생성자
   * @param customSettings 사용자 정의 설정 (선택 사항)
   */
  constructor(customSettings?: {
    angleThreshold?: number;
    targetAngles?: Partial<Record<Direction, Angle>>;
    imageQuality?: Partial<ImageQualitySettings>;
  }) {
    // 사용자 정의 설정 적용
    if (customSettings) {
      if (customSettings.angleThreshold) {
        this.angleThreshold = customSettings.angleThreshold;
      }
      
      if (customSettings.targetAngles) {
        Object.keys(customSettings.targetAngles).forEach(key => {
          const direction = key as Direction;
          const angle = customSettings.targetAngles![direction];
          if (angle) {
            this.targetAngles[direction] = {
              ...this.targetAngles[direction],
              ...angle
            };
          }
        });
      }
      
      if (customSettings.imageQuality) {
        this.imageQuality = {
          ...this.imageQuality,
          ...customSettings.imageQuality
        };
      }
    }
  }
  
  /**
   * 모델 초기화
   * @returns 초기화 성공 여부
   */
  async initialize(): Promise<boolean> {
    try {
      // TensorFlow.js 설정 (필요시)
      await tf.setBackend('webgl');
      
      // MediaPipe FaceMesh 초기화
      this.faceMesh = new faceLandmarksDetection.FaceMesh({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
        }
      });
      
      await this.faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
        selfieMode: true, // 영상 좌우 반전 (셀카 모드)
      });
      
      return true;
    } catch (error) {
      console.error('모델 로드 오류:', error);
      return false;
    }
  }
  
  /**
   * 모델이 로드되었는지 확인
   * @returns 모델 로드 여부
   */
  isModelLoaded(): boolean {
    return this.faceMesh !== null;
  }
  
  /**
   * 기준점 설정
   * @param points 기준점
   */
  setReferencePoints(points: ReferencePoints): void {
    this.referencePoints = points;
  }
  
  /**
   * 얼굴 감지
   * @param video 비디오 요소
   * @returns 감지된 얼굴 정보
   */
  async detectFace(video: HTMLVideoElement): Promise<FaceInfo | null> {
    if (!this.faceMesh) {
      throw new Error('모델이 초기화되지 않았습니다.');
    }
    
    try {
      // 현재 캔버스에서 이미지 데이터 캡처
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('캔버스 컨텍스트를 가져올 수 없습니다.');
      }
      
      // 비디오 프레임을 캔버스에 그리기
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // 얼굴 감지
      await this.faceMesh.send({image: video});
      
      // 결과 가져오기 (Promise로 변환)
      const results = await new Promise<any>((resolve) => {
        this.faceMesh!.onResults(resolve);
      });
      
      if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
        return null;
      }
      
      // 첫 번째 얼굴
      const faceLandmarks = results.multiFaceLandmarks[0];
      
      // 얼굴 정보 추출
      return this.extractFaceInfo(faceLandmarks, video.videoWidth, video.videoHeight);
    } catch (error) {
      console.error('얼굴 감지 오류:', error);
      return null;
    }
  }
  
  /**
   * 얼굴 정보 추출
   * @param faceLandmarks 감지된 얼굴 랜드마크
   * @param canvasWidth 캔버스 너비
   * @param canvasHeight 캔버스 높이
   * @returns 추출된 얼굴 정보
   */
  private extractFaceInfo(
    faceLandmarks: any, 
    canvasWidth: number, 
    canvasHeight: number
  ): FaceInfo {
    // 랜드마크 배열로 변환
    const landmarksArray = faceLandmarks.map((lm: any) => [
      lm.x * canvasWidth, 
      lm.y * canvasHeight, 
      lm.z * canvasWidth // z 값은 x와 동일한 스케일
    ]);
    
    // 바운딩 박스 추출
    const xCoords = landmarksArray.map((l: number[]) => l[0]);
    const yCoords = landmarksArray.map((l: number[]) => l[1]);
    
    const xMin = Math.min(...xCoords);
    const yMin = Math.min(...yCoords);
    const xMax = Math.max(...xCoords);
    const yMax = Math.max(...yCoords);
    
    const width = xMax - xMin;
    const height = yMax - yMin;
    
    // 얼굴 크기
    const faceWidth = width;
    const faceHeight = height;
    
    // 얼굴 중심
    const faceCenter = {
      x: xMin + faceWidth / 2,
      y: yMin + faceHeight / 2
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
    const minFaceWidth = canvasWidth * this.imageQuality.minFaceRatio;
    const maxFaceWidth = canvasWidth * this.imageQuality.maxFaceRatio;
    
    // 주요 랜드마크 추출
    const leftEye = landmarksArray[this.POSE_LANDMARKS[1]]; // 왼쪽 눈
    const rightEye = landmarksArray[this.POSE_LANDMARKS[2]]; // 오른쪽 눈
    const nose = landmarksArray[this.POSE_LANDMARKS[0]]; // 코 끝
    
    // 머리 포즈 추정 (PnP 방식)
    const angle = this.estimateHeadPose(landmarksArray, canvasWidth, canvasHeight);
    
    return {
      boundingBox: {
        xMin,
        yMin,
        width,
        height
      },
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
      leftEye,
      rightEye,
      nose,
      angle
    };
  }
  
  /**
   * 머리 포즈 추정 (3D 회전 각도 계산)
   * @param landmarks 얼굴 랜드마크
   * @param width 이미지 너비
   * @param height 이미지 높이
   * @returns 회전 각도 (yaw, pitch, roll)
   */
  private estimateHeadPose(
    landmarks: number[][], 
    width: number, 
    height: number
  ): Angle {
    // 주요 포즈 추정에 사용할 랜드마크 포인트 선택
    const imagePoints = [
      landmarks[this.POSE_LANDMARKS[0]], // 코 끝
      landmarks[this.POSE_LANDMARKS[5]], // 턱
      landmarks[this.POSE_LANDMARKS[1]], // 왼쪽 눈
      landmarks[this.POSE_LANDMARKS[2]], // 오른쪽 눈
      landmarks[this.POSE_LANDMARKS[3]], // 왼쪽 입
      landmarks[this.POSE_LANDMARKS[4]]  // 오른쪽 입
    ];
    
    // 정규화된 이미지 포인트 (OpenCV solvePnP 형식)
    const normalizedImagePoints = imagePoints.map((point) => [point[0], point[1]]);
    
    // 자바스크립트에서 OpenCV의 solvePnP 기능을 직접 구현하기는 어려움
    // 간소화된 방식으로 각도 추정

    // 1. 눈 사이 거리로 Roll 각도 추정
    const leftEye = landmarks[this.POSE_LANDMARKS[1]];
    const rightEye = landmarks[this.POSE_LANDMARKS[2]];
    const dY = rightEye[1] - leftEye[1];
    const dX = rightEye[0] - leftEye[0];
    const roll = Math.atan2(dY, dX) * (180 / Math.PI);
    
    // 2. 눈 사이 거리 비율로 Yaw 추정
    const eyeDistance = Math.sqrt(dX * dX + dY * dY);
    
    // 기준점이 있는 경우 기준점 기반 각도 계산, 없는 경우 기본 계산
    let yaw = 0;
    let pitch = 0;
    
    if (this.referencePoints) {
      // 기준점 기반 Yaw(좌우) 계산
      const refLeftEye = this.referencePoints.leftEye;
      const refRightEye = this.referencePoints.rightEye;
      const refDX = refRightEye[0] - refLeftEye[0];
      const refEyeDistance = Math.sqrt(refDX * refDX + Math.pow(refRightEye[1] - refLeftEye[1], 2));
      
      // 거리 비율로 각도 계산 (눈 사이 거리가 줄어들면 옆으로 돌아간 것)
      const ratio = eyeDistance / refEyeDistance;
      const maxYawAngle = 90; // 최대 회전 각도
      
      // 얼굴의 대칭을 고려하여 좌/우 방향 결정
      const noseX = landmarks[this.POSE_LANDMARKS[0]][0];
      const eyeCenterX = (leftEye[0] + rightEye[0]) / 2;
      const eyeCenterDiff = noseX - eyeCenterX;
      
      const refNoseX = this.referencePoints.nose[0];
      const refEyeCenterX = (refLeftEye[0] + refRightEye[0]) / 2;
      const refEyeCenterDiff = refNoseX - refEyeCenterX;
      
      // 코와 눈 중앙의 X 위치 관계 변화로 좌/우 방향 결정
      const direction = (eyeCenterDiff - refEyeCenterDiff > 0) ? -1 : 1;
      
      // 비율에 따른 각도 조정 (1에 가까울수록 정면, 줄어들수록 측면)
      yaw = direction * Math.max(0, Math.min(maxYawAngle, (1 - ratio) * maxYawAngle * 1.5));
      
      // 기준점 기반 Pitch(상하) 계산
      const refNose = this.referencePoints.nose;
      const refEyeCenterY = (refLeftEye[1] + refRightEye[1]) / 2;
      const refNoseToEyeY = refNose[1] - refEyeCenterY;
      
      const eyeCenterY = (leftEye[1] + rightEye[1]) / 2;
      const noseToEyeY = landmarks[this.POSE_LANDMARKS[0]][1] - eyeCenterY;
      
      // 비율로 각도 계산
      const pitchRatio = noseToEyeY / refNoseToEyeY;
      const maxPitchAngle = 45; // 최대 상하 각도
      
      // 코와 눈의 Y 거리 변화로 상하 방향 결정
      pitch = (pitchRatio - 1) * maxPitchAngle;
    } else {
      // 기준점 없는 경우 얼굴 크기만으로 간단히 추정
      // 표준 얼굴 비율 대비 현재 비율로 계산
      const standardEyeDistance = width * 0.15; // 표준 눈 사이 거리 (화면 폭의 약 15%)
      yaw = (1 - eyeDistance / standardEyeDistance) * 90;
      
      // 정면 얼굴에서는 Pitch 계산이 어려움 (기준점 없이는 추정만 가능)
      // 코와 입의 상대적 위치로 대략 추정
      const nose = landmarks[this.POSE_LANDMARKS[0]];
      const mouthCenter = [
        (landmarks[this.POSE_LANDMARKS[3]][0] + landmarks[this.POSE_LANDMARKS[4]][0]) / 2,
        (landmarks[this.POSE_LANDMARKS[3]][1] + landmarks[this.POSE_LANDMARKS[4]][1]) / 2
      ];
      
      const eyeCenter = [(leftEye[0] + rightEye[0]) / 2, (leftEye[1] + rightEye[1]) / 2];
      const faceHeight = height * 0.33; // 표준 얼굴 높이 (화면 높이의 약 33%)
      
      // 코-입 거리와 코-눈 거리의 비율로 상하 각도 추정
      const noseToMouth = Math.sqrt(Math.pow(nose[0] - mouthCenter[0], 2) + Math.pow(nose[1] - mouthCenter[1], 2));
      const noseToEye = Math.sqrt(Math.pow(nose[0] - eyeCenter[0], 2) + Math.pow(nose[1] - eyeCenter[1], 2));
      
      const standardRatio = 1.0; // 표준 비율 (정면)
      const currentRatio = noseToMouth / noseToEye;
      
      pitch = (currentRatio - standardRatio) * 45; // 비율 차이에 따라 조정
    }
    
    // 각도 값 보정 (실용적인 범위 내로 제한)
    yaw = Math.max(-75, Math.min(75, yaw));
    pitch = Math.max(-45, Math.min(45, pitch));
    
    return { yaw, pitch, roll };
  }
  
  /**
   * 얼굴 검증
   * @param faceInfo 얼굴 정보
   * @param direction 방향
   * @returns 검증 결과
   */
  validateFace(faceInfo: FaceInfo, direction: Direction): boolean {
    // 위치와 크기 검증
    if (!faceInfo.isPositionValid || !faceInfo.isSizeValid) {
      return false;
    }
    
    // 정면 촬영일 때는 위치와 크기만 검증
    if (direction === 'front' && !this.referencePoints) {
      return true;
    }
    
    // 다른 방향일 때는 각도 검증
    const targetAngle = this.targetAngles[direction];
    const yawDiff = Math.abs(faceInfo.angle.yaw - targetAngle.yaw);
    const pitchDiff = Math.abs(faceInfo.angle.pitch - targetAngle.pitch);
    const rollDiff = Math.abs(faceInfo.angle.roll - targetAngle.roll);
    
    // 주요 각도만 확인 (방향에 따라)
    if (direction === 'left' || direction === 'right') {
      return yawDiff <= this.angleThreshold && rollDiff <= this.angleThreshold * 1.5;
    } else if (direction === 'up' || direction === 'down') {
      return pitchDiff <= this.angleThreshold && rollDiff <= this.angleThreshold * 1.5;
    }
    
    // 모든 각도 확인 (정면)
    return (
      yawDiff <= this.angleThreshold && 
      pitchDiff <= this.angleThreshold && 
      rollDiff <= this.angleThreshold
    );
  }
  
  /**
   * 피드백 메시지 생성
   * @param faceInfo 얼굴 정보
   * @param direction 방향
   * @returns 피드백 메시지
   */
  generateFeedback(faceInfo: FaceInfo, direction: Direction): string {
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
    
    // 각도 기반 피드백
    const targetAngle = this.targetAngles[direction];
    const { yaw, pitch, roll } = faceInfo.angle;
    
    // 가장 큰 차이가 나는 각도 확인
    const yawDiff = yaw - targetAngle.yaw;
    const pitchDiff = pitch - targetAngle.pitch;
    const rollDiff = roll - targetAngle.roll;
    
    const absYawDiff = Math.abs(yawDiff);
    const absPitchDiff = Math.abs(pitchDiff);
    const absRollDiff = Math.abs(rollDiff);
    
    // 모든 각도가 허용 범위 내
    if (
      absYawDiff <= this.angleThreshold && 
      absPitchDiff <= this.angleThreshold && 
      absRollDiff <= this.angleThreshold * 1.5
    ) {
      return '좋습니다! 유지해주세요...';
    }
    
    // 방향에 따른 중요 각도 우선 확인
    if (direction === 'left' || direction === 'right') {
      if (absYawDiff > this.angleThreshold) {
        if (direction === 'left') { // 왼쪽으로 30도
          return yawDiff > 0 // 현재 각도가 목표보다 크면 (더 오른쪽)
            ? '고개를 왼쪽으로 더 돌려주세요'
            : '고개를 오른쪽으로 더 돌려주세요';
        } else { // 오른쪽으로 30도
          return yawDiff < 0 // 현재 각도가 목표보다 작으면 (더 왼쪽)
            ? '고개를 오른쪽으로 더 돌려주세요'
            : '고개를 왼쪽으로 더 돌려주세요';
        }
      }
    } else if (direction === 'up' || direction === 'down') {
      if (absPitchDiff > this.angleThreshold) {
        if (direction === 'up') { // 위로 20도
          return pitchDiff > 0 // 현재 각도가 목표보다 크면 (더 아래)
            ? '고개를 위로 더 들어주세요'
            : '고개를 아래로 더 숙여주세요';
        } else { // 아래로 20도
          return pitchDiff < 0 // 현재 각도가 목표보다 작으면 (더 위)
            ? '고개를 아래로 더 숙여주세요'
            : '고개를 위로 더 들어주세요';
        }
      }
    } else if (direction === 'front') {
      // 정면 촬영 시 가장 큰 문제 우선 해결
      const maxDiff = Math.max(absYawDiff, absPitchDiff, absRollDiff / 1.5);
      
      if (maxDiff === absYawDiff) {
        return yawDiff > 0
          ? '고개를 왼쪽으로 조금 돌려주세요'
          : '고개를 오른쪽으로 조금 돌려주세요';
      } else if (maxDiff === absPitchDiff) {
        return pitchDiff > 0
          ? '고개를 위로 조금 들어주세요'
          : '고개를 아래로 조금 숙여주세요';
      } else {
        return rollDiff > 0
          ? '고개를 시계 반대 방향으로 조금 기울여주세요'
          : '고개를 시계 방향으로 조금 기울여주세요';
      }
    }
    
    // 기울기(Roll) 문제
    if (absRollDiff > this.angleThreshold * 1.5) {
      return rollDiff > 0
        ? '고개가 기울어져 있습니다. 수평을 맞춰주세요'
        : '고개가 기울어져 있습니다. 수평을 맞춰주세요';
    }
    
    return '얼굴 각도를 조정해주세요';
  }
  
  /**
   * 방향별 안내 메시지
   * @param direction 방향
   * @returns 안내 메시지
   */
  getDirectionMessage(direction: Direction): string {
    const messages: Record<Direction, string> = {
      front: '얼굴을 정면으로 바라봐주세요',
      left: '고개를 왼쪽으로 살짝 돌려주세요',
      right: '고개를 오른쪽으로 살짝 돌려주세요',
      up: '고개를 위로 살짝 들어주세요',
      down: '고개를 아래로 살짝 숙여주세요'
    };
    return messages[direction];
  }
  
  /**
   * 가이드 그리기
   * @param ctx 캔버스 컨텍스트
   * @param faceInfo 얼굴 정보
   * @param canvasWidth 캔버스 너비
   * @param canvasHeight 캔버스 높이
   * @param progress 진행률 (0~1)
   */
  drawFaceGuide(
    ctx: CanvasRenderingContext2D, 
    faceInfo: FaceInfo, 
    canvasWidth: number, 
    canvasHeight: number,
    progress: number = 0
  ): void {
    // 배경 어둡게 처리 (반투명)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // 화면 중앙 원 그리기 (위치 검증용)
    ctx.strokeStyle = faceInfo.isPositionValid ? 'rgba(0, 255, 0, 0.7)' : 'rgba(255, 0, 0, 0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(
      canvasWidth / 2,
      canvasHeight / 2,
      faceInfo.maxDistance,
      0,
      2 * Math.PI
    );
    ctx.stroke();
    
    // 얼굴 바운딩 박스 그리기 (크기 검증용)
    ctx.strokeStyle = faceInfo.isSizeValid ? 'rgba(0, 255, 0, 0.7)' : 'rgba(255, 0, 0, 0.7)';
    ctx.lineWidth = 2;
    ctx.strokeRect(
      faceInfo.boundingBox.xMin,
      faceInfo.boundingBox.yMin,
      faceInfo.faceWidth,
      faceInfo.faceHeight
    );
    
    // 얼굴 메시 그리기
    this.drawFaceMesh(ctx, faceInfo);
    
    // 3D 축 그리기
    this.draw3DAxes(ctx, faceInfo, canvasWidth, canvasHeight);
    
    // 진행 상태 바 그리기
    if (progress > 0) {
      const barWidth = canvasWidth * 0.7;
      const barHeight = 20;
      const barX = (canvasWidth - barWidth) / 2;
      const barY = canvasHeight - 60;
      
      // 배경
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(barX, barY, barWidth, barHeight);
      
      // 진행률
      ctx.fillStyle = 'rgba(0, 255, 0, 0.7)';
      ctx.fillRect(barX, barY, barWidth * progress, barHeight);
      
      // 텍스트
      ctx.fillStyle = 'white';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${Math.round(progress * 100)}%`, barX + barWidth / 2, barY + barHeight / 2);
    }
    
    // 각도 표시
    this.drawAngleInfo(ctx, faceInfo);
  }
  
  /**
   * 얼굴 메시 그리기
   * @param ctx 캔버스 컨텍스트
   * @param faceInfo 얼굴 정보
   */
  private drawFaceMesh(ctx: CanvasRenderingContext2D, faceInfo: FaceInfo): void {
    // 얼굴 윤곽 그리기
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    
    // 얼굴 윤곽선 그리기
    for (let i = 0; i < this.FACE_OVAL_INDICES.length; i++) {
      const idx = this.FACE_OVAL_INDICES[i];
      const point = faceInfo.landmarks[idx];
      
      if (i === 0) {
        ctx.moveTo(point[0], point[1]);
      } else {
        ctx.lineTo(point[0], point[1]);
      }
    }
    
    // 첫 번째 점과 마지막 점 연결
    const firstPoint = faceInfo.landmarks[this.FACE_OVAL_INDICES[0]];
    ctx.lineTo(firstPoint[0], firstPoint[1]);
    
    ctx.stroke();
    
    // 눈 그리기
    this.drawEyes(ctx, faceInfo);
    
    // 코 그리기
    this.drawNose(ctx, faceInfo);
  }
  
  /**
   * 눈 그리기
   * @param ctx 캔버스 컨텍스트
   * @param faceInfo 얼굴 정보
   */
  private drawEyes(ctx: CanvasRenderingContext2D, faceInfo: FaceInfo): void {
    // 왼쪽 눈
    ctx.strokeStyle = 'rgba(0, 120, 255, 0.8)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    
    for (let i = 0; i < this.EYE_INDICES.LEFT_EYE.length; i++) {
      const idx = this.EYE_INDICES.LEFT_EYE[i];
      const point = faceInfo.landmarks[idx];
      
      if (i === 0) {
        ctx.moveTo(point[0], point[1]);
      } else {
        ctx.lineTo(point[0], point[1]);
      }
    }
    
    // 첫 번째 점과 마지막 점 연결
    const firstLeftEyePoint = faceInfo.landmarks[this.EYE_INDICES.LEFT_EYE[0]];
    ctx.lineTo(firstLeftEyePoint[0], firstLeftEyePoint[1]);
    
    ctx.stroke();
    
    // 오른쪽 눈
    ctx.beginPath();
    
    for (let i = 0; i < this.EYE_INDICES.RIGHT_EYE.length; i++) {
      const idx = this.EYE_INDICES.RIGHT_EYE[i];
      const point = faceInfo.landmarks[idx];
      
      if (i === 0) {
        ctx.moveTo(point[0], point[1]);
      } else {
        ctx.lineTo(point[0], point[1]);
      }
    }
    
    // 첫 번째 점과 마지막 점 연결
    const firstRightEyePoint = faceInfo.landmarks[this.EYE_INDICES.RIGHT_EYE[0]];
    ctx.lineTo(firstRightEyePoint[0], firstRightEyePoint[1]);
    
    ctx.stroke();
  }
  
  /**
   * 코 그리기
   * @param ctx 캔버스 컨텍스트
   * @param faceInfo 얼굴 정보
   */
  private drawNose(ctx: CanvasRenderingContext2D, faceInfo: FaceInfo): void {
    ctx.strokeStyle = 'rgba(255, 120, 0, 0.8)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    
    for (let i = 0; i < this.NOSE_INDICES.length; i++) {
      const idx = this.NOSE_INDICES[i];
      const point = faceInfo.landmarks[idx];
      
      if (i === 0 || i === 5 || i === 9 || i === 13 || i === 17) {
        ctx.moveTo(point[0], point[1]);
      } else {
        ctx.lineTo(point[0], point[1]);
      }
    }
    
    ctx.stroke();
  }
  
  /**
   * 3D 축 그리기
   * @param ctx 캔버스 컨텍스트
   * @param faceInfo 얼굴 정보
   * @param canvasWidth 캔버스 너비
   * @param canvasHeight 캔버스 높이
   */
  private draw3DAxes(
    ctx: CanvasRenderingContext2D, 
    faceInfo: FaceInfo, 
    canvasWidth: number, 
    canvasHeight: number
  ): void {
    const nose = faceInfo.nose;
    const { yaw, pitch, roll } = faceInfo.angle;
    
    // 화살표 길이
    const arrowLength = Math.min(canvasWidth, canvasHeight) * 0.15;
    
    // 회전 행렬 계산
    const yawRad = yaw * Math.PI / 180;
    const pitchRad = pitch * Math.PI / 180;
    const rollRad = roll * Math.PI / 180;
    
    // X축 (좌-우)
    const xEndX = nose[0] + arrowLength * Math.cos(yawRad) * Math.cos(rollRad);
    const xEndY = nose[1] + arrowLength * Math.sin(rollRad);
    
    // Y축 (상-하)
    const yEndX = nose[0] + arrowLength * Math.sin(rollRad);
    const yEndY = nose[1] + arrowLength * Math.sin(pitchRad) * Math.cos(rollRad);
    
    // Z축 (전-후)
    const zEndX = nose[0] + arrowLength * Math.sin(yawRad);
    const zEndY = nose[1] - arrowLength * Math.cos(pitchRad);
    
    // X축 (빨강)
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(nose[0], nose[1]);
    ctx.lineTo(xEndX, xEndY);
    ctx.stroke();
    
    // 화살표 끝 그리기
    const arrowSize = 10;
    ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
    ctx.beginPath();
    ctx.moveTo(xEndX, xEndY);
    ctx.lineTo(xEndX - arrowSize, xEndY - arrowSize / 2);
    ctx.lineTo(xEndX - arrowSize, xEndY + arrowSize / 2);
    ctx.closePath();
    ctx.fill();
    
    // Y축 (녹색)
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)';
    ctx.beginPath();
    ctx.moveTo(nose[0], nose[1]);
    ctx.lineTo(yEndX, yEndY);
    ctx.stroke();
    
    // 화살표 끝 그리기
    ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
    ctx.beginPath();
    ctx.moveTo(yEndX, yEndY);
    ctx.lineTo(yEndX - arrowSize / 2, yEndY - arrowSize);
    ctx.lineTo(yEndX + arrowSize / 2, yEndY - arrowSize);
    ctx.closePath();
    ctx.fill();
    
    // Z축 (파랑)
    ctx.strokeStyle = 'rgba(0, 0, 255, 0.8)';
    ctx.beginPath();
    ctx.moveTo(nose[0], nose[1]);
    ctx.lineTo(zEndX, zEndY);
    ctx.stroke();
    
    // 화살표 끝 그리기
    ctx.fillStyle = 'rgba(0, 0, 255, 0.8)';
    ctx.beginPath();
    ctx.moveTo(zEndX, zEndY);
    const zArrowAngle = Math.atan2(zEndY - nose[1], zEndX - nose[0]);
    ctx.lineTo(
      zEndX - arrowSize * Math.cos(zArrowAngle - Math.PI / 6),
      zEndY - arrowSize * Math.sin(zArrowAngle - Math.PI / 6)
    );
    ctx.lineTo(
      zEndX - arrowSize * Math.cos(zArrowAngle + Math.PI / 6),
      zEndY - arrowSize * Math.sin(zArrowAngle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fill();
  }
  
  /**
   * 각도 정보 표시
   * @param ctx 캔버스 컨텍스트
   * @param faceInfo 얼굴 정보
   */
  private drawAngleInfo(ctx: CanvasRenderingContext2D, faceInfo: FaceInfo): void {
    const { yaw, pitch, roll } = faceInfo.angle;
    
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    // 각도 정보 텍스트
    ctx.fillText(`Yaw: ${yaw.toFixed(1)}°`, 20, 20);
    ctx.fillText(`Pitch: ${pitch.toFixed(1)}°`, 20, 45);
    ctx.fillText(`Roll: ${roll.toFixed(1)}°`, 20, 70);
  }
  
  /**
   * 이미지 품질 검사
   * @param imageData 이미지 데이터
   * @returns 품질 검사 결과
   */
  checkImageQuality(imageData: ImageData): {
    isValid: boolean;
    brightness: number;
    sharpness: number;
    issues: string[];
  } {
    // 이미지 밝기 계산
    const brightness = this.calculateBrightness(imageData);
    const isBrightnessValid = 
      brightness >= this.imageQuality.minBrightness && 
      brightness <= this.imageQuality.maxBrightness;
    
    // 이미지 선명도 계산
    const sharpness = this.calculateSharpness(imageData);
    const isSharpnessValid = sharpness >= this.imageQuality.minSharpness;
    
    // 문제점 수집
    const issues: string[] = [];
    
    if (!isBrightnessValid) {
      if (brightness < this.imageQuality.minBrightness) {
        issues.push('이미지가 너무 어둡습니다');
      } else {
        issues.push('이미지가 너무 밝습니다');
      }
    }
    
    if (!isSharpnessValid) {
      issues.push('이미지가 흐립니다');
    }
    
    return {
      isValid: isBrightnessValid && isSharpnessValid,
      brightness,
      sharpness,
      issues
    };
  }
  
  /**
   * 이미지 밝기 계산
   * @param imageData 이미지 데이터
   * @returns 밝기 값 (0~255)
   */
  private calculateBrightness(imageData: ImageData): number {
    const data = imageData.data;
    let sum = 0;
    
    // RGB 평균값으로 밝기 계산
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      sum += (r + g + b) / 3;
    }
    
    return sum / (data.length / 4);
  }
  
  /**
   * 이미지 선명도 계산
   * @param imageData 이미지 데이터
   * @returns 선명도 값
   */
  private calculateSharpness(imageData: ImageData): number {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    
    let sharpness = 0;
    
    // 라플라시안 필터로 선명도 계산 (간소화된 버전)
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        
        // 현재 픽셀의 그레이스케일 값
        const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
        
        // 주변 픽셀의 그레이스케일 값
        const grayUp = (data[idx - width * 4] + data[idx - width * 4 + 1] + data[idx - width * 4 + 2]) / 3;
        const grayDown = (data[idx + width * 4] + data[idx + width * 4 + 1] + data[idx + width * 4 + 2]) / 3;
        const grayLeft = (data[idx - 4] + data[idx - 3] + data[idx - 2]) / 3;
        const grayRight = (data[idx + 4] + data[idx + 5] + data[idx + 6]) / 3;
        
        // 라플라시안 값
        const laplacian = Math.abs(4 * gray - grayUp - grayDown - grayLeft - grayRight);
        sharpness += laplacian;
      }
    }
    
    // 평균 선명도 값
    return sharpness / ((width - 2) * (height - 2));
  }
  
  /**
   * 모델 리소스 해제
   */
  dispose(): void {
    if (this.faceMesh) {
      try {
        // 모델 리소스 해제
        this.faceMesh.close();
        this.faceMesh = null;
        
        // 참조 정보 초기화
        this.referencePoints = null;
        
      } catch (error) {
        console.error('모델 해제 오류:', error);
      }
    }
  }
}