import { ReasonPart } from '@/utils/generateReasonPart'
import SlotNumber from '@/components/slotNumber'
import { Text } from '@/styles/typography'
import { HighlightText } from './HighlightText'

interface ReasonTextProps {
  parts: ReasonPart[]
  reasonIndex?: number // 전체 Reason의 인덱스 추가
}

export const ReasonText: React.FC<ReasonTextProps> = ({ parts }) => {
  return (
    <div className="whitespace-pre-line text-xl leading-relaxed">
      {parts.map((part, i) => {
        switch (part.type) {
          case 'text':
            return (
              <Text key={i} variant="title1" weight="bold" fontFamily="Suite">
                {part.content}
              </Text>
            )
          case 'number':
            return <SlotNumber key={i} number={part.value} />
          case 'keyword':
            return (
              <HighlightText key={i} trigger={i} delay={i * 0.3}>
                <Text variant="title1" weight="bold" fontFamily="Suite">
                  {part.content}
                </Text>
              </HighlightText>
            )
          default:
            return null
        }
      })}
    </div>
  )
}
