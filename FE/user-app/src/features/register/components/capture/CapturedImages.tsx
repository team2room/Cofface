import { CapturedImagesProps } from '@/interfaces/FaceRegisterInterfaces'
import { getStateLabel } from '@/utils/CaptureUtils'
import {
  CapturedImagesGrid,
  CapturedImageContainer,
  CapturedImageLabel,
  CapturedImg,
} from '@/features/register/components/capture/styles'

export default function CapturedImages({
  capturedImages,
}: CapturedImagesProps) {
  if (capturedImages.length === 0) return null

  return (
    <CapturedImagesGrid>
      {capturedImages.map((img, index) => (
        <CapturedImageContainer key={index}>
          <CapturedImg src={img.imageData} alt={`captured-${index}`} />
          <CapturedImageLabel>{getStateLabel(img.state)}</CapturedImageLabel>
        </CapturedImageContainer>
      ))}
    </CapturedImagesGrid>
  )
}
