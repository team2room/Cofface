// CapturedImages.tsx
import React from 'react';
import { 
  CapturedImagesGrid, 
  CapturedImageContainer, 
  CapturedImageLabel, 
  CapturedImg 
} from './styles';
import { CapturedImage, FaceDetectionState } from './types';
import { getStateLabel } from './utils';

interface CapturedImagesProps {
  capturedImages: CapturedImage[];
}

const CapturedImages: React.FC<CapturedImagesProps> = ({ capturedImages }) => {
  if (capturedImages.length === 0) return null;

  return (
    <CapturedImagesGrid>
      {capturedImages.map((img, index) => (
        <CapturedImageContainer key={index}>
          <CapturedImg src={img.imageData} alt={`captured-${index}`} />
          <CapturedImageLabel>{getStateLabel(img.state)}</CapturedImageLabel>
        </CapturedImageContainer>
      ))}
    </CapturedImagesGrid>
  );
};

export default CapturedImages;