export const clearAllStores = () => {
  // '-storage' 패턴의 모든 로컬 스토리지 항목을 찾아 제거합니다
  Object.keys(localStorage).forEach((key) => {
    if (key.endsWith('-storage')) {
      console.log(`스토어 초기화: ${key}`)
      localStorage.removeItem(key)
    }
  })
}
