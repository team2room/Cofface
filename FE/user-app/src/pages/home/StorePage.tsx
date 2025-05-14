import tw from 'twin.macro'
import DetailHeader from '@/components/DetailHeader'
import { useNavigate } from 'react-router-dom'
import WavyHeader from '@/components/WavyHeader'
import StampSection from '@/features/home/components/order/StampSection'
import TopOrdersSection from '@/features/home/components/order/TopOrdersSection'
import OrderHistorySection from '@/features/home/components/order/OrderHistorySection'

const HeaderWrapper = tw.div`
  sticky top-0 z-10 bg-white w-full
`
const Container = tw.div`
  w-full max-w-screen-sm mx-auto flex flex-col min-h-screen
`
const Content = tw.div`
  px-5 pt-8 pb-6 flex-1 bg-white
`

export function StorePage() {
  const navigate = useNavigate()
  const cafename = '하삼동 커피'

  return (
    <Container>
      <HeaderWrapper>
        <DetailHeader
          title={cafename}
          onBack={() => {
            navigate('/home')
          }}
        />
        <WavyHeader />
      </HeaderWrapper>

      <Content>
        <StampSection />
        <TopOrdersSection />
        <OrderHistorySection />
      </Content>
    </Container>
  )
}
