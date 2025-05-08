import React from 'react';
import { FaceDetectionState, CapturedImage } from '../types';
import {
  CapturedImagesGrid as StyledCapturedImagesGrid,
  CapturedImageContainer,
  CapturedImageLabel,
  CapturedImg
} from '../styles';

interface CapturedImagesGridProps {
  images: CapturedImage[];
}

export const CapturedImagesGrid: React.FC<CapturedImagesGridProps> = ({ images }) => {
  if (images.length === 0) return null;

  const getStateLabel = (state: FaceDetectionState): string => {
    switch (state) {
      case FaceDetectionState.FRONT_FACE:
        return '정면';
      case FaceDetectionState.LEFT_FACE:
        return '좌측';
      case FaceDetectionState.RIGHT_FACE:
        return '우측';
      case FaceDetectionState.UP_FACE:
        return '위';
      case FaceDetectionState.DOWN_FACE:
        return '아래';
      default:
        return '';
    }
  };

  return (
    <StyledCapturedImagesGrid>
      {images.map((img, index) => (
        <CapturedImageContainer key={index}>
          <CapturedImg src={img.imageData} alt={`captured-${index}`} />
          <CapturedImageLabel>{getStateLabel(img.state)}</CapturedImageLabel>
        </CapturedImageContainer>
      ))}
    </StyledCapturedImagesGrid>
  );
};