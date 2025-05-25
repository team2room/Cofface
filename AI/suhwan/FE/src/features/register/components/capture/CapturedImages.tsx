import { CapturedImagesProps } from '@/interfaces/RegisterInterfaces';
import { getStateLabel } from '@/utils/CaptureUtils';
import {
  CapturedImagesGrid,
  CapturedImageContainer,
  CapturedImageLabel,
  CapturedImg,
} from './styles';

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