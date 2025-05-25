import { Text } from '@/styles/typography'

export default function MainTopSection() {
  return (
    <div className="flex flex-col gap-12">
      <div className="text-left">
        <Text fontFamily="Suite" variant="logo2" weight="heavy">
          주문, 결제
          <br />
          페이스로 한번에
        </Text>
      </div>
      <div>
        <Text weight="heavy" variant="logo1" color="main">
          ORDER.ME
        </Text>
      </div>
    </div>
  )
}
