// 인증번호 요청
export interface LoginRequestProps {
  name: string
  idNumberFront: string
  idNumberGender: string
  phoneNumber: string
  telecomProvider: string
}

// 인증번호 응답
export interface LoginResponseProps {
  verificationId: string
  expiresIn: number
}

// 로그인 확인 요청
export interface LoginConfirmProps {
  verificationId: string
  phoneNumber: string
  verificationCode: string
  name: string
  idNumberFront: string
  idNumberGender: string
  password: string
}

// 로그인 확인 응답
export interface LoginConfirmResponseProps {
  expiresIn: number // 초 단위로 들어옴. 기본 값: 30일
  accessToken: string
  tokenType: string
  user: userInfoProps
  refreshToken: string
}

// 회원 정보
export interface userInfoProps {
  id: string
  name: string
  phoneNumber: string
  birthDate: string
  password: string
  gender: string
}

// 토큰 리프레시 응답
export interface RefreshTokenResponseProps {
  accessToken: string
  tokenType: string
  expiresIn: number // 초 단위로 들어옴. 기본 값: 30일
}

// 로그인 입력 컴포넌트
export interface LoginInputProps {
  value: string
  onChange: (value: string) => void
  onComplete?: () => void
  inputRef?: React.RefObject<HTMLInputElement>
}
