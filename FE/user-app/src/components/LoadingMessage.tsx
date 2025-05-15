import { Text } from '@/styles/typography'
import loadingGif from '@/assets/loading.gif'

export default function LoadingMessage() {
  return (
    <>
      <div className="flex flex-col justify-center items-center h-full w-full">
        <div>
          <img src={loadingGif} alt="로딩 중..." className="w-16 h-16" />
          <Text variant="title3" weight="bold" color="lightBlack">
            로딩 중...
          </Text>
        </div>
      </div>
    </>
  )
}
