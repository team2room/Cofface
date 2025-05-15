import { Text } from '@/styles/typography'

interface SurveyHeaderProps {
  title: string
  progress?: number
}

export default function SurveyHeader({
  title,
  progress = 50,
}: SurveyHeaderProps) {
  return (
    <div className="flex flex-col text-start mt-4 gap-3">
      <div className="w-full h-1 bg-gray mb-4 rounded-full">
        {/* Progress bar */}
        <div
          className="h-full bg-main rounded-full"
          style={{
            width: `${progress}%`,
            transition: 'width 0.3s ease-in-out',
          }}
        />
      </div>
      <div className="flex flex-col">
        <Text variant="title3" weight="bold">
          {title}
        </Text>
      </div>
    </div>
  )
}
