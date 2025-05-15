import { useAdminStore } from '@/stores/adminStore'
import { loginAdmin } from '../services/adminService'

export const useAdminLogin = () => {
  const setToken = useAdminStore((s) => s.setToken)

  const login = async (id: string, password: string) => {
    const { data } = await loginAdmin({ id, password })
    setToken(data.accessToken)
  }

  return { login }
}
