// 타입 정의
type DisplayTypeValue = 'default' | 'motion' | 'pay' | 'loading'

// 함수에 타입 명시
export const changeDisplayType = async (displayType: DisplayTypeValue) => {
  try {
    const response = await fetch('http://localhost:8080/display', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        display_type: displayType,
      }),
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error('디스플레이 변경 API 호출 실패:', error)
    throw error
  }
}
