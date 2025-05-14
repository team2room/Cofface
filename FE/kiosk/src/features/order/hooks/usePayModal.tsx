import { Text } from '@/styles/typography'

export function usePayModal(modalState: 'face' | 'qr') {
  if (modalState === 'face') {
    return {
      title: (
        <Text variant="title4" weight="extrabold" color="gray">
          FacePay ----------------------- ORDER.ME
        </Text>
      ),
      description: (
        <Text variant="title4" weight="extrabold">
          우측 단말기에
          <br />
          얼굴을 인식해 주세요!
        </Text>
      ),
      icon: '/face.gif',
      cancelText: '취소',
      hideConfirm: false,
    }
  }

  return {
    title: (
      <Text variant="title4" weight="extrabold" color="gray">
        QRPay ------------------------- ORDER.ME
      </Text>
    ),
    description: (
      <Text variant="title4" weight="extrabold">
        휴대폰으로 QR을
        <br />
        인식해 주세요!
      </Text>
    ),
    icon: undefined,
    cancelText: '취소',
    hideConfirm: true,
  }
}
