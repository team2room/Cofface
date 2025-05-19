export interface FaceRecognitionResponse {
  phone_number: string
  success: boolean
  genderage: {
    age: number
    gender: string
  }
}

export interface User {
  id: string
  name: string
  phoneNumber: string
  birthDate: string
  gender: string
}

export interface GuestInfo {
  age: number
  gender: string
}

export interface WeatherInfo {
  dominant: string
  detail: string[]
}
