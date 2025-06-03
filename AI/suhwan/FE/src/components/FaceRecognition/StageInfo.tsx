// StageInfo.tsx
import React from 'react';
import { ColorGuideContainer } from './styles';
import { FaceDetectionState } from './types';

interface StageInfoProps {
  detectionState: FaceDetectionState;
}

const StageInfo: React.FC<StageInfoProps> = ({ detectionState }) => {
  return (
    <ColorGuideContainer>
      <h3 style={{ margin: '0 0 15px 0' }}>현재 촬영 단계</h3>

      <div style={{ marginBottom: '10px' }}>
        {detectionState === FaceDetectionState.INIT && '준비 중'}
        {detectionState === FaceDetectionState.FRONT_FACE &&
          '정면 촬영 중 (1/5)'}
        {detectionState === FaceDetectionState.LEFT_FACE &&
          '왼쪽 촬영 중 (2/5)'}
        {detectionState === FaceDetectionState.RIGHT_FACE &&
          '오른쪽 촬영 중 (3/5)'}
        {detectionState === FaceDetectionState.UP_FACE &&
          '위쪽 촬영 중 (4/5)'}
        {detectionState === FaceDetectionState.DOWN_FACE &&
          '아래쪽 촬영 중 (5/5)'}
        {detectionState === FaceDetectionState.COMPLETED && '촬영 완료'}
      </div>

      <div style={{ fontSize: '13px', color: '#aaa' }}>
        {detectionState !== FaceDetectionState.INIT &&
          detectionState !== FaceDetectionState.COMPLETED && (
            <>
              <p>- 원 안에 얼굴을 위치시킨 다음,</p>
              <p>- 안내에 따라 얼굴을 천천히 회전하세요</p>
              <p>- 경계선이 초록색으로 변하면 3초 후 자동 촬영됩니다</p>
            </>
          )}
      </div>
    </ColorGuideContainer>
  );
};

export default StageInfo;