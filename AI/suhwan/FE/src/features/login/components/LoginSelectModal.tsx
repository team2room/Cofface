import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Text } from '@/styles/typography'
import tw from 'twin.macro'

// 통신사 옵션 목록
export const TELECOM_OPTIONS = [
  'SKT',
  'KT',
  'LG U+',
  'SKT 알뜰폰',
  'KT 알뜰폰',
  'LG U+ 알뜰폰',
]

const TelecomOption = tw.div`
  px-4 py-2 hover:bg-gray/10 transition-colors
`

interface SelectDrawerProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (telecomProvider: string) => void
}

export default function LoginSelectModal({
  isOpen,
  onOpenChange,
  onSelect,
}: SelectDrawerProps) {
  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>
            <Text variant="title3" weight="bold">
              통신사를 선택해주세요
            </Text>
          </DrawerTitle>
          <div className="flex flex-col">
            {TELECOM_OPTIONS.map((telecomProvider) => (
              <DrawerClose key={telecomProvider} asChild>
                <TelecomOption onClick={() => onSelect(telecomProvider)}>
                  <Text variant="title3" weight="regular">
                    {telecomProvider}
                  </Text>
                </TelecomOption>
              </DrawerClose>
            ))}
          </div>
        </DrawerHeader>
      </DrawerContent>
    </Drawer>
  )
}
