import tw from 'twin.macro'
import styled from '@emotion/styled'
import { colors } from '@/styles/colors'
import {
  FaceCircleProps,
  TimerCircleProps,
} from '@/interfaces/FaceRegisterInterfaces'

// 캡처 컨테이너 스타일
export const CaptureContainer = tw.div`
  flex flex-col items-center w-full flex-1 relative
`

// 메시지 스타일
export const Message = tw.div`
  text-center mb-2
`

// 카메라 뷰 스타일
export const FaceCircle = styled.div`
  ${tw`relative w-[280px] h-[280px] mb-6 rounded-full overflow-hidden mt-6`}
  border: 4px solid #333;
`

// 얼굴 가이드 타원형 - SVG 사용
export const FaceGuideCircle = styled.div<FaceCircleProps>`
  ${tw`absolute top-0 left-0 w-full h-full z-20 pointer-events-none`}

  &:after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 90%;
    height: 105%;
    transform: translate(-50%, -50%);
    border: 6px solid ${(props) => props.borderColor || '#333'};
    border-radius: 50% 50% 40% 40% / 60% 60% 40% 40%;
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.2);
  }
`

export const VideoContainer = tw.div`
  relative w-full h-full
`

export const Video = tw.video`
  absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto
  transform -translate-x-1/2 -translate-y-1/2 -scale-x-100
`

export const Canvas = tw.canvas`
  absolute top-0 left-0 w-full h-full
  transform -scale-x-100
`

export const GuideLine = tw.div`
  absolute top-0 left-0 w-full h-full z-10
`

// 타이머 관련 스타일
export const TimerDisplay = tw.div`
  absolute top-2.5 right-2.5 text-2xl font-bold text-white
  w-10 h-10 flex items-center justify-center z-30
`

export const TimerCircleContainer = tw.div`
  absolute top-0 left-0 w-full h-full z-10
  pointer-events-none
`

export const TimerCircleSVG = tw.svg`
  absolute top-0 left-0 w-full h-full
`

export const TimerCirclePath = styled.circle<TimerCircleProps>`
  ${tw`fill-none stroke-[6px] rounded-full`}
  stroke: ${(props) => props.color};
  stroke-dasharray: 1570;
  stroke-dashoffset: ${(props) => 1570 * (1 - props.progress)};
  transition: stroke-dashoffset 0.3s ease;
  filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.5));
`

// 가이드라인 스타일
export const FaceGuideline = tw.div`
  absolute w-full h-full top-0 left-0 z-10
  pointer-events-none
`

// 버튼 스타일
export const ActionButtonContainer = styled.button<{ secondary?: boolean }>`
  ${tw`w-full py-3 rounded-2xl text-base font-bold cursor-pointer`}
  ${(props) => (props.secondary ? tw`bg-transparent border mt-3` : tw`mt-3`)}
  background-color: ${(props) =>
    props.secondary ? 'transparent' : colors.main};
  color: white;
  border: ${(props) => (props.secondary ? `1px solid ${colors.main}` : 'none')};

  &:disabled {
    ${tw`opacity-50 cursor-not-allowed`}
    background-color: ${(props) => (props.secondary ? 'transparent' : '#666')};
  }
`

// 캡처된 이미지 스타일
export const CapturedImagesGrid = tw.div`
  flex flex-wrap justify-center gap-3 w-full
  mx-auto mb-6
`

export const CapturedImageContainer = styled.div`
  ${tw`relative w-[100px] h-[100px] rounded-xl overflow-hidden`}
  border: 2px solid ${colors.main};
`

export const CapturedImageLabel = tw.div`
  absolute bottom-0 left-0 right-0
  bg-black bg-opacity-70 text-white
  text-center py-1 text-xs
`

export const CapturedImg = tw.img`
  w-full h-full object-cover
`
