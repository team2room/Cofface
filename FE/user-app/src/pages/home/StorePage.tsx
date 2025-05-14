import tw from 'twin.macro'
import DetailHeader from '@/components/DetailHeader'
import { useNavigate, useParams } from 'react-router-dom'
import WavyHeader from '@/components/WavyHeader'
import StampSection from '@/features/home/components/order/StampSection'
import TopOrdersSection from '@/features/home/components/order/TopOrdersSection'
import OrderHistorySection from '@/features/home/components/order/OrderHistorySection'
import { useEffect, useState } from 'react'
import {
  RecentOrderInfo,
  StampInfo,
  TopOrderMenuInfo,
} from '@/interfaces/StoreInterfaces'
import {
  getRecentOrders,
  getStampInfo,
  getTopOrders,
} from '@/features/home/services/storeService'
import LoadingMessage from '@/components/LoadingMessage'
import { useVisitedStoreStore } from '@/stores/visitedStoreStore'

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
  const { storeId } = useParams<{ storeId: string }>()
  const [cafeName, setCafeName] = useState('카페')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // visitedStoreStore에서 선택된 매장 정보 가져오기
  const { selectedStore } = useVisitedStoreStore()

  // 매장 데이터 상태
  const [stampInfo, setStampInfo] = useState<StampInfo | null>(null)
  const [topOrders, setTopOrders] = useState<TopOrderMenuInfo[]>([])
  const [recentOrders, setRecentOrders] = useState<RecentOrderInfo[]>([])

  useEffect(() => {
    const fetchStoreData = async () => {
      console.log('[StorePage] 매장 데이터 로딩 시작 - storeId:', storeId)

      if (!storeId) {
        console.error('[StorePage] 매장 ID가 없습니다.')
        setError('매장 정보를 찾을 수 없습니다.')
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        // 모든 API 요청을 병렬로 처리
        const storeIdNum = parseInt(storeId)
        console.log(`[StorePage] 매장 ${storeIdNum}의 데이터 요청 시작...`)

        // 선택된 매장 정보가 있으면 카페 이름 설정
        if (selectedStore && selectedStore.storeId === storeIdNum) {
          console.log(
            `[StorePage] 선택된 매장 정보 사용: ${selectedStore.storeName}`,
          )
          setCafeName(selectedStore.storeName)
        } else {
          // 선택된 매장 정보가 없거나 storeId와 일치하지 않으면 기본 값 사용
          console.log('[StorePage] 선택된 매장 정보 없음, 기본 이름 사용')
          setCafeName(`매장 ${storeIdNum}`)
        }

        const [stampData, topOrdersData, recentOrdersData] = await Promise.all([
          getStampInfo(storeIdNum),
          getTopOrders(storeIdNum),
          getRecentOrders(storeIdNum),
        ])

        console.log(`[StorePage] 매장 ${storeIdNum}의 데이터 요청 완료`)
        console.log(`[StorePage] 스탬프 정보:`, stampData)
        console.log(`[StorePage] 상위 주문:`, topOrdersData?.length || 0)
        console.log(`[StorePage] 최근 주문:`, recentOrdersData?.length || 0)

        setStampInfo(stampData)
        setTopOrders(topOrdersData)
        setRecentOrders(recentOrdersData)
      } catch (err) {
        console.error('[StorePage] 매장 데이터 로딩 중 오류 발생:', err)
        setError('매장 정보를 불러오는 중 오류가 발생했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchStoreData()
  }, [storeId, selectedStore])

  if (isLoading) {
    return <LoadingMessage />
  }

  if (error) {
    return (
      <Container>
        <HeaderWrapper>
          <DetailHeader
            title="오류"
            onBack={() => {
              navigate('/home')
            }}
          />
        </HeaderWrapper>
        <Content>
          <div className="flex justify-center items-center h-64">
            <p className="text-main font-bold">{error}</p>
          </div>
        </Content>
      </Container>
    )
  }

  return (
    <Container>
      <HeaderWrapper>
        <DetailHeader
          title={cafeName}
          onBack={() => {
            navigate('/home')
          }}
        />
        <WavyHeader />
      </HeaderWrapper>

      <Content>
        {stampInfo && <StampSection stampInfo={stampInfo} />}
        {topOrders && topOrders.length > 0 ? (
          <TopOrdersSection topOrders={topOrders} />
        ) : (
          <div className="py-4 flex justify-center mb-6">
            <p className="text-darkGray">주문 내역이 없습니다.</p>
          </div>
        )}
        {recentOrders && <OrderHistorySection recentOrders={recentOrders} />}
      </Content>
    </Container>
  )
}
