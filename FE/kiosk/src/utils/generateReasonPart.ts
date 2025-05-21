import { RecommendationGroup } from '@/interfaces/RecommendInterface'

export type ReasonPart =
  | { type: 'text'; content: string }
  | { type: 'number'; value: number }
  | { type: 'keyword'; content: string }

function formatKoreanDate(dateString: string): string {
  const date = new Date(dateString)
  return `${date.getMonth() + 1}월 ${date.getDate()}일`
}

function getWeatherPhrase(weather: string): string {
  switch (weather) {
    case '가벼운 눈':
      return '살짝 눈이 내리는'
    case '가벼운 비':
      return '보슬보슬 비가 내리는'
    case '강풍':
    case '강한 바람':
      return '바람이 세게 부는'
    case '구름 많음':
      return '구름이 많이 낀'
    case '구름 조금':
    case '구름 약간':
      return '구름이 살짝 있는'
    case '극도로 더움':
      return '극도로 더운'
    case '눈':
      return '눈이 내리는'
    case '더움':
      return '더운'
    case '따뜻함':
      return '따뜻한'
    case '맑음':
      return '맑고 화창한'
    case '매우 더움':
      return '매우 더운'
    case '매우 추움':
      return '매우 추운'
    case '먼지':
      return '먼지가 많은'
    case '무더움':
      return '무더운'
    case '바람 많음':
      return '바람이 많이 부는'
    case '비':
      return '비가 내리는'
    case '서늘함':
      return '서늘한'
    case '안개':
      return '안개가 짙은'
    case '연무':
      return '연무가 낀'
    case '위험한 날씨':
      return '위험한 기상 상황인'
    case '이슬비':
      return '이슬비가 내리는'
    case '천둥번개':
      return '천둥번개가 치는'
    case '추움':
      return '추운'
    case '쾌적함':
      return '쾌적한'
    case '폭설':
      return '폭설이 내리는'
    case '폭우':
      return '폭우가 쏟아지는'
    case '후덥지근함':
      return '후덥지근한'
    case '흐림':
      return '흐린'
    default:
      return weather
  }
}

export function generateReasonParts(
  recommendationGroup: RecommendationGroup,
): ReasonPart[][] {
  const { recommendationType, menus } = recommendationGroup

  return menus.map((menu) => {
    const { menuName, keyword2, percentage, orderCount, additionalInfo } = menu

    const roundedPercentage = percentage !== null ? Math.round(percentage) : 0
    const roundedOrderCount = orderCount ?? 0

    switch (recommendationType) {
      case 1:
        return [
          {
            type: 'text',
            content: `${additionalInfo['나이']} ${additionalInfo['성별']}의 `,
          },
          { type: 'number', value: roundedPercentage },
          { type: 'text', content: `%는\n ${keyword2} ` },
          { type: 'keyword', content: `${menuName}` },
          { type: 'text', content: `를 마셨어요!` },
        ]

      case 2:
        return [
          {
            type: 'text',
            content: `${additionalInfo['시간대']}에 방문한 고객 중 `,
          },
          { type: 'number', value: roundedPercentage },
          { type: 'text', content: `%는\n ${keyword2} ` },
          { type: 'keyword', content: `${menuName}` },
          { type: 'text', content: `를 마셨어요!` },
        ]

      case 3:
        const weatherPhrase = getWeatherPhrase(additionalInfo['날씨'])
        return [
          {
            type: 'text',
            content: `${weatherPhrase} 날씨에 방문한 고객 중 \n`,
          },
          { type: 'number', value: roundedPercentage },
          { type: 'text', content: `%는 ${keyword2} ` },
          { type: 'keyword', content: `${menuName}` },
          { type: 'text', content: `를 마셨어요!` },
        ]

      case 4:
        return [
          {
            type: 'text',
            content: `${additionalInfo['요일']}에 인기 있는 메뉴는\n `,
          },
          { type: 'number', value: roundedOrderCount },
          { type: 'text', content: `회 주문된 ${keyword2} ` },
          { type: 'keyword', content: `${menuName}` },
          { type: 'text', content: `에요!` },
        ]

      case 5:
        return [
          { type: 'text', content: '이번 주에 인기 있는 메뉴는\n ' },
          { type: 'number', value: roundedOrderCount },
          { type: 'text', content: `회 주문된 ${keyword2} ` },
          { type: 'keyword', content: `${menuName}` },
          { type: 'text', content: `에요!` },
        ]

      case 6:
        return [
          {
            type: 'text',
            content: `${additionalInfo['월']}에 인기 있는 메뉴는\n `,
          },
          { type: 'number', value: roundedOrderCount },
          { type: 'text', content: `회 주문된 ${keyword2} ` },
          { type: 'keyword', content: `${menuName}` },
          { type: 'text', content: `에요!` },
        ]

      case 7:
        return [
          {
            type: 'text',
            content: `COFFACE의 ${additionalInfo['인기도']} 메뉴는\n `,
          },
          { type: 'number', value: roundedOrderCount },
          { type: 'text', content: `회 주문된 ${keyword2} ` },
          { type: 'keyword', content: `${menuName}` },
          { type: 'text', content: `에요!` },
        ]

      case 8:
        return [
          {
            type: 'text',
            content: `회원님의 ${additionalInfo['주문 빈도']} 메뉴는\n `,
          },
          { type: 'number', value: roundedOrderCount },
          { type: 'text', content: `회 주문한 ${keyword2} ` },
          { type: 'keyword', content: `${menuName}` },
          { type: 'text', content: `에요!` },
        ]

      case 9:
        const recentDate = formatKoreanDate(additionalInfo['최근 주문일'])
        return [
          {
            type: 'text',
            content: `최근 주문 메뉴는 ${recentDate}에 주문한\n ${keyword2} `,
          },
          { type: 'keyword', content: `${menuName}` },
          { type: 'text', content: `에요!` },
        ]

      default:
        return [{ type: 'text', content: '' }]
    }
  })
}
