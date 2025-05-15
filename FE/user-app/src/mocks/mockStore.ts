import { VisitedStoreInfo } from '@/interfaces/HomeInterfaces'
import {
  RecentOrderInfo,
  StampInfo,
  TopOrderMenuInfo,
} from '@/interfaces/StoreInterfaces'
import { http, HttpResponse } from 'msw'
import { setupWorker } from 'msw/browser'

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

// 스탬프 정보 모킹 데이터
const mockStampInfos: Record<number, StampInfo> = {
  1: {
    stampId: 1001,
    storeId: 1,
    stampCount: 8,
    lastOrderId: 5001,
    stampsRequired: 10,
    discountAmount: 4000,
    couponCount: 0,
    remainingStamps: 2,
  },
  2: {
    stampId: 1002,
    storeId: 2,
    stampCount: 10,
    lastOrderId: 5002,
    stampsRequired: 10,
    discountAmount: 4000,
    couponCount: 1,
    remainingStamps: 0,
  },
  3: {
    stampId: 1003,
    storeId: 3,
    stampCount: 5,
    lastOrderId: 5003,
    stampsRequired: 10,
    discountAmount: 4000,
    couponCount: 0,
    remainingStamps: 5,
  },
  4: {
    stampId: 1004,
    storeId: 4,
    stampCount: 2,
    lastOrderId: 5004,
    stampsRequired: 10,
    discountAmount: 4000,
    couponCount: 0,
    remainingStamps: 8,
  },
  5: {
    stampId: 1005,
    storeId: 5,
    stampCount: 9,
    lastOrderId: 5005,
    stampsRequired: 10,
    discountAmount: 4000,
    couponCount: 0,
    remainingStamps: 1,
  },
}

// 상위 주문 메뉴 모킹 데이터
const mockTopOrders: Record<number, TopOrderMenuInfo[]> = {
  1: [
    {
      menuId: 1,
      menuName: '아이스 아메리카노',
      totalCount: 10,
      totalOrders: 8,
    },
    { menuId: 2, menuName: '아이스 카페라떼', totalCount: 5, totalOrders: 4 },
    { menuId: 3, menuName: '아이스티 샷추가', totalCount: 3, totalOrders: 3 },
    { menuId: 4, menuName: '페퍼민트티 샷추가', totalCount: 1, totalOrders: 1 },
    { menuId: 5, menuName: '버터크림라떼', totalCount: 1, totalOrders: 1 },
  ],
  2: [
    { menuId: 6, menuName: '바닐라 라떼', totalCount: 12, totalOrders: 9 },
    { menuId: 7, menuName: '카푸치노', totalCount: 7, totalOrders: 6 },
    { menuId: 8, menuName: '아이스 초코', totalCount: 4, totalOrders: 4 },
    { menuId: 9, menuName: '녹차 프라페', totalCount: 2, totalOrders: 2 },
    { menuId: 10, menuName: '딸기 스무디', totalCount: 1, totalOrders: 1 },
  ],
  3: [
    { menuId: 11, menuName: '카라멜 마끼아또', totalCount: 8, totalOrders: 6 },
    { menuId: 12, menuName: '더블 에스프레소', totalCount: 6, totalOrders: 5 },
    { menuId: 13, menuName: '아포가토', totalCount: 3, totalOrders: 3 },
    {
      menuId: 14,
      menuName: '에스프레소 콘파냐',
      totalCount: 2,
      totalOrders: 2,
    },
    { menuId: 15, menuName: '말차 라떼', totalCount: 1, totalOrders: 1 },
  ],
  4: [
    { menuId: 16, menuName: '콜드브루', totalCount: 15, totalOrders: 10 },
    { menuId: 17, menuName: '니트로 콜드브루', totalCount: 9, totalOrders: 8 },
    { menuId: 18, menuName: '바닐라 콜드브루', totalCount: 6, totalOrders: 5 },
    { menuId: 19, menuName: '돌체 콜드브루', totalCount: 3, totalOrders: 3 },
    { menuId: 20, menuName: '콜드브루 플로트', totalCount: 2, totalOrders: 2 },
  ],
  5: [
    { menuId: 21, menuName: '아이스 밀크티', totalCount: 14, totalOrders: 12 },
    { menuId: 22, menuName: '타로 밀크티', totalCount: 8, totalOrders: 7 },
    { menuId: 23, menuName: '흑당 버블티', totalCount: 5, totalOrders: 4 },
    { menuId: 24, menuName: '망고 스무디', totalCount: 3, totalOrders: 3 },
    { menuId: 25, menuName: '코코넛 라떼', totalCount: 1, totalOrders: 1 },
  ],
}

