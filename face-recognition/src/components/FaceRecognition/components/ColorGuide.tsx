import React from 'react';
import { BORDER_COLORS } from '../utils/constants';
import { ColorGuide as StyledColorGuide, ColorItem, ColorSwatch } from '../styles';

export const ColorGuide: React.FC = () => {
  return (
    <StyledColorGuide>
      <h3 style={{ margin: '0 0 15px 0' }}>경계선 색상 의미</h3>

      <ColorItem>
        <ColorSwatch color={BORDER_COLORS.NO_FACE} />
        <div>
          <strong>빨간색</strong>: 얼굴 미감지
        </div>
      </ColorItem>

      <ColorItem>
        <ColorSwatch color={BORDER_COLORS.WRONG_POSITION} />
        <div>
          <strong>노란색</strong>: 얼굴이 원 밖에 위치함
        </div>
      </ColorItem>

      <ColorItem>
        <ColorSwatch color={BORDER_COLORS.PARTIAL_CORRECT} />
        <div>
          <strong>주황색</strong>: 얼굴은 원 안에 있으나
          <br />
          방향이 올바르지 않음
        </div>
      </ColorItem>

      <ColorItem>
        <ColorSwatch color={BORDER_COLORS.POSITION_CORRECT} />
        <div>
          <strong>초록색</strong>: 위치와 방향 모두 올바름
          <br />
          (촬영 준비됨)
        </div>
      </ColorItem>

      <ColorItem>
        <ColorSwatch color={BORDER_COLORS.TIMER_ACTIVE} />
        <div>
          <strong>파란색</strong>: 카운트다운 진행 중
        </div>
      </ColorItem>
    </StyledColorGuide>
  );
};