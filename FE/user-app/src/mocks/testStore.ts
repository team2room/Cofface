/**
 * MSW 디버깅 파일
 * 이 파일에서는 MSW가 올바르게 설정되었는지 확인하는 테스트 함수를 제공합니다.
 */

export async function testMSW() {
  try {
    // 방문 매장 목록 API 테스트
    console.log('MSW 테스트: 방문 매장 목록 요청 시작...')
    const storesResponse = await fetch('/api/stores/visited')
    const storesData = await storesResponse.json()
    console.log('MSW 테스트: 방문 매장 목록 응답', storesData)

    if (storesData.success && Array.isArray(storesData.data)) {
      console.log('✅ MSW 테스트: 방문 매장 목록 모킹 성공!')
    } else {
      console.error('❌ MSW 테스트: 방문 매장 목록 모킹 실패')
    }

    // 스탬프 정보 API 테스트
    console.log('MSW 테스트: 스탬프 정보 요청 시작...')
    const stampResponse = await fetch('/api/stamps/store?storeId=1')
    const stampData = await stampResponse.json()
    console.log('MSW 테스트: 스탬프 정보 응답', stampData)

    if (stampData.success && stampData.data && stampData.data.stampId) {
      console.log('✅ MSW 테스트: 스탬프 정보 모킹 성공!')
    } else {
      console.error('❌ MSW 테스트: 스탬프 정보 모킹 실패')
    }

    // 상위 주문 메뉴 API 테스트
    console.log('MSW 테스트: 상위 주문 메뉴 요청 시작...')
    const topOrdersResponse = await fetch(
      '/api/user-orders/top-menus?storeId=1',
    )
    const topOrdersData = await topOrdersResponse.json()
    console.log('MSW 테스트: 상위 주문 메뉴 응답', topOrdersData)

    if (topOrdersData.success && Array.isArray(topOrdersData.data)) {
      console.log('✅ MSW 테스트: 상위 주문 메뉴 모킹 성공!')
    } else {
      console.error('❌ MSW 테스트: 상위 주문 메뉴 모킹 실패')
    }

    // 최근 주문 내역 API 테스트
    console.log('MSW 테스트: 최근 주문 내역 요청 시작...')
    const recentOrdersResponse = await fetch('/api/orders/recent?storeId=1')
    const recentOrdersData = await recentOrdersResponse.json()
    console.log('MSW 테스트: 최근 주문 내역 응답', recentOrdersData)

    if (recentOrdersData.success && Array.isArray(recentOrdersData.data)) {
      console.log('✅ MSW 테스트: 최근 주문 내역 모킹 성공!')
    } else {
      console.error('❌ MSW 테스트: 최근 주문 내역 모킹 실패')
    }

    console.log('🔶 모든 MSW 테스트 완료!')
    return true
  } catch (error) {
    console.error('❌ MSW 테스트 실패:', error)
    return false
  }
}
