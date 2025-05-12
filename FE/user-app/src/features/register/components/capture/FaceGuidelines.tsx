import { FaceDetectionState } from '@/interfaces/RegisterInterfaces'
import { FaceGuideline } from '@/features/register/components/capture/styles'

interface FaceGuidelinesProps {
  detectionState: FaceDetectionState
}

// 타원형 SVG 패스 컴포넌트
const OvalPath = ({ rotate = '' }) => (
  <div
    style={{
      position: 'absolute',
      top: '15%',
      left: '50%',
      width: '70%',
      height: '70%',
      border: '3px dashed rgba(255, 255, 255, 0.7)',
      borderRadius: '50% 50% 40% 40% / 60% 60% 40% 40%',
      transform: `translateX(-50%) ${rotate}`,
      perspective: '500px',
    }}
  />
)

export function FaceGuidelines({ detectionState }: FaceGuidelinesProps) {
  switch (detectionState) {
    case FaceDetectionState.FRONT_FACE:
      return (
        <FaceGuideline>
          <OvalPath />
          {/* 정면 안내 - 얼굴 윤곽 원과 십자선 */}
          {/* <div
            style={{
              position: 'absolute',
              top: '15%',
              left: '50%',
              width: '70%',
              height: '70%',
              border: '3px dashed rgba(255, 255, 255, 0.7)',
              borderRadius: '50%',
              transform: 'translateX(-50%)',
            }}
          /> */}
        </FaceGuideline>
      )

    case FaceDetectionState.LEFT_FACE:
      return (
        <FaceGuideline>
          {/* 왼쪽 회전 안내 */}
          <OvalPath rotate="rotateY(30deg)" />
          {/* <div
            style={{
              position: 'absolute',
              top: '15%',
              left: '50%',
              width: '70%',
              height: '70%',
              border: '3px dashed rgba(255, 255, 255, 0.7)',
              borderRadius: '50%',
              transform: 'translateX(-50%) rotateY(30deg)',
              perspective: '500px',
            }}
          /> */}

          {/* 회전 방향 화살표 */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              right: '25%',
              width: '25%',
              height: '4px',
              backgroundColor: 'white',
              transform: 'translateY(-50%)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '50%',
              right: '25%',
              width: '14px',
              height: '14px',
              borderTop: '4px solid white',
              borderRight: '4px solid white',
              transform: 'translateY(-50%) rotate(45deg)',
            }}
          />
        </FaceGuideline>
      )

    case FaceDetectionState.RIGHT_FACE:
      return (
        <FaceGuideline>
          {/* 오른쪽 회전 안내 */}
          <OvalPath rotate="rotateY(-30deg)" />
          {/* <div
            style={{
              position: 'absolute',
              top: '15%',
              left: '50%',
              width: '70%',
              height: '70%',
              border: '3px dashed rgba(255, 255, 255, 0.7)',
              borderRadius: '50%',
              transform: 'translateX(-50%) rotateY(-30deg)',
              perspective: '500px',
            }}
          /> */}

          {/* 회전 방향 화살표 */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '25%',
              width: '25%',
              height: '4px',
              backgroundColor: 'white',
              transform: 'translateY(-50%)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '25%',
              width: '14px',
              height: '14px',
              borderTop: '4px solid white',
              borderLeft: '4px solid white',
              transform: 'translateY(-50%) rotate(-45deg)',
            }}
          />
        </FaceGuideline>
      )

    case FaceDetectionState.UP_FACE:
      return (
        <FaceGuideline>
          {/* 위쪽 회전 안내 */}
          <OvalPath rotate="rotateX(30deg)" />
          {/* <div
            style={{
              position: 'absolute',
              top: '15%',
              left: '50%',
              width: '70%',
              height: '70%',
              border: '3px dashed rgba(255, 255, 255, 0.7)',
              borderRadius: '50%',
              transform: 'translateX(-50%) rotateX(30deg)',
              perspective: '500px',
            }}
          /> */}

          {/* 회전 방향 화살표 */}
          <div
            style={{
              position: 'absolute',
              top: '25%',
              left: '50%',
              height: '25%',
              width: '4px',
              backgroundColor: 'white',
              transform: 'translateX(-50%)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '25%',
              left: '50%',
              width: '14px',
              height: '14px',
              borderTop: '4px solid white',
              borderLeft: '4px solid white',
              transform: 'translateX(-50%) rotate(45deg)',
            }}
          />
        </FaceGuideline>
      )

    case FaceDetectionState.DOWN_FACE:
      return (
        <FaceGuideline>
          {/* 아래쪽 회전 안내 */}
          <OvalPath rotate="rotateX(-30deg)" />
          {/* <div
            style={{
              position: 'absolute',
              top: '15%',
              left: '50%',
              width: '70%',
              height: '70%',
              border: '3px dashed rgba(255, 255, 255, 0.7)',
              borderRadius: '50%',
              transform: 'translateX(-50%) rotateX(-30deg)',
              perspective: '500px',
            }}
          /> */}

          {/* 회전 방향 화살표 */}
          <div
            style={{
              position: 'absolute',
              bottom: '25%',
              left: '50%',
              height: '25%',
              width: '4px',
              backgroundColor: 'white',
              transform: 'translateX(-50%)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '25%',
              left: '50%',
              width: '14px',
              height: '14px',
              borderBottom: '4px solid white',
              borderLeft: '4px solid white',
              transform: 'translateX(-50%) rotate(-45deg)',
            }}
          />
        </FaceGuideline>
      )

    default:
      return null
  }
}