// 최근 주문 내역 모킹 데이터
const mockRecentOrders: Record<number, RecentOrderInfo[]> = {
  1: [
    {
      orderId: 10001,
      userId: 'user123',
      kioskId: 101,
      totalAmount: 12800,
      orderDate: '2025-05-12T15:30:00',
      isStampUsed: false,
      orderStatus: '완료',
      isTakeout: true,
      orderSummary: '아이스 아메리카노 외 1종',
    },
    {
      orderId: 10002,
      userId: 'user123',
      kioskId: 101,
      totalAmount: 9500,
      orderDate: '2025-05-01T10:15:00',
      isStampUsed: false,
      orderStatus: '완료',
      isTakeout: false,
      orderSummary: '아이스 카페라떼 외 2종',
    },
  ],
  2: [
    {
      orderId: 10003,
      userId: 'user123',
      kioskId: 102,
      totalAmount: 15000,
      orderDate: '2025-05-13T09:45:00',
      isStampUsed: true,
      orderStatus: '완료',
      isTakeout: true,
      orderSummary: '바닐라 라떼 외 2종',
    },
    {
      orderId: 10004,
      userId: 'user123',
      kioskId: 102,
      totalAmount: 7500,
      orderDate: '2025-04-28T16:20:00',
      isStampUsed: false,
      orderStatus: '완료',
      isTakeout: false,
      orderSummary: '카푸치노 1종',
    },
    {
      orderId: 10005,
      userId: 'user123',
      kioskId: 102,
      totalAmount: 10500,
      orderDate: '2025-04-20T14:30:00',
      isStampUsed: false,
      orderStatus: '완료',
      isTakeout: true,
      orderSummary: '아이스 초코 외 1종',
    },
  ],
  3: [
    {
      orderId: 10006,
      userId: 'user123',
      kioskId: 103,
      totalAmount: 14000,
      orderDate: '2025-05-10T11:30:00',
      isStampUsed: false,
      orderStatus: '완료',
      isTakeout: true,
      orderSummary: '카라멜 마끼아또 외 1종',
    },
  ],
  4: [
    {
      orderId: 10007,
      userId: 'user123',
      kioskId: 104,
      totalAmount: 18000,
      orderDate: '2025-05-09T13:15:00',
      isStampUsed: false,
      orderStatus: '완료',
      isTakeout: false,
      orderSummary: '콜드브루 외 3종',
    },
    {
      orderId: 10008,
      userId: 'user123',
      kioskId: 104,
      totalAmount: 8500,
      orderDate: '2025-04-25T17:45:00',
      isStampUsed: false,
      orderStatus: '완료',
      isTakeout: true,
      orderSummary: '니트로 콜드브루 1종',
    },
  ],
  5: [
    {
      orderId: 10009,
      userId: 'user123',
      kioskId: 105,
      totalAmount: 16500,
      orderDate: '2025-05-08T10:00:00',
      isStampUsed: false,
      orderStatus: '완료',
      isTakeout: false,
      orderSummary: '아이스 밀크티 외 2종',
    },
    {
      orderId: 10010,
      userId: 'user123',
      kioskId: 105,
      totalAmount: 13000,
      orderDate: '2025-04-22T15:30:00',
      isStampUsed: true,
      orderStatus: '완료',
      isTakeout: true,
      orderSummary: '타로 밀크티 외 1종',
    },
  ],
}

// API 요청을 가로채서 모킹 응답을 반환하는 핸들러 정의
export const handlers = [
  // 방문 매장 목록 조회 API
  http.get('/api/stores/visited', async () => {
    console.log('[MSW] 방문 매장 목록 요청 가로챔')

    // 500ms 지연
    await new Promise((resolve) => setTimeout(resolve, 500))

    // 단일 data 구조로 응답
    return HttpResponse.json({
      status: 200,
      success: true,
      message: '요청이 성공했습니다.',
      data: mockVisitedStores,
    })
  }),

  // 스탬프 정보 조회 API
  http.get('/api/stamps/store', async ({ request }) => {
    const url = new URL(request.url)
    const storeId = parseInt(url.searchParams.get('storeId') || '0')

    console.log(`[MSW] 스탬프 정보 요청 가로챔 - 매장 ID: ${storeId}`)

    // 존재하는 매장 ID인지 확인
    if (!storeId || !mockStampInfos[storeId]) {
      // 404 에러 응답 (단일 data 구조)
      return HttpResponse.json({
        status: 404,
        success: false,
        message: '스탬프 정보를 찾을 수 없습니다.',
        data: null,
      })
    }

    // 성공 응답 (단일 data 구조)
    return HttpResponse.json({
      status: 200,
      success: true,
      message: '요청이 성공했습니다.',
      data: mockStampInfos[storeId],
    })
  }),

  // 상위 주문 메뉴 조회 API
  http.get('/api/user-orders/top-menus', async ({ request }) => {
    const url = new URL(request.url)
    const storeId = parseInt(url.searchParams.get('storeId') || '0')

    console.log(`[MSW] 상위 주문 메뉴 요청 가로챔 - 매장 ID: ${storeId}`)

    // ID가 없거나 해당 매장 정보가 없는 경우 빈 배열 반환 (이중 data 구조)
    if (!storeId || !mockTopOrders[storeId]) {
      return HttpResponse.json({
        status: 200,
        success: true,
        message: '요청이 성공했습니다.',
        data: [],
      })
    }

    // 성공 응답 (이중 data 구조)
    return HttpResponse.json({
      status: 200,
      success: true,
      message: '요청이 성공했습니다.',
      data: mockTopOrders[storeId],
    })
  }),

  // 최근 주문 내역 조회 API
  http.get('/api/orders/recent', async ({ request }) => {
    const url = new URL(request.url)
    const storeId = parseInt(url.searchParams.get('storeId') || '0')

    console.log(`[MSW] 최근 주문 내역 요청 가로챔 - 매장 ID: ${storeId}`)

    // ID가 없거나 해당 매장 정보가 없는 경우 빈 배열 반환 (이중 data 구조)
    if (!storeId || !mockRecentOrders[storeId]) {
      return HttpResponse.json({
        status: 200,
        success: true,
        message: '요청이 성공했습니다.',
        data: [],
      })
    }

    // 성공 응답 (이중 data 구조)
    return HttpResponse.json({
      status: 200,
      success: true,
      message: '요청이 성공했습니다.',
      data: mockRecentOrders[storeId],
    })
  }),
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
        onUnhandledRequest: 'bypass', // 가로채지 않은 요청에 대해 경고
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
