import { useEffect, useState } from 'react'
import { Category } from '@/interfaces/OrderInterface'
import { getCategory } from '../services/categoryService'

export const useCategory = (storeId: number) => {
  const [category, setCategory] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getCategory(storeId)
        setCategory(data)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetch()
  }, [storeId])

  return { category, loading, error }
}
