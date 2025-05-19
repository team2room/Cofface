import { Text } from '@/styles/typography'
import logo from '@/assets/logo.png'

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
        <img src={logo} alt="logo" />
      </div>
    </div>
  )
}
