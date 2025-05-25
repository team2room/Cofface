// ColorGuide.tsx
import React from 'react';
import { ColorGuideContainer, ColorItem, ColorSwatch } from './styles';

const ColorGuide: React.FC = () => {
  return (
    <ColorGuideContainer>
      <h3 style={{ margin: '0 0 15px 0' }}>경계선 색상 의미</h3>

      <ColorItem>
        <ColorSwatch color='#ff3d00' />
        <div>
          <strong>빨간색</strong>: 얼굴 미감지
        </div>
      </ColorItem>

      <ColorItem>
        <ColorSwatch color='#FFC107' />
        <div>
          <strong>노란색</strong>: 얼굴이 원 밖에 위치함
        </div>
      </ColorItem>

      <ColorItem>
        <ColorSwatch color='#FFAB00' />
        <div>
          <strong>주황색</strong>: 얼굴은 원 안에 있으나
          <br />
          방향이 올바르지 않음
        </div>
      </ColorItem>

      <ColorItem>
        <ColorSwatch color='#00c853' />
        <div>
          <strong>초록색</strong>: 위치와 방향 모두 올바름
          <br />
          (촬영 준비됨)
        </div>
      </ColorItem>

      <ColorItem>
        <ColorSwatch color='#4285F4' />
        <div>
          <strong>파란색</strong>: 카운트다운 진행 중
        </div>
      </ColorItem>
    </ColorGuideContainer>
  );
};

export default ColorGuide;