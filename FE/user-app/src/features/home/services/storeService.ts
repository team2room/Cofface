import {
  RecentOrderInfo,
  StampInfo,
  TopOrderMenuInfo,
} from '@/interfaces/StoreInterfaces'
import apiRequester from '@/services/api'

export const getRecentOrders = async (
  storeId: number,
): Promise<RecentOrderInfo> => {
  try {
    const response = await apiRequester.get(
      `/api/orders/recent?storeId=${storeId}`,
    )
    return response.data.data
  } catch (error) {
    console.error('Recent Order 정보 조회 중 오류 발생:', error)
    throw error
  }
}

export const getTopOrders = async (
  storeId: number,
): Promise<TopOrderMenuInfo> => {
  try {
    const response = await apiRequester.get(
      `/api/user-orders/top-menus?storeId=${storeId}`,
    )
    return response.data.data
  } catch (error) {
    console.error('Top Order 정보 조회 중 오류 발생:', error)
    throw error
  }
}

export const getStampInfo = async (storeId: number): Promise<StampInfo> => {
  try {
    const response = await apiRequester.get(
      `/api/stamps/store?storeId=${storeId}`,
    )
    return response.data.data
  } catch (error) {
    console.error('Stamp 정보 조회 중 오류 발생:', error)
    throw error
  }
}
