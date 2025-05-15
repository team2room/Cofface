import { useSearchParams } from 'react-router-dom'
import tw from 'twin.macro'

const Content = tw.div`flex flex-col items-center justify-center flex-1 gap-8 z-10`

export function FailContent() {
  const [searchParams] = useSearchParams()

  // 고객에게 실패 사유 알려주고 다른 페이지로 이동

  return (
    <Content>
      <h1>결제 실패</h1>
      <div>{`사유: ${searchParams.get('message')}`}</div>
    </Content>
  )
}
