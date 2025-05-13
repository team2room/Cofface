import { FaceRegisterMainButtonProps } from '@/interfaces/FaceRegisterInterfaces'
import { Text } from '@/styles/typography'
import tw from 'twin.macro'

const ButtonWrapper = tw.div`
  flex-col justify-center rounded-lg w-full p-6 whitespace-pre-line bg-light
`

const ImgWrapper = tw.div`
  flex justify-center h-20 mt-6
`

export function FaceRegisterMainButton({
  content,
  src,
  onClick,
}: FaceRegisterMainButtonProps) {
  return (
    <ButtonWrapper onClick={onClick}>
      <Text variant="body1" weight="semibold">
        {content}
      </Text>
      <ImgWrapper>
        <img src={src} />
      </ImgWrapper>
    </ButtonWrapper>
  )
}
