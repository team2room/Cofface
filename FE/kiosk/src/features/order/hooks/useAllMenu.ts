import { useState, useEffect } from 'react'
import { getAllMenus } from '../services/allMenuService'
import { MenuItem } from '@/interfaces/OrderInterface'

export const useAllMenu = (storeId: number) => {
  const [menus, setMenus] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const result = await getAllMenus(storeId)
        setMenus(result)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchMenus()
  }, [storeId])

  return { menus, loading, error }
}
