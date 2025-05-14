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

    // 매장 세부 정보 API 테스트
    console.log('MSW 테스트: 매장 세부 정보 요청 시작...')
    const storeResponse = await fetch('/api/stores/1')
    const storeData = await storeResponse.json()
    console.log('MSW 테스트: 매장 세부 정보 응답', storeData)

    if (storeData.success && storeData.data.storeId === 1) {
      console.log('✅ MSW 테스트: 매장 세부 정보 모킹 성공!')
    } else {
      console.error('❌ MSW 테스트: 매장 세부 정보 모킹 실패')
    }

    console.log('🔶 모든 MSW 테스트 완료!')
    return true
  } catch (error) {
    console.error('❌ MSW 테스트 실패:', error)
    return false
  }
}
