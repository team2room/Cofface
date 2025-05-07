import { Text } from '@/styles/typography'
import tw from 'twin.macro'

const HomeTitle = tw.div`
  text-start
`
export function HomeTitleUnlock() {
  return (
    <HomeTitle>
      <Text variant="title3" weight="bold">
        방문했던 카페를 확인해봐요
        <br />
        <br />
        주문 내역, 적립 현황까지
        <br />한 눈에 볼 수 있어요
      </Text>
    </HomeTitle>
  )
}
