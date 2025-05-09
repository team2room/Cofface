import tw from 'twin.macro'

const Container = tw.div`
  w-full max-w-screen-sm mx-auto flex flex-col min-h-screen bg-black
`
const HeaderWrapper = tw.div`
  sticky top-0 z-10 bg-black w-full
`
const ContentWrapper = tw.div`
  flex flex-col px-6 flex-1 pb-6
`

export function FaceRegisterCapturePage() {
  return (
    <Container>
      <HeaderWrapper></HeaderWrapper>
      <ContentWrapper></ContentWrapper>
    </Container>
  )
}
