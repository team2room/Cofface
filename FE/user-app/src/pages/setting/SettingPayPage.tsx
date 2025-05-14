import DetailHeader from '@/components/DetailHeader'
import { Text } from '@/styles/typography'
import { useNavigate } from 'react-router-dom'
import tw from 'twin.macro'
import { useCallback, useEffect, useState } from 'react'
import {
  deleteCard,
  getCardInfo,
} from '@/features/register/services/payService'
import { CardInfoProps } from '@/interfaces/PayRegisterInterfaces'
import { CardList } from '@/features/setting/components/CardComponent'

const Container = tw.div`
  w-full max-w-screen-sm mx-auto flex flex-col h-screen pb-4
`
const HeaderWrapper = tw.div`
  sticky top-0 z-10 bg-white w-full
`
const NameWrapper = tw.div`
  flex items-center justify-between px-2 py-2
`
const ContentContainer = tw.div`
  flex-1 overflow-auto px-4 pt-2
`

export function SettingPayPage() {
  const navigate = useNavigate()
  const [cards, setCards] = useState<CardInfoProps[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSettingMode, setIsSettingMode] = useState(false)

  // 카드 정보 가져오기
  const fetchCardInfo = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const cardData = await getCardInfo()
      setCards(cardData)
    } catch (error) {
      console.error('카드 정보 조회 실패:', error)
      setError('카드 정보를 불러오는 데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCardInfo()
  }, [fetchCardInfo])

  // 카드 등록 페이지로 이동
  const handleAddCard = () => {
    navigate('/register/pay')
  }

  // 카드 설정 모드 토글
  const toggleSettingMode = () => {
    const newSettingMode = !isSettingMode
    setIsSettingMode(newSettingMode)

    // 설정 모드 종료 시 카드 데이터 새로고침
    if (!newSettingMode) {
      fetchCardInfo()
    }
  }

  //TODO - 대표카드 설정 api 붙이기
  // 대표카드 설정
  const handleSetAsDefault = async (cardId: string) => {
    try {
      // API 요청
      // await apiRequester.put(
      //   `/api/auto-payments/default?paymentInfoId=${cardId}`,
      // )

      // UI 즉시 업데이트 (로컬 상태 변경)
      setCards((prevCards) =>
        prevCards.map((card) => ({
          ...card,
          isDefault: card.paymentInfoId === cardId,
        })),
      )
    } catch (error) {
      console.error('대표 카드 설정 실패:', error)
      setError('대표 카드 설정에 실패했습니다.')
    }
  }

  // 카드 삭제
  const handleDeleteCard = async (cardId: string) => {
    try {
      setIsLoading(true)
      // API 요청
      await deleteCard(cardId)

      // UI 즉시 업데이트 (삭제된 카드 제거)
      setCards((prevCards) =>
        prevCards.filter((card) => card.paymentInfoId !== cardId),
      )
    } catch (error) {
      console.error('카드 삭제 실패:', error)
      setError('카드 삭제에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Container>
      <HeaderWrapper>
        <DetailHeader title="결제 수단 관리" />
      </HeaderWrapper>
      <ContentContainer>
        <NameWrapper>
          <Text variant="body1" weight="bold">
            등록된 카드
          </Text>
          <Text
            variant="caption1"
            weight="semibold"
            color="dark"
            onClick={toggleSettingMode}
          >
            {isSettingMode ? '완료' : '카드 설정'}
          </Text>
        </NameWrapper>

        {/* 카드 목록 컴포넌트 */}
        <CardList
          cards={cards}
          isLoading={isLoading}
          error={error}
          onAddCard={handleAddCard}
          isSettingMode={isSettingMode}
          onSetAsDefault={handleSetAsDefault}
          onDeleteCard={handleDeleteCard}
        />
      </ContentContainer>
    </Container>
  )
}
