import { useEffect, useState } from 'react'
import { Text } from '@/styles/typography'
import tw from 'twin.macro'
import { colors } from '@/styles/colors'
import { Lock, Xmark, ArrowLeftTag } from 'iconoir-react'

const KeypadOverlay = tw.div`
  fixed inset-0 z-50 flex flex-col items-center justify-end pointer-events-none
`

const KeypadContent = tw.div`
  mt-auto w-full pointer-events-auto
`

const KeypadWrapper = tw.div`
  w-full py-6 px-4 bg-darkDark 
`

const KeypadHeader = tw.div`
  relative flex justify-center items-center mb-6 px-2
`

const KeypadContainer = tw.div`
  grid grid-cols-3
`

const KeyButton = tw.button`
  rounded-md py-3 flex items-center justify-center bg-darkDark
  active:opacity-50 transition-opacity duration-100 disabled:opacity-30
`

const HeaderTitleContainer = tw.div`
  flex items-center gap-2 justify-center
`

const CloseButtonContainer = tw.div`
  absolute right-2
`

interface RandomKeyPadProps {
  onKeyPress: (key: string) => void
  onDelete: () => void
  onClose: () => void
  onAllDelete: () => void
  maxLength: number
  currentLength: number
  title?: string
}

export default function RandomKeyPad({
  onKeyPress,
  onDelete,
  onClose,
  onAllDelete,
  maxLength,
  currentLength,
  title = '보안키패드 작동중',
}: RandomKeyPadProps) {
  const [keypadNumbers, setKeypadNumbers] = useState<number[]>([])

  useEffect(() => {
    const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    const shuffled = numbers.sort(() => 0.5 - Math.random())
    setKeypadNumbers(shuffled)
  }, [])

  return (
    <KeypadOverlay>
      <KeypadContent>
        <KeypadWrapper>
          <KeypadHeader>
            <HeaderTitleContainer>
              <Lock
                color={colors.white}
                width={20}
                height={20}
                strokeWidth={2}
              />
              <Text variant="body1" weight="medium" color="white">
                {title}
              </Text>
            </HeaderTitleContainer>
            <CloseButtonContainer>
              <button className="p-1" onClick={onClose}>
                <Xmark
                  color={colors.white}
                  width={26}
                  height={26}
                  strokeWidth={2}
                />
              </button>
            </CloseButtonContainer>
          </KeypadHeader>

          <KeypadContainer>
            {keypadNumbers.slice(0, 9).map((num) => (
              <KeyButton
                key={`key-${num}`}
                onClick={() => onKeyPress(String(num))}
                disabled={currentLength >= maxLength}
              >
                <Text variant="title3" weight="bold" color="white">
                  {num}
                </Text>
              </KeyButton>
            ))}
            <KeyButton onClick={onAllDelete}>
              <Text variant="body1" weight="bold" color="white">
                전체 삭제
              </Text>
            </KeyButton>
            <KeyButton
              onClick={() => onKeyPress(String(keypadNumbers[9]))}
              disabled={currentLength >= maxLength}
            >
              <Text variant="title3" weight="bold" color="white">
                {keypadNumbers[9]}
              </Text>
            </KeyButton>
            <KeyButton onClick={onDelete}>
              <ArrowLeftTag width={34} height={34} color={colors.white} />
            </KeyButton>
          </KeypadContainer>
        </KeypadWrapper>
      </KeypadContent>
    </KeypadOverlay>
  )
}
