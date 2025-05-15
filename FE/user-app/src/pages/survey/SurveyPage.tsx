import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MainButton from '@/components/MainButton'
import MenuSelectContent from '@/features/survey/components/MenuSelectContent'
import OptionSelectContent from '@/features/survey/components/OptionSelectContent'
import SurveyHeader from '@/features/survey/components/SurveyHeader'
import tw from 'twin.macro'
import styled from '@emotion/styled'
import {
  getSurveyMenus,
  getSurveyOptions,
  requestSurvey,
} from '@/features/survey/services/surveyService'
import {
  MenuCategoryProps,
  OptionCategoryProps,
  PreferredOptionProps,
  SurveyRequestProps,
} from '@/interfaces/SurveyInterfaces'
import LoadingMessage from '@/components/LoadingMessage'

const Container = tw.div`
  w-full max-w-screen-sm mx-auto flex flex-col h-screen p-6
`

const ContentWrapper = styled.div`
  ${tw`flex-1 overflow-y-auto relative`}
  /* 스크롤바 숨기기 - Firefox */
  scrollbar-width: none;

  /* 스크롤바 숨기기 - Chrome, Safari, Edge */
  &::-webkit-scrollbar {
    display: none;
  }

  /* IE 11에서 스크롤바 숨기기 */
  -ms-overflow-style: none;
`

const ButtonWrapper = tw.div`
  mt-auto
`

type SurveyStep = 'menu' | 'option'

export default function SurveyPage() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState<SurveyStep>('menu')
  const [selectedMenus, setSelectedMenus] = useState<number[]>([])
  const [selectedOptions, setSelectedOptions] = useState<
    Record<number, number>
  >({})
  const [menuCategories, setMenuCategories] = useState<MenuCategoryProps[]>([])
  const [optionCategories, setOptionCategories] = useState<
    OptionCategoryProps[]
  >([])
  const [loading, setLoading] = useState<boolean>(true)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // 프로그레스 바 진행 상태
  const [progress, setProgress] = useState(50) // 첫 단계는 50%

  // API에서 메뉴 데이터 로드
  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        setLoading(true)
        const menuData = await getSurveyMenus()
        setMenuCategories(menuData)
        setError(null)
      } catch (err) {
        console.error('메뉴 데이터 로드 중 오류:', err)
        setError('메뉴 데이터를 불러오는 중 오류가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchMenuData()
  }, [])

  // API에서 옵션 데이터 로드 (초기 로드 시)
  useEffect(() => {
    const fetchOptionData = async () => {
      // 현재 단계가 옵션 단계이거나, 데이터가 아직 로드되지 않은 경우에만 로드
      if (currentStep === 'option' || optionCategories.length === 0) {
        try {
          setLoading(true)
          const optionData = await getSurveyOptions()
          setOptionCategories(optionData)

          // 옵션 카테고리 데이터가 로드되면 초기 상태 설정
          const initialOptions: Record<number, number> = {}
          optionData.forEach((category) => {
            initialOptions[category.categoryId] = 0 // 0은 선택되지 않음을 의미
          })
          setSelectedOptions(initialOptions)

          setError(null)
        } catch (err) {
          console.error('옵션 데이터 로드 중 오류:', err)
          setError('옵션 데이터를 불러오는 중 오류가 발생했습니다.')
        } finally {
          setLoading(false)
        }
      }
    }

    fetchOptionData()
  }, [currentStep, optionCategories.length])

  useEffect(() => {
    // 단계에 따라 프로그레스 바 업데이트
    setProgress(currentStep === 'menu' ? 50 : 100)
  }, [currentStep])

  // 메뉴 선택 버튼 활성화 여부
  const isMenuNextEnabled = selectedMenus.length > 0

  // 옵션 선택 버튼 활성화 여부 - 모든 카테고리에서 하나 이상 선택 확인
  const isOptionConfirmEnabled =
    optionCategories.length > 0 &&
    optionCategories.every(
      (category) => selectedOptions[category.categoryId] > 0,
    )

  const handleNextClick = async () => {
    if (currentStep === 'menu') {
      setCurrentStep('option')
    } else {
      try {
        setSubmitting(true)

        // 최종 선택 데이터 구성
        const preferredOptions: PreferredOptionProps[] = Object.entries(
          selectedOptions,
        )
          .filter(([_, itemId]) => itemId > 0) // 선택된 옵션만 필터링 (itemId가 0보다 큰 경우)
          .map(([categoryId, itemId]) => ({
            categoryId: Number(categoryId),
            itemId: itemId,
          }))

        const surveyData: SurveyRequestProps = {
          preferredMenuIds: selectedMenus,
          preferredOptions: preferredOptions,
        }

        // 폼 제출 처리
        console.log('선호도 조사 제출 데이터:', surveyData)

        // API로 데이터 전송
        const response = await requestSurvey(surveyData)
        console.log('선호도 조사 제출 응답:', response)

        // 성공 후 처리 (예: 메인 페이지로 리다이렉트 또는 완료 페이지로 이동)
        navigate('/home') // 또는 다른 페이지로 이동
      } catch (err) {
        console.error('선호도 조사 제출 중 오류:', err)
        setError('선호도 조사 제출 중 오류가 발생했습니다.')
      } finally {
        setSubmitting(false)
      }
    }
  }

  const handleMenuSelect = (menuId: number) => {
    setSelectedMenus((prev) => {
      // 이미 선택된 경우 제거
      if (prev.includes(menuId)) {
        return prev.filter((id) => id !== menuId)
      }
      // 아니면 추가
      return [...prev, menuId]
    })
  }

  const handleOptionSelect = (categoryId: number, itemId: number) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [categoryId]: itemId,
    }))
  }

  const headerText =
    currentStep === 'menu'
      ? '평소 자주 마셨던 메뉴를 골라주세요'
      : '음료의 옵션은 주로 어떤 선택을 하세요?'

  const buttonText = currentStep === 'menu' ? '다음' : '확인'
  const isButtonEnabled =
    (currentStep === 'menu' ? isMenuNextEnabled : isOptionConfirmEnabled) &&
    !submitting

  // 버튼 텍스트 - 제출 중일 때 "처리 중..."으로 변경
  const displayButtonText = submitting ? '처리 중...' : buttonText

  if (
    (loading && menuCategories.length === 0) ||
    (currentStep === 'option' && loading && optionCategories.length === 0)
  ) {
    return <LoadingMessage />
  }

  if (error) {
    return (
      <Container>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-red-500 font-bold">{error}</p>
            <button
              className="mt-4 bg-main text-white px-4 py-2 rounded-md"
              onClick={() => window.location.reload()}
            >
              다시 시도
            </button>
          </div>
        </div>
      </Container>
    )
  }

  return (
    <Container>
      <SurveyHeader title={headerText} progress={progress} />

      <ContentWrapper>
        {currentStep === 'menu' ? (
          <MenuSelectContent
            menuCategories={menuCategories}
            selectedMenus={selectedMenus}
            onMenuSelect={handleMenuSelect}
          />
        ) : (
          <OptionSelectContent
            optionCategories={optionCategories}
            selectedOptions={selectedOptions}
            onOptionSelect={handleOptionSelect}
          />
        )}
      </ContentWrapper>

      <ButtonWrapper>
        <MainButton
          text={displayButtonText}
          onClick={handleNextClick}
          disabled={!isButtonEnabled}
        />
      </ButtonWrapper>
    </Container>
  )
}
