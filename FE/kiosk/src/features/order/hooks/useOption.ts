import { useEffect, useState } from 'react'
import { getMenuOption } from '../services/optionService'
import { MenuItemDetail } from '@/interfaces/OrderInterface'

export const useOption = (menuId: number) => {
  const [data, setData] = useState<MenuItemDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const detail = await getMenuOption(menuId)
        setData(detail)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetch()
  }, [menuId])

  return { data, loading, error }
}
