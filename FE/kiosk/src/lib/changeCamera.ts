export const changeCamera = async (enable: boolean) => {
  try {
    const response = await fetch('http://localhost:8080/camera', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        enable: enable ? 'True' : 'False',
      }),
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error('카메라 모드 변경 API 호출 실패:', error)
    throw error
  }
}
