import { RecommendationOption } from '@/interfaces/RecommendInterface'

// 레이어링이 필요한 옵션 카테고리
const layeringCategories = ['샷 추가', '얼음', 'HOT/ICED']

// 옵션별 레이어 이미지 경로 매핑
const optionLayerImages: Record<string, Record<string, string>> = {
  '샷 추가': {
    '1샷': '/1샷.png',
    '2샷': '/2샷.png',
    '3샷': '/3샷.png',
  },
  얼음: {
    적게: '/얼음적게.png',
    보통: '/얼음보통.png',
    많이: '/얼음많이.png',
  },
}

interface OptionLayerProps {
  menuId: number
  options: RecommendationOption[]
}

export function OptionLayer({ options }: OptionLayerProps) {
  // 각 옵션 카테고리별 선택된 옵션 찾기
  const selectedOptions = options
    .filter((option) => layeringCategories.includes(option.optionCategory))
    .map((option) => {
      const selectedIndex = option.isDefault.findIndex((isDefault) => isDefault)
      return {
        category: option.optionCategory,
        name: option.optionNames[selectedIndex],
        index: selectedIndex,
      }
    })
    .filter((option) => {
      // '없음' 옵션 제외
      if (option.name === '없음') return false

      // 이미지가 정의되지 않은 카테고리 제외
      if (!optionLayerImages[option.category]) {
        return false
      }

      return true
    })

  const renderOrder = ['샷 추가', '얼음']

  const orderedOptions = [...selectedOptions].sort((a, b) => {
    return renderOrder.indexOf(a.category) - renderOrder.indexOf(b.category)
  })

  if (orderedOptions.length === 0) {
    return null
  }

  return (
    <div className="relative w-[600px] h-[800px]">
      {orderedOptions.map((option, idx) => {
        const layerSrc = optionLayerImages[option.category]?.[option.name]

        return (
          <div
            key={`layer-${option.category}-${option.name}`}
            className="absolute inset-0 w-full h-full"
            style={{ zIndex: 30 + idx }} // z-index를 높게 설정하여 기본 이미지 위에 표시
          >
            <img
              src={layerSrc}
              alt={`${option.category}-${option.name}`}
              className="w-[600px] h-[800px] object-contain"
              // clipPath 제거, transform만 유지
              style={{ transform: 'translateY(40px)' }}
            />
          </div>
        )
      })}
    </div>
  )
}
