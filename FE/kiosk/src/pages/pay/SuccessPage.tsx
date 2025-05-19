import { SuccessContent } from '@/features/order/components/pay/SuccessContent'
import tw from 'twin.macro'

const ImageWrapper = tw.div`w-full my-8 flex justify-center items-center`
const FullImg = tw.img`absolute top-0 left-0 w-full h-full object-cover`

export function SuccessPage() {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center">
      <ImageWrapper>
        <FullImg src="/로딩배경.png" alt="Spring Garden" draggable={false} />
      </ImageWrapper>

      <SuccessContent />
    </div>
  )
}
