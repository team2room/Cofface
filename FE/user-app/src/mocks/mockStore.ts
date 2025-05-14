import { VisitedStoreInfo } from '@/interfaces/HomeInterfaces'
import { http, HttpResponse } from 'msw'
import { setupWorker } from 'msw/browser'

// StoreDetails 인터페이스 정의
// interface StoreDetails extends VisitedStoreInfo {
//   menu: MenuItem[]
//   topOrders: TopOrder[]
//   stampCount: number
// }

// interface MenuItem {
//   id: number
//   name: string
//   price: number
//   imageUrl: string
// }

// interface TopOrder {
//   id: number
//   name: string
//   count: number
// }

// 방문 매장 목록 모킹 데이터
const mockVisitedStores: VisitedStoreInfo[] = [
  {
    storeId: 1,
    storeName: '오더미 부산점',
    address: '부산광역시 강서구 녹산산업중로 333',
    contactNumber: '031-210-5114',
    businessHours: '09:00-22:00',
    visitCount: 2,
    lastVisitDate: '2025-05-12T23:49:25',
  },
  {
    storeId: 2,
    storeName: '오더미 서울점',
    address: '서울특별시 강남구 테헤란로 212',
    contactNumber: '02-3429-5114',
    businessHours: '08:00-23:00',
    visitCount: 15,
    lastVisitDate: '2025-05-13T01:05:56',
  },
  {
    storeId: 3,
    storeName: '오더미 대구점',
    address: '대구광역시 중구 동성로 123',
    contactNumber: '053-123-4567',
    businessHours: '10:00-21:00',
    visitCount: 8,
    lastVisitDate: '2025-05-10T14:30:20',
  },
  {
    storeId: 4,
    storeName: '오더미 인천점',
    address: '인천광역시 연수구 송도동 123',
    contactNumber: '032-987-6543',
    businessHours: '09:30-22:30',
    visitCount: 22,
    lastVisitDate: '2025-05-09T18:15:10',
  },
  {
    storeId: 5,
    storeName: '오더미 제주점',
    address: '제주특별자치도 제주시 노형동 456',
    contactNumber: '064-345-6789',
    businessHours: '08:30-21:30',
    visitCount: 28,
    lastVisitDate: '2025-05-08T11:45:30',
  },
]

// 매장 세부 정보 생성 함수
// const getStoreDetails = (storeId: string | number): StoreDetails | null => {
//   const numericStoreId =
//     typeof storeId === 'string' ? parseInt(storeId, 10) : storeId
//   const store = mockVisitedStores.find((s) => s.storeId === numericStoreId)
//   if (!store) return null

//   return {
//     ...store,
//     menu: [
//       { id: 1, name: '아메리카노', price: 4500, imageUrl: '' },
//       { id: 2, name: '카페라떼', price: 5000, imageUrl: '' },
//       { id: 3, name: '바닐라라떼', price: 5500, imageUrl: '' },
//     ],
//     topOrders: [
//       { id: 1, name: '아메리카노', count: 5 },
//       { id: 2, name: '카페라떼', count: 3 },
//     ],
//     stampCount: 7,
//   }
// }

// API 응답 타입 정의
interface ApiResponse<T> {
  status: number
  success: boolean
  message: string
  data: T
}

// API 요청을 가로채서 모킹 응답을 반환하는 핸들러 정의
export const handlers = [
  // 방문 매장 목록 조회 API
  http.get('/api/stores/visited', async () => {
    console.log('MSW: 방문 매장 목록 요청 가로챔')

    // 500ms 지연
    await new Promise((resolve) => setTimeout(resolve, 500))

    return HttpResponse.json<ApiResponse<VisitedStoreInfo[]>>(
      {
        status: 200,
        success: true,
        message: '요청이 성공했습니다.',
        data: mockVisitedStores,
      },
      { status: 200 },
    )
  }),

  // 매장 세부 정보 조회 API
  // http.get(
  //   `${import.meta.env.VITE_API_BASE_URL || '/api'}/stores/:storeId`,
  //   async ({ params }) => {
  //     const storeId = params.storeId as string
  //     console.log(`MSW: 매장 세부 정보 요청 가로챔 - ID: ${storeId}`)

  //     const storeDetails = getStoreDetails(storeId)

  //     // 500ms 지연
  //     await new Promise((resolve) => setTimeout(resolve, 500))

  //     if (!storeDetails) {
  //       return HttpResponse.json<ApiResponse<null>>(
  //         {
  //           status: 404,
  //           success: false,
  //           message: '매장을 찾을 수 없습니다.',
  //           data: null,
  //         },
  //         { status: 404 },
  //       )
  //     }

  //     return HttpResponse.json<ApiResponse<StoreDetails>>(
  //       {
  //         status: 200,
  //         success: true,
  //         message: '요청이 성공했습니다.',
  //         data: storeDetails,
  //       },
  //       { status: 200 },
  //     )
  //   },
  // ),
]

// 서비스 워커 생성
export const worker = setupWorker(...handlers)

// 서비스 워커 시작 함수 (Promise 반환)
export async function startMSW(): Promise<void> {
  // 개발 환경에서만 MSW 시작
  if (process.env.NODE_ENV === 'development') {
    try {
      // onUnhandledRequest 옵션을 추가하여 모든 요청 로깅
      await worker.start({
        onUnhandledRequest: 'warn', // 가로채지 않은 요청에 대해 경고
        serviceWorker: {
          url: '/mockServiceWorker.js', // 서비스 워커 파일 경로 명시적 지정
        },
      })
      console.log('🔶 Mock Service Worker 활성화됨')
      return Promise.resolve()
    } catch (error) {
      console.error('MSW 시작 실패:', error)
      return Promise.reject(error)
    }
  }
  return Promise.resolve()
}
