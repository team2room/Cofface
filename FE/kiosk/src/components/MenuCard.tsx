import { MenuItem } from '@/features/order/components/RecommendSection'
import tw from 'twin.macro'
import { Text } from '@/styles/typography'

const Container = tw.div`w-56 h-72 px-4 py-3 rounded-xl bg-white grid justify-items-center`
const Image = tw.img`w-32 h-32 object-cover`
const Divider = tw.hr`w-full h-px my-2 bg-gray border-0`

export default function MenuCard({ item }: { item: MenuItem }) {
  return (
    <Container
      style={{
        boxShadow: '1.462px 1.462px 4px 2px #FDCBC4',
      }}
    >
      {item.image ? (
        <Image src={item.image} alt={item.name} />
      ) : (
        <Image src="https://picsum.photos/200" alt="없음" />
      )}
      <Divider />
      <Text
        variant="caption1"
        className="flex items-center justify-center text-center mb-2 h-16"
      >
        {item.name}
      </Text>
      <Text variant="body4" weight="semibold">
        {item.price.toLocaleString()}원
      </Text>
    </Container>
  )
}
