import tw from 'twin.macro'
import { Text } from '@/styles/typography'

const Content = tw.div`flex flex-col items-center justify-center flex-1 gap-12`
const ImageButton = tw.button`
  w-[716px] h-[446px] rounded-[20px] bg-white shadow-[1px_3px_15px_5px_rgba(0,0,0,0.25)]
  flex flex-col items-center justify-center gap-3 
  hover:scale-105 transition-transform duration-200
`
const EmojiImage = tw.img`w-[328px] h-[328px]`

export default function PlaceSelectContent() {
  return (
    <Content>
      <div className="my-20">
        <Text variant="title1" weight="extrabold" color="lightBlack">
          어디에서 드실건가요?
        </Text>
      </div>

      <div className="flex flex-col gap-20 mb-60">
        <ImageButton>
          <EmojiImage src="/매장.png" alt="매장" />
          <Text variant="title4" weight="extrabold" color="lightBlack">
            매장에서 먹고가기
          </Text>
        </ImageButton>

        <ImageButton>
          <EmojiImage src="/포장.png" alt="포장" />
          <Text variant="title4" weight="extrabold" color="lightBlack">
            포장하기
          </Text>
        </ImageButton>
      </div>
    </Content>
  )
}
