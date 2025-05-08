import { FaceDetectionState } from '../types';

// 상태별 메시지
export const STATE_MESSAGES: Record<FaceDetectionState, string> = {
    [FaceDetectionState.INIT]: '얼굴 인식을 시작할게요',
    [FaceDetectionState.FRONT_FACE]: '정면을 바라봐주세요',
    [FaceDetectionState.LEFT_FACE]: '고개를 왼쪽으로 돌려주세요',
    [FaceDetectionState.RIGHT_FACE]: '고개를 오른쪽으로 돌려주세요',
    [FaceDetectionState.UP_FACE]: '고개를 들어 위를 바라봐주세요',
    [FaceDetectionState.DOWN_FACE]: '고개를 숙여 아래를 바라봐주세요',
    [FaceDetectionState.COMPLETED]: '얼굴 인식이 완료되었습니다!',
  };
  
  // 상태별 서브 메시지
  export const STATE_SUB_MESSAGES: Record<FaceDetectionState, string> = {
    [FaceDetectionState.INIT]: '',
    [FaceDetectionState.FRONT_FACE]: '얼굴이 원 안에 위치하도록 해주세요',
    [FaceDetectionState.LEFT_FACE]: '왼쪽으로 약 40도 정도 돌려주세요',
    [FaceDetectionState.RIGHT_FACE]: '오른쪽으로 약 30도 정도 돌려주세요',
    [FaceDetectionState.UP_FACE]: '위쪽으로 약 11도 정도 올려주세요',
    [FaceDetectionState.DOWN_FACE]: '아래쪽으로 약 11도 정도 내려주세요',
    [FaceDetectionState.COMPLETED]: '모든 방향에서 얼굴이 캡처되었습니다',
  };

// 경계선 색상 코드
export const BORDER_COLORS = {
  TIMER_ACTIVE: '#4285F4',  // 타이머 작동 중 (파란색)
  POSITION_CORRECT: '#00c853',  // 올바른 방향 (초록색)
  PARTIAL_CORRECT: '#FFAB00',  // 얼굴은 원 안에 있지만 방향이 맞지 않음 (주황색)
  WRONG_POSITION: '#FFC107',  // 얼굴이 원 밖에 있음 (노란색)
  NO_FACE: '#ff3d00',  // 얼굴 미감지 (빨간색)
};

// 타이머 설정값
export const TIMER_SETTINGS = {
  DURATION: 3000,  // 총 지속시간 (ms)
  INTERVAL: 50,    // 업데이트 간격 (ms)
};