// 인증번호 요청 인터페이스
export interface LoginRequestProps {
  name: string
  idNumberFront: string
  idNumberGender: string
  phoneNumber: string
  telecomProvider: string
}

// 로그인 요청 인터페이스
export interface LoginConfirmProps {
  verificationId: string
  phoneNumber: string
  verificationCode: string
}

// 로그인 입력 컴포넌트 인터페이스
export interface LoginInputProps {
  value: string
  onChange: (value: string) => void
  onComplete?: () => void
  inputRef?: React.RefObject<HTMLInputElement>
}
