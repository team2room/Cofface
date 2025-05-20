import tw from 'twin.macro'
import { Text } from '@/styles/typography'
import { usePayStore } from '@/stores/payStore'
import { useStepStore } from '@/stores/stepStore'

const Content = tw.div`flex flex-col items-center justify-center flex-1 gap-12 px-7`
const ImageButton = tw.button`
  w-[716px] h-[446px] rounded-[20px] bg-white shadow-[1px_3px_15px_5px_rgba(0,0,0,0.25)]
  flex flex-col items-center justify-center gap-3 
  hover:scale-105 transition-transform duration-200
`
const EmojiImage = tw.img`w-[328px] h-[328px]`

export default function PlaceSelectContent() {
  const { originStep, setStep } = useStepStore()
  const payStore = usePayStore()

  const handleSelect = (isTakeout: boolean) => {
    payStore.setIsTakeout(isTakeout)

    if (originStep === 'menu') {
      setStep('pay')
    } else if (originStep === 'main') {
      // 위에 다른 컴포넌트를 띄우게, 혹은 새로운 페이지로 이동 - 슬라이드 결제
      // setStep('main')
      // isMember면 자동 결제, 아니면 payPage로 이동 / 회원 카드 등록 여부 확인
    }
  }

  return (
    <Content>
      <div className="my-20">
        <Text variant="title1" weight="extrabold" color="lightBlack">
          어디에서 드실건가요?
        </Text>
      </div>

      <div className="flex flex-col gap-20 mb-60">
        <ImageButton onClick={() => handleSelect(false)}>
          <EmojiImage src="/매장.png" alt="매장" />
          <Text variant="title4" weight="extrabold" color="lightBlack">
            매장에서 먹고가기
          </Text>
        </ImageButton>

        <ImageButton onClick={() => handleSelect(true)}>
          <EmojiImage src="/포장.png" alt="포장" />
          <Text variant="title4" weight="extrabold" color="lightBlack">
            포장하기
          </Text>
        </ImageButton>
      </div>
    </Content>
  )
}
