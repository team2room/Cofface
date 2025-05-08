import * as mp from '@mediapipe/face_mesh';
import { FaceDetectionState, RotationState } from '../types';

// 얼굴이 원 안에 있는지 확인
export const checkFaceInCircle = (landmarks: mp.NormalizedLandmarkList): boolean => {
  // 얼굴 중심점 (코 끝 랜드마크 사용)
  const nose = landmarks[1];

  // 정규화된 중심점 (0~1 범위)
  const center = {
    x: 0.5, // 중앙
    y: 0.5, // 중앙
  };

  // 원의 반지름 (정규화된 값)
  const radius = 0.35;

  // 코와 중심 사이의 거리 계산
  const distance = Math.sqrt(
    Math.pow(nose.x - center.x, 2) + Math.pow(nose.y - center.y, 2)
  );

  // 거리, 반지름, 결과 로깅
  const result = distance < radius;
  console.log('원 위치 체크:', {
    distance: distance.toFixed(3),
    radius,
    result,
    noseX: nose.x.toFixed(3),
    noseY: nose.y.toFixed(3),
  });

  return result;
};

// 얼굴 회전 계산 함수 (정수값으로 반환)
export const calculateFaceRotation = (
  landmarks: mp.NormalizedLandmarkList
): RotationState => {
  // 주요 랜드마크 추출 (MediaPipe 인덱스)
  const noseTip = landmarks[1]; // 코끝
  const leftEye = landmarks[33]; // 왼쪽 눈
  const rightEye = landmarks[263]; // 오른쪽 눈
  const leftCheek = landmarks[93]; // 왼쪽 볼
  const rightCheek = landmarks[323]; // 오른쪽 볼
  const forehead = landmarks[10]; // 이마 중앙
  const chin = landmarks[152]; // 턱 하단

  // Roll 계산 (Z축 회전) - 눈 사이의 각도
  const deltaY = rightEye.y - leftEye.y;
  const deltaX = rightEye.x - leftEye.x;
  const roll = (Math.atan2(deltaY, deltaX) * 180) / Math.PI;

  // Pitch 계산 (X축 회전) - 이마-코-턱 관계
  const faceHeight = chin.y - forehead.y;
  const nosePosY = (noseTip.y - forehead.y) / faceHeight;

  let pitch = 0;
  if (nosePosY < 0.48) {
    // 위를 볼 때
    pitch = -((0.48 - nosePosY) * 100);
  } else if (nosePosY > 0.52) {
    // 아래를 볼 때
    pitch = (nosePosY - 0.52) * 100;
  }

  // Yaw 계산 (Y축 회전) - 코와 볼 사이의 관계
  const faceWidth = Math.abs(rightCheek.x - leftCheek.x);
  const nosePosX = (noseTip.x - leftCheek.x) / faceWidth;

  let yaw = 0;
  if (nosePosX < 0.48) {
    // 왼쪽을 볼 때
    yaw = (0.48 - nosePosX) * 100;
  } else if (nosePosX > 0.52) {
    // 오른쪽을 볼 때
    yaw = -((nosePosX - 0.52) * 100);
  }

  // 정수값으로 반환
  return {
    roll: Math.round(roll),
    pitch: Math.round(pitch),
    yaw: Math.round(yaw),
  };
};

// 현재 상태에 맞는 얼굴 방향인지 확인
export const isCorrectOrientation = (
  rotation: RotationState,
  state: FaceDetectionState
): boolean => {
  // 디버그 정보 출력
  console.log('방향 체크 상세 값:', {
    state: FaceDetectionState[state],
    roll: rotation.roll,
    pitch: rotation.pitch,
    yaw: rotation.yaw,
  });

  // INIT 상태일 때는 항상 false 반환
  if (state === FaceDetectionState.INIT) {
    console.log('INIT 상태에서는 항상 방향 부정확으로 처리');
    return false;
  }

  // 각 상태별 방향 체크 로직
  switch (state) {
    case FaceDetectionState.FRONT_FACE:
      // 정면: roll, pitch, yaw 모두 정해진 각도 이내
      const frontRollOK = Math.abs(rotation.roll) <= 20;
      const frontPitchOK = Math.abs(rotation.pitch) <= 6;
      const frontYawOK = Math.abs(rotation.yaw) <= 10;

      const frontResult = frontRollOK && frontPitchOK && frontYawOK;
      console.log('정면 방향 체크:', {
        result: frontResult,
        frontRollOK,
        frontPitchOK,
        frontYawOK,
      });
      return frontResult;

    case FaceDetectionState.LEFT_FACE:
      // 왼쪽: 특정 각도
      const leftRollOK = Math.abs(rotation.roll) <= 15;
      const leftPitchOK = Math.abs(rotation.pitch) <= 15;
      const leftYawOK = rotation.yaw <= -15 && rotation.yaw >= -35;

      const leftResult = leftRollOK && leftPitchOK && leftYawOK;
      console.log('왼쪽 방향 체크:', {
        result: leftResult,
        leftRollOK,
        leftPitchOK,
        leftYawOK,
      });
      return leftResult;

      case FaceDetectionState.RIGHT_FACE:
        // 오른쪽: yaw가 25~35도 (부호 수정)
        const rightRollOK = Math.abs(rotation.roll) <= 15;
        const rightPitchOK = Math.abs(rotation.pitch) <= 15;
        const rightYawOK = rotation.yaw >= 15 && rotation.yaw <= 35;

        const rightResult = rightRollOK && rightPitchOK && rightYawOK;
        console.log('오른쪽 방향 체크:', {
          result: rightResult,
          rightRollOK,
          rightPitchOK,
          rightYawOK,
        });
        return rightResult;

      case FaceDetectionState.UP_FACE:
        // 위: pitch가 -13~-9도
        const upRollOK = Math.abs(rotation.roll) <= 15;
        const upPitchOK = rotation.pitch <= -2 && rotation.pitch >= -7;
        const upYawOK = Math.abs(rotation.yaw) <= 15;

        const upResult = upRollOK && upPitchOK && upYawOK;
        console.log('위쪽 방향 체크:', {
          result: upResult,
          upRollOK,
          upPitchOK,
          upYawOK,
        });
        return upResult;

      case FaceDetectionState.DOWN_FACE:
        // 아래: pitch가 9~13도
        const downRollOK = Math.abs(rotation.roll) <= 15;
        const downPitchOK = rotation.pitch >= 9 && rotation.pitch <= 15;
        const downYawOK = Math.abs(rotation.yaw) <= 15;

        const downResult = downRollOK && downPitchOK && downYawOK;
        console.log('아래쪽 방향 체크:', {
          result: downResult,
          downRollOK,
          downPitchOK,
          downYawOK,
        });
        return downResult;

    default:
      return false;
  }
};