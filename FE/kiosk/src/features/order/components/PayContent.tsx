import tw from 'twin.macro'
import { Text } from '@/styles/typography'
import { IoCloseCircle } from 'react-icons/io5'
import { useState } from 'react'
import styled from '@emotion/styled'
import PayMethodButton from './pay/PayMethodButton'
import { useCouponInfo } from '../hooks/useCoupon'
import { useUserStore } from '@/stores/loginStore'
import { usePayStore } from '@/stores/payStore'
import { useNavigate } from 'react-router-dom'

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
  const navigate = useNavigate()
  const { isMember } = useUserStore()
  const { couponInfo, loading: couponLoading } = useCouponInfo(1)
  const [couponApplied, setCouponApplied] = useState(false)

  const { totalAmount, menuOrders, setIsStampUsed, setTotalAmount } =
    usePayStore()
  const originalAmount = totalAmount
  const totalQuantity =
    menuOrders?.reduce((sum, item) => sum + item.quantity, 0) ?? 0

  if (couponLoading) return <div>쿠폰 정보를 불러오는 중...</div>

  return (
    <>
      <Content>
        <div>
          {/* 쿠폰 버튼 */}
          <div className="w-full flex justify-end mb-4">
            <Button
              disabled={!isMember || couponInfo?.couponCount === 0}
              onClick={() => {
                setCouponApplied(true)
                setIsStampUsed(true)
                if (couponInfo?.discountAmount) {
                  setTotalAmount(
                    (originalAmount ?? 0) - couponInfo.discountAmount,
                  )
                }
              }}
            >
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
                  {totalQuantity}개
                </Text>
              </ColQty>
              <ColPrice>
                <Text variant="body1" weight="extrabold" color="main">
                  {originalAmount?.toLocaleString()}
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
                (보유 쿠폰 {couponInfo?.couponCount ?? 0}장)
              </Text>
            </CouponRow>

            {/* 적용된 쿠폰 */}
            {couponApplied && (
              <CouponBox>
                <div className="flex items-center gap-6">
                  <IoCloseCircle
                    size={40}
                    className="text-littleDarkGray cursor-pointer"
                    onClick={() => {
                      setCouponApplied(false)
                      setIsStampUsed(false)
                      setTotalAmount(originalAmount ?? 0)
                    }}
                  />
                  <Text variant="body2" weight="semibold">
                    적립 10회 할인 쿠폰
                  </Text>
                </div>

                <Text variant="body2" weight="bold" color="main">
                  {couponInfo?.discountAmount}
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
                {totalAmount?.toLocaleString()}
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
          onSelect={async (type) => {
            if (type === 'face') {
              navigate('/loading?type=progress')
            } else {
              // setModalState('qr')
              // setShowModal(true)
              navigate('/pay')
            }
          }}
        />
      </Content>
    </>
  )
}
