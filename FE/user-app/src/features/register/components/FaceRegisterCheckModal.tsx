import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer'
import { Text } from '@/styles/typography'
import tw from 'twin.macro'
import { NavArrowDown } from 'iconoir-react'

interface SelectDrawerProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

const Container = tw.div`
  px-4 pb-6
`

const ConsentItem = tw.div`
  flex items-center py-1
`

const CheckboxLabel = tw.label`
  flex items-center gap-3 w-full
`

const ConfirmButton = tw.button`
  w-full bg-main text-white py-1 rounded-lg mt-6
`

const SkipButton = tw.button`
  w-full text-center text-gray py-1 mt-1
`

export function FaceRegisterCheckModal({
  isOpen,
  onOpenChange,
}: SelectDrawerProps) {
  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent className="px-6 pt-2">
        <DrawerTitle className="my-4">
          <Text variant="body1" weight="semibold" color="lightBlack">
            서비스에 필요한 동의에요
          </Text>
        </DrawerTitle>
        <Container>
          <ConsentItem>
            <CheckboxLabel>
              <Text variant="caption2" color="main" weight="bold">
                필수
              </Text>
              <Text variant="caption1" weight="medium" color="darkGray">
                오더미 페이 서비스
              </Text>
            </CheckboxLabel>
            <NavArrowDown color="darkGray" />
          </ConsentItem>
          <ConsentItem>
            <CheckboxLabel>
              <Text variant="caption2" color="main" weight="bold">
                필수
              </Text>
              <Text variant="caption1" weight="medium" color="darkGray">
                본인 확인 서비스 약관 및 동의사항
              </Text>
            </CheckboxLabel>
            <NavArrowDown color="darkGray" />
          </ConsentItem>
          <ConsentItem>
            <CheckboxLabel>
              <Text variant="caption2" color="main" weight="bold">
                필수
              </Text>
              <Text variant="caption1" weight="medium" color="darkGray">
                얼굴 인식정보 수집 및 이용 동의
              </Text>
            </CheckboxLabel>
            <NavArrowDown color="darkGray" />
          </ConsentItem>
          <ConfirmButton onClick={() => {}}>
            <Text variant="caption1" weight="medium" color="white">
              필수 동의하기
            </Text>
          </ConfirmButton>
          <SkipButton onClick={() => onOpenChange(false)}>
            <Text variant="caption1" weight="medium" color="darkGray">
              다음에 하기
            </Text>
          </SkipButton>
        </Container>
      </DrawerContent>
    </Drawer>
  )
}
