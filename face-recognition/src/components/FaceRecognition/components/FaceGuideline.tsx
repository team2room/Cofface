import React from 'react';
import { FaceDetectionState } from '../types';
import { FaceGuideline as StyledFaceGuideline } from '../styles';

interface FaceGuidelineProps {
  detectionState: FaceDetectionState;
}

export const FaceGuideline: React.FC<FaceGuidelineProps> = ({ detectionState }) => {
  switch (detectionState) {
    case FaceDetectionState.FRONT_FACE:
      return (
        <StyledFaceGuideline>
          {/* 정면 안내 - 얼굴 윤곽 원과 십자선 */}
          <div
            style={{
              position: 'absolute',
              top: '15%',
              left: '50%',
              width: '70%',
              height: '70%',
              border: '2px dashed rgba(255, 255, 255, 0.6)',
              borderRadius: '50%',
              transform: 'translateX(-50%)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '10%',
              left: '50%',
              height: '80%',
              width: '2px',
              backgroundColor: 'rgba(255, 255, 255, 0.5)',
              transform: 'translateX(-50%)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '10%',
              width: '80%',
              height: '2px',
              backgroundColor: 'rgba(255, 255, 255, 0.5)',
              transform: 'translateY(-50%)',
            }}
          />
        </StyledFaceGuideline>
      );

    case FaceDetectionState.LEFT_FACE:
      return (
        <StyledFaceGuideline>
          {/* 왼쪽 회전 안내 */}
          <div
            style={{
              position: 'absolute',
              top: '15%',
              left: '50%',
              width: '70%',
              height: '70%',
              border: '2px dashed rgba(255, 255, 255, 0.6)',
              borderRadius: '50%',
              transform: 'translateX(-50%) rotateY(30deg)',
              perspective: '500px',
            }}
          />
          {/* 회전 방향 화살표 */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '25%',
              width: '25%',
              height: '2px',
              backgroundColor: 'white',
              transform: 'translateY(-50%)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '25%',
              width: '10px',
              height: '10px',
              borderTop: '2px solid white',
              borderLeft: '2px solid white',
              transform: 'translateY(-50%) rotate(-45deg)',
            }}
          />
        </StyledFaceGuideline>
      );

      case FaceDetectionState.RIGHT_FACE:
        return (
          <StyledFaceGuideline>
            {/* 오른쪽 회전 안내 */}
            <div
              style={{
                position: 'absolute',
                top: '15%',
                left: '50%',
                width: '70%',
                height: '70%',
                border: '2px dashed rgba(255, 255, 255, 0.6)',
                borderRadius: '50%',
                transform: 'translateX(-50%) rotateY(-30deg)',
                perspective: '500px',
              }}
            />

            {/* 회전 방향 화살표 */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                right: '25%',
                width: '25%',
                height: '2px',
                backgroundColor: 'white',
                transform: 'translateY(-50%)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '50%',
                right: '25%',
                width: '10px',
                height: '10px',
                borderTop: '2px solid white',
                borderRight: '2px solid white',
                transform: 'translateY(-50%) rotate(45deg)',
              }}
            />
          </StyledFaceGuideline>
        );

      case FaceDetectionState.UP_FACE:
        return (
          <StyledFaceGuideline>
            {/* 위쪽 회전 안내 */}
            <div
              style={{
                position: 'absolute',
                top: '15%',
                left: '50%',
                width: '70%',
                height: '70%',
                border: '2px dashed rgba(255, 255, 255, 0.6)',
                borderRadius: '50%',
                transform: 'translateX(-50%) rotateX(30deg)',
                perspective: '500px',
              }}
            />

            {/* 회전 방향 화살표 */}
            <div
              style={{
                position: 'absolute',
                top: '25%',
                left: '50%',
                height: '25%',
                width: '2px',
                backgroundColor: 'white',
                transform: 'translateX(-50%)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '25%',
                left: '50%',
                width: '10px',
                height: '10px',
                borderTop: '2px solid white',
                borderLeft: '2px solid white',
                transform: 'translateX(-50%) rotate(45deg)',
              }}
            />
          </StyledFaceGuideline>
        );

      case FaceDetectionState.DOWN_FACE:
        return (
          <StyledFaceGuideline>
            {/* 아래쪽 회전 안내 */}
            <div
              style={{
                position: 'absolute',
                top: '15%',
                left: '50%',
                width: '70%',
                height: '70%',
                border: '2px dashed rgba(255, 255, 255, 0.6)',
                borderRadius: '50%',
                transform: 'translateX(-50%) rotateX(-30deg)',
                perspective: '500px',
              }}
            />

            {/* 회전 방향 화살표 */}
            <div
              style={{
                position: 'absolute',
                bottom: '25%',
                left: '50%',
                height: '25%',
                width: '2px',
                backgroundColor: 'white',
                transform: 'translateX(-50%)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '25%',
                left: '50%',
                width: '10px',
                height: '10px',
                borderBottom: '2px solid white',
                borderLeft: '2px solid white',
                transform: 'translateX(-50%) rotate(-45deg)',
              }}
            />
          </StyledFaceGuideline>
        );
    
    default:
      return null;
  }
};