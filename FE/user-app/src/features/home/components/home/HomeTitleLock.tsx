import { Text } from '@/styles/typography'
import tw from 'twin.macro'

const HomeTitle = tw.div`
  text-start
`
export function HomeTitleLock() {
  return (
    <HomeTitle>
      <Text variant="title3" weight="heavy" color="main" className="mr-1">
        COFFACE
      </Text>
      <Text variant="title3" weight="semibold">
        를<br />
        간편하게 사용하기 위해서
        <br />
        <br />
        먼저 얼굴, 결제 등록이 필요해요
      </Text>
    </HomeTitle>
  )
}
