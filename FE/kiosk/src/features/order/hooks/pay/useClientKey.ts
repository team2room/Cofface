import { ClientKeyResponse } from '@/interfaces/PayInterface'
import { useEffect, useState } from 'react'
import { getClientKey } from '../../services/pay/keyService'

export const useClientKey = () => {
  const [clientKey, setClientKey] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchClientKey = async () => {
      try {
        setLoading(true)
        const data: ClientKeyResponse = await getClientKey()
        setClientKey(data.data.clientKey)
      } catch (err: any) {
        setError(err?.message || 'Client key fetch failed')
      } finally {
        setLoading(false)
      }
    }

    fetchClientKey()
  }, [])

  return { clientKey, loading, error }
}
