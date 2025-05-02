import * as tf from '@tensorflow/tfjs';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import { Direction } from './FaceRegistrationAPI';

/**
 * 얼굴 각도 인터페이스
 */
export interface Angle {
  yaw: number;
  pitch: number;
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
 * - 얼굴 인식, 각도 계산, 이미지 처리 등 프론트엔드 얼굴 등록 관련 로직
 */
export class FaceRegistrationModule {
  // 각 방향별 목표 각도
  private readonly targetAngles: Record<Direction, Angle> = {
    front: { yaw: 0, pitch: 0 },
    left: { yaw: -30, pitch: 0 },
    right: { yaw: 30, pitch: 0 },
    up: { yaw: 0, pitch: -20 },
    down: { yaw: 0, pitch: 20 }
  };
  
  // 각도 허용 오차
  private readonly angleThreshold: number = 15;
  
  // 이미지 품질 기준
  private readonly imageQuality: ImageQualitySettings = {
    minBrightness: 40,
    maxBrightness: 240,
    minSharpness: 50,
    minFaceRatio: 0.1,
    maxFaceRatio: 0.7
  };
  
  // 얼굴 감지 모델
  private detector: faceLandmarksDetection.FaceLandmarksDetector | null = null;
  
  // 기준점
  private referencePoints: ReferencePoints | null = null;
  
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
      // TensorFlow.js 설정
      await tf.setBackend('webgl');
      
      // 모델 로드 (새로운 API 사용)
      const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
      const detectorConfig = {
        runtime: 'tfjs' as const,
        refineLandmarks: true,
        maxFaces: 1
      };
      
      this.detector = await faceLandmarksDetection.createDetector(
        model, 
        detectorConfig
      );
      
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
    return this.detector !== null;
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
    if (!this.detector) {
      throw new Error('모델이 초기화되지 않았습니다.');
    }
    
    try {
      // 얼굴 감지 (새로운 API 사용)
      const faces = await this.detector.estimateFaces(video);
      
      if (faces.length === 0) {
        return null;
      }
      
      // 첫 번째 얼굴
      const face = faces[0];
      
      // 얼굴 정보 추출 (API 변경 반영)
      return this.extractFaceInfo(face, video.videoWidth, video.videoHeight);
    } catch (error) {
      console.error('얼굴 감지 오류:', error);
      return null;
    }
  }
  
