import tw from 'twin.macro'
import { Text } from '@/styles/typography'
import { IoCloseCircle } from 'react-icons/io5'
import { useState } from 'react'
import styled from '@emotion/styled'
import CustomDialog from '@/components/CustomDialog'
import PayMethodButton from './pay/PayMethodButton'
import { usePayModal } from '../hooks/usePayModal'

const Content = tw.div`w-full flex flex-col items-center justify-center flex-1 gap-12 mb-60`
const Section = tw.div`w-[984px] bg-lightLight px-10 py-16 mb-12`
const Row = tw.div`flex items-center mb-8`
const CouponRow = tw.div`flex items-end gap-2 mb-4`
const CouponBox = tw.div`flex justify-between items-center px-4 py-2 bg-white rounded-md`

const Divider = tw.div`h-[3px] w-full bg-main my-12`
const FinalPriceRow = tw.div`flex justify-between items-center mb-2`

const Button = styled.button<{ disabled: boolean }>`
  ${tw`px-6 py-1 mb-4 rounded-[15px] shadow-[4px_4px_8px_2px_rgba(250,4,101,0.25)]`}
  ${({ disabled }) =>
    disabled ? tw`bg-gray text-white` : tw`bg-[#FEEEF4] text-pink-600`}
`

const ColName = tw.div`w-1/2`
const ColQty = tw.div`w-1/6 text-center`
const ColPrice = tw.div`w-1/3 text-right`

export default function PayContent() {
  const [couponApplied, setCouponApplied] = useState(false)
  const couponCount = 1

  const [modalState, setModalState] = useState<'face' | 'qr'>('face')
  const modalContent = usePayModal(modalState)
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <Content>
        <div>
          {/* 쿠폰 버튼 */}
          <div className="w-full flex justify-end mb-4">
            <Button disabled={false} onClick={() => setCouponApplied(true)}>
              <Text variant="body2" weight="bold">
                쿠폰 1장 적용하기
              </Text>
            </Button>
          </div>

          <Section>
            {/* 결제 금액 */}
            <Row>
              <ColName>
                <Text variant="title4" weight="extrabold" color="lightBlack">
                  결제 금액
                </Text>
              </ColName>
              <ColQty>
                <Text variant="body1" weight="bold" color="lightBlack">
                  4개
                </Text>
              </ColQty>
              <ColPrice>
                <Text variant="body1" weight="extrabold" color="main">
                  14,000
                  <span className="text-lightBlack">원</span>
                </Text>
              </ColPrice>
            </Row>

            {/* 쿠폰 적용 */}
            <CouponRow>
              <Text variant="title4" weight="extrabold" color="lightBlack">
                쿠폰 사용
              </Text>
              <Text variant="body2" weight="extrabold" color="littleDarkGray">
                (보유 쿠폰 {couponCount}장)
              </Text>
            </CouponRow>

            {/* 적용된 쿠폰 */}
            {couponApplied && (
              <CouponBox>
                <div className="flex items-center gap-6">
                  <IoCloseCircle
                    size={40}
                    className="text-littleDarkGray cursor-pointer"
                    onClick={() => setCouponApplied(false)}
                  />
                  <Text variant="body2" weight="semibold">
                    적립 10회 할인
                  </Text>
                </div>

                <Text variant="body2" weight="bold" color="main">
                  -1,500
                  <span className="text-lightBlack">원</span>
                </Text>
              </CouponBox>
            )}

            {/* 구분선 */}
            <Divider />

            {/* 최종 결제 금액 */}
            <FinalPriceRow>
              <Text variant="title4" weight="extrabold">
                최종 결제 금액
              </Text>
              <Text variant="title4" weight="extrabold" color="main">
                12,500
                <span className="text-lightBlack">원</span>
              </Text>
            </FinalPriceRow>
          </Section>
        </div>

        {/* 결제 수단 선택 */}
        <div className="w-full ml-16">
          <Text variant="title4" weight="extrabold" color="lightBlack">
            결제 수단 선택
          </Text>
        </div>
        <PayMethodButton
          onSelect={(type) => {
            setModalState(type)
            setShowModal(true)
          }}
        />
      </Content>

      <CustomDialog
        open={showModal}
        onOpenChange={setShowModal}
        title={modalContent.title}
        description={modalContent.description}
        icon={modalContent.icon}
        cancelText={modalContent.cancelText}
        onCancel={() => setShowModal(false)}
        hideConfirm={true}
      />
    </>
  )
}
