import tw from 'twin.macro'

const Container = tw.div`
  absolute top-0 left-0 w-full h-16 z-0
`

export default function WavyHeader() {
  return (
    <Container>
      <div className="w-full h-full absolute top-0 left-0 bg-littleLight">
        <div className="flex w-full absolute bottom-4 left-0">
          <div className="w-1/4 h-22 relative">
            <div className="absolute inset-0 rounded-full bg-littleLight transform translate-y-1/2"></div>
          </div>
          <div className="w-1/4 h-22 relative">
            <div className="absolute inset-0 rounded-full bg-littleLight transform translate-y-1/2"></div>
          </div>
          <div className="w-1/4 h-22 relative">
            <div className="absolute inset-0 rounded-full bg-littleLight transform translate-y-1/2"></div>
          </div>
          <div className="w-1/4 h-24 relative">
            <div className="absolute inset-0 rounded-full bg-littleLight transform translate-y-1/2"></div>
          </div>
        </div>
      </div>
    </Container>
  )
}