  /**
   * 얼굴 정보 추출 (새로운 API 형식에 맞춰 수정)
   * @param face 감지된 얼굴
   * @param canvasWidth 캔버스 너비
   * @param canvasHeight 캔버스 높이
   * @returns 추출된 얼굴 정보
   */
  private extractFaceInfo(
    face: any, // any 타입으로 임시 처리 (타입 호환성 문제)
    canvasWidth: number, 
    canvasHeight: number
  ): FaceInfo {
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
    const minFaceWidth = canvasWidth * this.imageQuality.minFaceRatio;
    const maxFaceWidth = canvasWidth * this.imageQuality.maxFaceRatio;
    
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
    
    // 필요한 랜드마크 인덱스 찾기
    // MediaPipe 모델에서의 일반적인 인덱스
    const leftEyeIdx = 33; // 왼쪽 눈
    const rightEyeIdx = 263; // 오른쪽 눈
    const noseIdx = 1; // 코 끝
    
    // 안전하게 배열 범위 확인
    const leftEye = landmarksArray[leftEyeIdx] || [0, 0, 0];
    const rightEye = landmarksArray[rightEyeIdx] || [0, 0, 0];
    const nose = landmarksArray[noseIdx] || [0, 0, 0];
    
    // 각도 계산
    let angle: Angle = { yaw: 0, pitch: 0 };
    
    if (this.referencePoints) {
      // X축 변화로 Yaw(좌우) 각도 추정
      const eyeDistance = Math.sqrt(
        Math.pow(rightEye[0] - leftEye[0], 2) + 
        Math.pow(rightEye[1] - leftEye[1], 2)
      );
      
      const refEyeDistance = Math.sqrt(
        Math.pow(this.referencePoints.rightEye[0] - this.referencePoints.leftEye[0], 2) + 
        Math.pow(this.referencePoints.rightEye[1] - this.referencePoints.leftEye[1], 2)
      );
      
      const eyeCenter = [
        (leftEye[0] + rightEye[0]) / 2,
        (leftEye[1] + rightEye[1]) / 2
      ];
      
      const refEyeCenter = [
        (this.referencePoints.leftEye[0] + this.referencePoints.rightEye[0]) / 2,
        (this.referencePoints.leftEye[1] + this.referencePoints.rightEye[1]) / 2
      ];
      
      const xShift = refEyeDistance > 0 
        ? (eyeCenter[0] - refEyeCenter[0]) / refEyeDistance 
        : 0;
      angle.yaw = xShift * 90;  // 스케일링
      
      // Y축 변화로 Pitch(상하) 각도 추정
      const noseToEyeY = eyeCenter[1] - nose[1];
      const refNoseToEyeY = refEyeCenter[1] - this.referencePoints.nose[1];
      
      const yShift = refNoseToEyeY !== 0 
        ? (noseToEyeY - refNoseToEyeY) / refNoseToEyeY 
        : 0;
      angle.pitch = yShift * 90;  // 스케일링
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
      leftEye,
      rightEye,
      nose,
      angle
    };
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
    
    return yawDiff <= this.angleThreshold && pitchDiff <= this.angleThreshold;
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
    
    if (direction !== 'front' || this.referencePoints) {
      const targetAngle = this.targetAngles[direction];
      const yawDiff = faceInfo.angle.yaw - targetAngle.yaw;
      const pitchDiff = faceInfo.angle.pitch - targetAngle.pitch;
      
      if (Math.abs(yawDiff) > this.angleThreshold) {
        return yawDiff < 0
          ? '고개를 오른쪽으로 더 돌려주세요'
          : '고개를 왼쪽으로 더 돌려주세요';
      }
      
      if (Math.abs(pitchDiff) > this.angleThreshold) {
        return pitchDiff < 0
          ? '고개를 아래로 더 숙여주세요'
          : '고개를 위로 더 들어주세요';
      }
    }
    
    return '좋습니다! 유지해주세요...';
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
    // 화면 중앙 원 그리기
    ctx.strokeStyle = faceInfo.isPositionValid ? 'green' : 'red';
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
    
    // 얼굴 바운딩 박스 그리기
    ctx.strokeStyle = faceInfo.isSizeValid ? 'green' : 'red';
    ctx.lineWidth = 2;
    ctx.strokeRect(
      faceInfo.boundingBox.xMin,
      faceInfo.boundingBox.yMin,
      faceInfo.faceWidth,
      faceInfo.faceHeight
    );
    
    // 랜드마크 그리기 (눈, 코)
    ctx.fillStyle = 'blue';
    ctx.fillRect(faceInfo.leftEye[0] - 2, faceInfo.leftEye[1] - 2, 4, 4);
    ctx.fillRect(faceInfo.rightEye[0] - 2, faceInfo.rightEye[1] - 2, 4, 4);
    ctx.fillStyle = 'red';
    ctx.fillRect(faceInfo.nose[0] - 2, faceInfo.nose[1] - 2, 4, 4);
    
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
      ctx.fillStyle = 'green';
      ctx.fillRect(barX, barY, barWidth * progress, barHeight);
      
      // 텍스트
      ctx.fillStyle = 'white';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${Math.round(progress * 100)}%`, barX + barWidth / 2, barY + barHeight / 2);
    }
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
    if (this.detector) {
      try {
        // 모델 리소스 해제 (API가 지원하는 경우)
        if (typeof this.detector.dispose === 'function') {
          this.detector.dispose();
        }
        this.detector = null;
        
        // 참조 정보 초기화
        this.referencePoints = null;
        
      } catch (error) {
        console.error('모델 해제 오류:', error);
      }
    }
  }
}