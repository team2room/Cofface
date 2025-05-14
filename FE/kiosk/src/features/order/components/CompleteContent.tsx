import tw from 'twin.macro'
import { Text } from '@/styles/typography'
import { useNavigate } from 'react-router-dom'
import CustomButton from '@/components/CustomButton'

const Content = tw.div`flex flex-col items-center justify-center flex-1 gap-12`

export default function CompleteContent() {
  const navigate = useNavigate()

  return (
    <Content>
      <div className="flex flex-col items-center gap-2">
        <Text variant="title2" weight="bold" color="darkGray">
          주문번호 : A-32
        </Text>
        <Text variant="title1" weight="bold" color="lightBlack">
          주문이 완료되었습니다!
        </Text>
      </div>

      <img src="/coffee.gif" alt="커피잔" className="w-[500px]" />
      <img src="/coffeeBean.gif" alt="커피콩" className="w-[400px]" />

      <CustomButton
        text={'닫기'}
        variant={'main'}
        onClick={() => navigate('/user')}
      />
    </Content>
  )
}
