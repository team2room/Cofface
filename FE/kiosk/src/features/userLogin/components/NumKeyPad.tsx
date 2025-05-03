import { Text } from '@/styles/typography'
import tw from 'twin.macro'
import { LuDelete } from 'react-icons/lu'
import { useLoginStore } from '@/stores/loginStore'

const Container = tw.div`
  flex flex-col items-center p-4 mt-8
`

const KeypadContainer = tw.div`
  grid grid-cols-3 mt-6 gap-6 justify-center
`

const KeyButton = tw.button`
  bg-littleGray p-4 flex items-center justify-center w-28 h-28 rounded-lg
  active:opacity-70 transition-opacity duration-100
`

export default function NumKeyPad() {
  const numberPad = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '←']
  const phoneNumber = useLoginStore((state) => state.phoneNumber)
  const setPhoneNumber = useLoginStore((state) => state.setPhoneNumber)
  const resetPhoneNumber = useLoginStore((state) => state.resetPhoneNumber)

  const handleClick = (key: string) => {
    if (key === 'C') {
      resetPhoneNumber()
    } else if (key === '←') {
      setPhoneNumber(phoneNumber.slice(0, -1))
    } else if (phoneNumber.length < 11) {
      setPhoneNumber(phoneNumber + key)
    }
  }

  const formatPhoneNumber = (number: string) => {
    if (number.length <= 3) return number
    if (number.length <= 7) return `${number.slice(0, 3)}-${number.slice(3)}`
    return `${number.slice(0, 3)}-${number.slice(3, 7)}-${number.slice(7)}`
  }

  return (
    <Container>
      <div className="border-b-2 border-littleDarkGray mb-6 w-2/3 h-14 text-center">
        <Text variant="title3" weight="bold" color="black">
          {formatPhoneNumber(phoneNumber)}
        </Text>
      </div>
      <KeypadContainer>
        {numberPad.map((key) => (
          <KeyButton key={key} onClick={() => handleClick(key)}>
            {key === 'C' ? (
              <Text variant="caption1" weight="bold" color="black">
                전체
                <br />
                삭제
              </Text>
            ) : key === '←' ? (
              <LuDelete size={32} color="black" />
            ) : (
              <Text variant="body2" weight="bold" color="black">
                {key}
              </Text>
            )}
          </KeyButton>
        ))}
      </KeypadContainer>
    </Container>
  )
}
