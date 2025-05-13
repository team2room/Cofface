import { HomeMainButtonProps } from '@/interfaces/HomeInterfaces'
import { Text } from '@/styles/typography'
import tw from 'twin.macro'

const ButtonWrapper = tw.div`
  flex-col justify-center bg-light rounded-lg w-full p-6 whitespace-pre-line
`

const ImgWrapper = tw.div`
  flex justify-end h-28 mt-4
`

export function HomeMainButton({
  title,
  content,
  src,
  onClick,
}: HomeMainButtonProps) {
  return (
    <ButtonWrapper onClick={onClick}>
      <Text variant="title3" weight="bold">
        {title}
      </Text>
      <br />
      <br />
      <Text variant="body1" weight="semibold">
        {content}
      </Text>
      <ImgWrapper>
        <img src={src} />
      </ImgWrapper>
    </ButtonWrapper>
  )
}
