import { Text } from '@/styles/typography'
import tw from 'twin.macro'

const ImageWrapper = tw.div`
  w-full my-8 flex justify-center items-center
`

const StyledImg = tw.img`
  w-[908px] h-[1224px] object-cover
`

const ButtonGroup = tw.div`
  flex justify-between w-10/12
`

const Button = tw.button`
  px-8 py-4 rounded-lg w-[397px] h-[234px] bg-[#FEFEFE] shadow-[1px_4px_10px_6px_rgba(0,0,0,0.10)]
`

export default function StartScreen() {
  return (
    <>
      <ImageWrapper>
        <StyledImg src="https://picsum.photos/200" alt="Spring Garden" />
      </ImageWrapper>
      <ButtonGroup>
        <Button>
          <Text variant="title4" weight="extrabold" color="main">
            ORDER.ME
          </Text>
          <br />
          <Text variant="title2" weight="bold">
            회원 주문
          </Text>
        </Button>
        <Button>
          <Text variant="title2" weight="bold">
            비회원 주문
          </Text>
        </Button>
      </ButtonGroup>
    </>
  )
}
