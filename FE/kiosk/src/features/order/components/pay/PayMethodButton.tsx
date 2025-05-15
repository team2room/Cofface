import { TbFaceId } from 'react-icons/tb'
import { IoQrCodeOutline } from 'react-icons/io5'
import { Text } from '@/styles/typography'
import tw from 'twin.macro'

const PaymentGrid = tw.div`flex gap-20`
const ImageButton = tw.button`
  w-[322px] h-[446px] rounded-[20px] bg-white shadow-[1px_3px_15px_5px_rgba(0,0,0,0.25)]
  flex flex-col items-center justify-between py-14 
  hover:scale-105 transition-transform duration-200
`

interface Props {
  onSelect: (type: 'face' | 'qr') => void
}

export default function PayMethodButton({ onSelect }: Props) {
  return (
    <PaymentGrid>
      <ImageButton onClick={() => onSelect('face')}>
        <TbFaceId size={213} />
        <Text variant="title4" weight="extrabold" color="lightBlack">
          페이스 페이
        </Text>
      </ImageButton>
      <ImageButton onClick={() => onSelect('qr')}>
        <IoQrCodeOutline size={185} className="mt-4" />
        <Text variant="title4" weight="extrabold" color="lightBlack">
          큐알 결제
        </Text>
      </ImageButton>
    </PaymentGrid>
  )
}
