import MenuCard from '@/features/order/components/Menu/MenuCard'
import tw from 'twin.macro'
import { Text } from '@/styles/typography'
import { RecommendSectionProps } from '@/interfaces/OrderInterface'

const Container = tw.div`w-full`
const UpSection = tw.section`min-h-[620px] bg-[#FFF1EF] px-16 py-5 rounded-xl flex`
const UpLeft = tw.div`grid grid-cols-2 gap-4`
const UpRight = tw.div`flex flex-col justify-start items-start p-12`
const DownSection = tw.section`min-h-[620px] bg-[#FFF8EC] px-16 py-5 rounded-xl flex mt-4`
const DownLeft = tw.div`w-1/2 flex flex-col justify-start items-end text-end p-12`
const DownRight = tw.div`grid grid-cols-2 gap-4`

export default function RecommendSection({
  recentMenus,
  customMenus,
}: RecommendSectionProps) {
  return (
    <Container>
      <UpSection>
        <UpLeft>
          {recentMenus.slice(0, 4).map((item, idx) => (
            <MenuCard
              key={`recent-${idx}`}
              item={item}
              boxShadowColor={'#FDCBC4'}
            />
          ))}
        </UpLeft>
        <UpRight>
          <Text variant="title4" weight="bold" className="mb-1">
            최근 주문 메뉴
          </Text>
          <Text variant="body3" weight="bold" className="text-darkGray">
            해당 매장에서
            <br />
            가장 최근에 주문한
            <br />
            메뉴 4개에요
          </Text>
        </UpRight>
      </UpSection>

      <DownSection>
        <DownLeft>
          <Text variant="title4" weight="bold" className="mb-1">
            고객 맞춤 메뉴
          </Text>
          <Text variant="body3" weight="bold" className="text-darkGray">
            모든 주문 내역으로
            <br />
            고객님이 선호하실만한
            <br />
            메뉴를 추천했어요
          </Text>
        </DownLeft>
        <DownRight>
          {customMenus.map((item, idx) => (
            <MenuCard
              key={`custom-${idx}`}
              item={item}
              boxShadowColor={'#F9E6C5'}
            />
          ))}
        </DownRight>
      </DownSection>
    </Container>
  )
}
