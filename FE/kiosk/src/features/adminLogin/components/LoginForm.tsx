import { Text } from '@/styles/typography'
import tw from 'twin.macro'
import { useState, useRef } from 'react'
import Keyboard from 'react-simple-keyboard'
import 'react-simple-keyboard/build/css/index.css'
import { useNavigate } from 'react-router-dom'
import { useAdminLogin } from '../hooks/useAdminLogin'
import { useAdminStore } from '@/stores/adminStore'

const Box = tw.div`
  w-full mt-5 h-80
`

const FlexBox = tw.div`
  w-full flex flex-row items-center justify-between my-5
`
const Input = tw.input`
  w-full p-2.5 text-[20px] border border-gray rounded
`

const Button = tw.button`
  w-40 p-4 text-[20px] font-bold text-white bg-[#E0115F] rounded
`

const ErrorText = tw.div`
  mt-2 text-red-500 font-bold text-center
`

export default function LoginForm() {
  const reset = useAdminStore((s) => s.reset)
  const navigate = useNavigate()
  const { login } = useAdminLogin()
  const [errorMessage, setErrorMessage] = useState('')
  const [inputType, setInputType] = useState<'id' | 'password'>('id')
  const [form, setForm] = useState({ id: '', password: '' })
  const [layout, setLayout] = useState('default')
  const keyboardRef = useRef<any>(null)

  const handleShift = () => {
    const newLayoutName = layout === 'default' ? 'shift' : 'default'
    console.log('newLayoutName =>', newLayoutName)
    setLayout(newLayoutName)
  }

  const handleInputChange = (input: string) => {
    setForm((prev) => ({
      ...prev,
      [inputType]: prev[inputType] + input,
    }))
  }

  const handleKeyPress = (button: string) => {
    if (button === '{bksp}') {
      setForm((prev) => ({
        ...prev,
        [inputType]: prev[inputType].slice(0, -1),
      }))
    } else if (button === '{shift}' || button === '{lock}') {
      handleShift()
    } else if (
      button === '{enter}' ||
      button === '{tab}' ||
      button === '{space}'
    ) {
      return
    } else {
      handleInputChange(button)
    }
  }

  const handleLogin = async () => {
    reset()
    try {
      await login(form.id, form.password)
      setErrorMessage('')
      navigate('/user')
    } catch (err) {
      setErrorMessage('아이디 또는 비밀번호가 틀렸습니다.')
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="flex items-center justify-center py-4">
        <Text variant="title4" weight="bold">
          키오스크 로그인 (관리자)
        </Text>
      </div>

      <FlexBox>
        <div className="w-3/4">
          <FlexBox>
            <Text variant="body4" weight="bold" className="w-1/4">
              아이디
            </Text>
            <Input
              type="text"
              value={form.id}
              onFocus={() => setInputType('id')}
              readOnly
            />
          </FlexBox>

          <FlexBox>
            <Text variant="body4" weight="bold" className="w-1/4">
              비밀번호
            </Text>
            <Input
              type="password"
              value={form.password.replace(/./g, '•')}
              onFocus={() => setInputType('password')}
              readOnly
            />
          </FlexBox>
        </div>

        <Button onClick={handleLogin}>
          <Text variant="body4" weight="bold">
            로그인
          </Text>
        </Button>
      </FlexBox>

      {errorMessage && <ErrorText>{errorMessage}</ErrorText>}

      <Box>
        <Keyboard
          keyboardRef={(r) => (keyboardRef.current = r)}
          layoutName={layout}
          onKeyPress={handleKeyPress}
        />
      </Box>
    </div>
  )
}
