import MenuCard from '@/components/MenuCard'
import tw from 'twin.macro'
import { Text } from '@/styles/typography'

const Container = tw.div`w-full mb-6`
const Section = tw.section`bg-pink-50 p-6 rounded-xl flex`
const Left = tw.div`w-1/2 flex flex-col justify-center items-start pr-4`
const Right = tw.div`w-1/2 grid grid-cols-2 gap-4`
const Title = tw.h2`text-lg font-bold mb-2`
const Grid = tw.div`grid grid-cols-2 gap-4`
const CustomSection = tw.section`bg-yellow-50 p-6 rounded-xl flex mt-4`
const CustomLeft = tw.div`w-1/2 flex flex-col justify-center items-start pr-4`
const CustomRight = tw.div`w-1/2 grid grid-cols-2 gap-4`

interface RecommendSectionProps {
  recentMenus: MenuItem[]
  customMenus: MenuItem[]
}

export interface MenuItem {
  name: string
  price: number
  image?: string
}

export default function RecommendSection({
  recentMenus,
  customMenus,
}: RecommendSectionProps) {
  return (
    <Container>
      <Section>
        <Right>
          {recentMenus.slice(0, 4).map((item, idx) => (
            <MenuCard key={`recent-${idx}`} item={item} />
          ))}
          {/* {recentMenus.map((item, idx) => (
            <MenuCard key={`recent-${idx}`} item={item} />
          ))} */}
        </Right>
        <Left>
          <Text variant="title4" weight="bold" className="mb-1">
            최근 주문 메뉴
          </Text>
          <Text variant="body2" className="text-darkGray">
            해당 매장에서 가장 최근에 주문한
            <br />
            메뉴 4개예요
          </Text>
        </Left>
      </Section>

      <CustomSection>
        <CustomLeft>
          <Text variant="title4" weight="bold" className="mb-1">
            고객 맞춤 메뉴
          </Text>
          <Text variant="body4" className="text-gray-500">
            모든 주문 내역으로
            <br />
            고객님이 선호하신 메뉴를 추천했어요
          </Text>
        </CustomLeft>
        <CustomRight>
          {/* {customMenus.slice(0, 4).map((item, idx) => (
            <MenuCard key={`custom-${idx}`} item={item} />
          ))} */}
          {customMenus.map((item, idx) => (
            <MenuCard key={`custom-${idx}`} item={item} />
          ))}
        </CustomRight>
      </CustomSection>
    </Container>
  )
}
