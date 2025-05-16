import { SelectedOption } from '@/interfaces/OrderInterface'

export const formatOptionLabel = (option: SelectedOption): string => {
  const { category, value } = option

  switch (category) {
    case 'HOT/ICED':
      return value
    case '사이즈':
      return `${value} 사이즈`
    case '샷 추가':
      return value === '없음' ? '샷 추가 없음' : `${value} 추가`
    case '우유 변경':
      return value === '없음' ? '우유 변경 없음' : value
    case '얼음':
      return `얼음 ${value}`
    case '휘핑 크림':
      return value === '없음' ? '휘핑 크림 없음' : `휘핑 크림 ${value}`
    default:
      return `${category}: ${value}`
  }
}
