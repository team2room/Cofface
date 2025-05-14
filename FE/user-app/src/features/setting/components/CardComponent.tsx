import { colors } from '@/styles/colors'
import { Text } from '@/styles/typography'
import { CardInfoProps } from '@/interfaces/PayRegisterInterfaces'
import { PlusCircleSolid } from 'iconoir-react'
import tw from 'twin.macro'
import LoadingMessage from '@/components/LoadingMessage'
import styled from '@emotion/styled'

const CardWrapper = tw.div`
  flex flex-col gap-2 mt-1
`
const CardItemContainer = tw.div`
  border border-gray rounded-md p-2 flex items-center justify-between
`
const Badge = tw.div`
  bg-light px-2 rounded-lg h-6 flex items-center
`
const ErrorMessage = tw.div`
  text-center py-4
`
const CardActions = tw.div`
  flex flex-col gap-1 items-end
`
const CardActionButton = styled.button<{
  isDefault?: boolean
  isDisabled?: boolean
}>`
  ${tw`px-2 py-0.5 rounded-md flex items-center`}
  ${({ isDefault, isDisabled }) => {
    if (isDisabled) {
      return tw`border border-gray text-darkGray cursor-not-allowed`
    } else if (isDefault) {
      return tw`border border-littleLight text-dark`
    } else {
      return tw`border border-littleLight text-dark`
    }
  }}
`
const DeleteButton = styled.button`
  ${tw`px-2 py-0.5 rounded-md border border-littleLight flex`}
`

interface CardListProps {
  cards: CardInfoProps[]
  isLoading: boolean
  error: string | null
  onAddCard: () => void
  isSettingMode: boolean
  onSetAsDefault: (cardId: number) => void
  onDeleteCard: (cardId: number) => void
}

export function CardList({
  cards,
  isLoading,
  error,
  onAddCard,
  isSettingMode,
  onSetAsDefault,
  onDeleteCard,
}: CardListProps) {
  // 카드 번호에서 마지막 4자리 추출하는 함수
  const getLastFourDigits = (cardNumber: string) => {
    // 하이픈이 있는 경우 제거
    const cleanNumber = cardNumber.replace(/-/g, '')
    return cleanNumber.slice(-4)
  }

  // 카드 유효기간 포맷팅 (MM/YY -> MM/YY)
  const formatExpiryDate = (expiryDate: string) => {
    return expiryDate // 이미 MM/YY 형식으로 저장되어 있다고 가정
  }

  if (isLoading) {
    return <LoadingMessage />
  }

  if (error) {
    return (
      <ErrorMessage>
        <Text variant="body1" color="darkGray">
          {error}
        </Text>
      </ErrorMessage>
    )
  }

  return (
    <CardWrapper>
      {cards.length > 0
        ? cards.map((card) => (
            <CardItemContainer key={card.paymentInfoId}>
              <div className="flex items-center gap-3">
                <img src={card.imageUrl} className="w-8" alt="카드 이미지" />
                <div className="flex flex-col gap-1">
                  <Text variant="body1" weight="bold">
                    {card.brand} 카드 ({getLastFourDigits(card.cardNumber)})
                  </Text>
                  <Text variant="caption1" weight="semibold" color="littleDark">
                    {formatExpiryDate(card.cardExpiry)}
                  </Text>
                </div>
              </div>
              {isSettingMode ? (
                <CardActions>
                  {card.isDefault ? (
                    <Badge>
                      <Text variant="caption2" weight="bold" color="dark">
                        대표 카드
                      </Text>
                    </Badge>
                  ) : (
                    <>
                      <CardActionButton
                        onClick={() => onSetAsDefault(card.paymentInfoId)}
                      >
                        <Text variant="caption2" weight="semibold" color="dark">
                          대표 카드 설정
                        </Text>
                      </CardActionButton>

                      <DeleteButton
                        onClick={() => onDeleteCard(card.paymentInfoId)}
                      >
                        <Text variant="caption2" weight="semibold" color="dark">
                          삭제
                        </Text>
                      </DeleteButton>
                    </>
                  )}
                </CardActions>
              ) : (
                card.isDefault && (
                  <Badge>
                    <Text variant="caption2" weight="bold" color="dark">
                      대표 카드
                    </Text>
                  </Badge>
                )
              )}
            </CardItemContainer>
          ))
        : null}

      <CardItemContainer onClick={onAddCard}>
        <div className="flex items-center gap-3">
          <PlusCircleSolid width={22} height={22} color={colors.littleDark} />
          <Text variant="caption1" weight="bold" color="littleDark">
            카드 등록하기
          </Text>
        </div>
      </CardItemContainer>
    </CardWrapper>
  )
}

// 카드 추가 버튼 컴포넌트
interface AddCardButtonProps {
  onClick: () => void
}

export function AddCardButton({ onClick }: AddCardButtonProps) {
  return (
    <CardItemContainer onClick={onClick}>
      <div className="flex items-center gap-3">
        <PlusCircleSolid width={22} height={22} color={colors.littleDark} />
        <Text variant="caption1" weight="bold" color="littleDark">
          카드 등록하기
        </Text>
      </div>
    </CardItemContainer>
  )
}
