import api from '@/lib/axios'

interface AdminLoginRequest {
  id: string
  password: string
}

export const loginAdmin = async (data: AdminLoginRequest) => {
  const res = await api.post('/api/auth/admin/login', data)
  return res.data
}
